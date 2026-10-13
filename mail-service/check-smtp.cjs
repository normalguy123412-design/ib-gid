/**
 * ПРОВЕРКА ИСХОДЯЩЕЙ СВЯЗИ.
 *
 * Скрипт ничего не настраивает и никуда ничего не отправляет — он только
 * смотрит, дойдёт ли письмо. Запускать нужно ТАМ ЖЕ, где будет жить
 * почтовый сервис, потому что ответ зависит от сети: с домашнего
 * компьютера порт открыт, с сервера может быть закрыт, и наоборот.
 *
 *   node check-smtp.js
 *   node check-smtp.js --host smtp.gmail.com --port 587
 *
 * Смысл каждой проверки — в том, что по её результату можно отличить
 * разные поломки, а не просто «ничего не работает»:
 *
 *   • Нет интернета вообще            → виноват хост, почта ни при чём.
 *   • Есть HTTPS, но SMTP закрыт      → хост режет исходящие на почтовые
 *                                      порты. Самый частый случай.
 *   • Нет исходящего DNS              → SMTP не заработает ни при каких
 *                                      настройках, дальше можно не идти.
 *   • Порт открыт, но пустой          → кто-то отвечает, но это не почта.
 *   • Порт открыт, баннер и EHLO есть → слать можно.
 *
 * Зависимостей нет намеренно: на сервере может не работать npm, а для
 * диагностики это лишняя причина не запуститься.
 */

/*
  Всё это время скрипт был написан на import — и сразу сломался на сервере.
  Причина: панель запускает файл как CommonJS, потому что рядом нет
  package.json, и Node ругается на import.

  Отсюда правило, которому стоит следовать всему, что запускается на чужом
  сервере: расширение .cjs и require. Такое имя Node читает как CommonJS
  всегда — и при наличии package.json с "type": "module", и без него.
  Скрипт должен работать там, где мы ничего не настроили.
*/
const dns = require("node:dns/promises")
const net = require("node:net")

/* ------------------------------------------------------------------ *
 * Что проверяем по умолчанию
 *
 * Gmail нужен как основной кандидат, Яндекс и Mail.ru — потому что из
 * России до них доставляемость выше, чем с западного IP. Порт 465 включён
 * отдельной строкой: если 587 закрыт, иногда открыт 465, а это тот же
 * Gmail, просто с TLS сразу.
 * ------------------------------------------------------------------ */

const DEFAULT_TARGETS = [
  { name: "Gmail (587, STARTTLS)", host: "smtp.gmail.com", port: 587 },
  { name: "Gmail (465, TLS сразу)", host: "smtp.gmail.com", port: 465 },
  { name: "Яндекс (587)", host: "smtp.yandex.ru", port: 587 },
  { name: "Mail.ru (587)", host: "smtp.mail.ru", port: 587 },
]

/** Сколько ждём ответа на каждое действие, мс. */
const TIMEOUT = 8000

/* ------------------------------------------------------------------ *
 * Мелочи вывода
 * ------------------------------------------------------------------ */

const ok = (s) => `[32m${s}[0m`
const bad = (s) => `[31m${s}[0m`
const dim = (s) => `[2m${s}[0m`
const warn = (s) => `[33m${s}[0m`

function parseArgs() {
  const args = process.argv.slice(2)
  const host = args.includes("--host") ? args[args.indexOf("--host") + 1] : null
  const port = args.includes("--port")
    ? Number(args[args.indexOf("--port") + 1])
    : null

  if (host && port) {
    return [{ name: `${host}:${port} (задано вручную)`, host, port }]
  }

  return DEFAULT_TARGETS
}

/* ------------------------------------------------------------------ *
 * Чтение ответа SMTP
 *
 * Ответ многострочный: каждая строка, кроме последней, на позиции 4
 * содержит дефис, а последняя — пробел. Так и признаём конец.
 * ------------------------------------------------------------------ */

/**
 * Ответ многострочный: каждая строка, кроме последней, на позиции 4
 * содержит дефис, а последняя — пробел.
 *
 * Этого правила оказалось мало: Gmail в списке возможностей не отдаёт
 * AUTH, хотя поддерживает его, — значит ответ приходил не в том порядке,
 * в котором ожидался, и разбор обрывался, не дойдя до конца. Поэтому
 * вторая страховка — ждать тишины: если данные больше не идут, ответ
 * закончен, каким бы он ни был.
 */
function readResponse(socket, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    let buffer = ""
    let silence

    const finish = (error, value) => {
      clearTimeout(timer)
      clearTimeout(silence)
      socket.off("data", onData)
      socket.off("error", onError)
      socket.off("close", onClose)
      if (error) reject(error)
      else resolve(value)
    }

    const onData = (chunk) => {
      buffer += chunk.toString("utf8")
      clearTimeout(silence)
      silence = setTimeout(() => finish(null, buffer), 1200)

      if (/\r?\n\d{3} /.test(buffer)) finish(null, buffer)
    }

    const onError = (error) => finish(error)
    const onClose = () => finish(null, buffer)

    const timer = setTimeout(() => finish(null, buffer), timeout)

    socket.on("data", onData)
    socket.on("error", onError)
    socket.on("close", onClose)
  })
}

const describeError = (error) => {
  switch (error?.code) {
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return "не найден DNS-имя"
    case "ECONNREFUSED":
      return "соединение отклонено (порт закрыт)"
    case "ETIMEDOUT":
      return "превышено время ожидания"
    case "EHOSTUNREACH":
    case "ENETUNREACH":
      return "нет маршрута к сети"
    case "ECONNRESET":
      return "соединение разорвано"
    default:
      return error?.code ?? String(error)
  }
}

/* ------------------------------------------------------------------ *
 * Проверка одного сервера
 * ------------------------------------------------------------------ */

async function probe(target) {
  const label = `${target.host}:${target.port}`.padEnd(28)
  const result = { ...target, state: "unknown", detail: "" }

  // 1. DNS. Без него дальше идти бессмысленно.
  try {
    result.address = (await dns.lookup(target.host)).address
  } catch (error) {
    result.state = "dns"
    result.detail = describeError(error)
    console.log(`  ${label} ${bad("НЕТ DNS")}  ${dim(result.detail)}`)
    return result
  }

  // 2. Соединение.
  let socket
  try {
    socket = await new Promise((resolve, reject) => {
      const s = net.connect({ host: target.host, port: target.port })
      const timer = setTimeout(() => {
        s.destroy()
        reject(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }))
      }, TIMEOUT)

      s.once("connect", () => {
        clearTimeout(timer)
        resolve(s)
      })
      s.once("error", (error) => {
        clearTimeout(timer)
        reject(error)
      })
    })
  } catch (error) {
    result.state = "closed"
    result.detail = describeError(error)
    console.log(`  ${label} ${bad("ЗАКРЫТ")}  ${dim(result.detail)}`)
    return result
  }

  // 3. Баннер: сервер сам объявляет себя строкой 220.
  let banner
  try {
    banner = (await readResponse(socket)).trim()
  } catch (error) {
    result.state = "closed"
    result.detail = describeError(error)
    console.log(`  ${label} ${bad("ЗАКРЫТ")}  ${dim(result.detail)}`)
    return result
  }

  /*
    Порт 465 — это тот же почтовый сервер, но он ждёт TLS сразу при
    подключении и ничего не говорит открытым текстом. Пустой ответ здесь
    означает не «порт закрыт», а «открыт и ждёт шифрование»: списывать
    его как поломку нельзя.
  */
  if (!banner) {
    result.state = "tls-only"
    result.detail = "открыт, но ждёт TLS сразу (обычный признак порта 465)"
    console.log(`  ${label} ${warn("ОТКРЫТ, ЖДЁТ TLS")}  ${dim(result.detail)}`)
    socket.destroy()
    return result
  }

  if (!/^220\b/.test(banner)) {
    result.state = "wrong"
    result.detail = banner.split("\r\n")[0]
    console.log(`  ${label} ${warn("ОТВЕЧАЕТ НЕ ПОЧТА")}  ${dim(result.detail)}`)
    socket.destroy()
    return result
  }

  // 4. EHLO — список того, что сервер умеет.
  socket.write("EHLO check-smtp\r\n")

  let ehlo
  try {
    ehlo = await readResponse(socket)
  } catch (error) {
    ehlo = ""
    result.detail = describeError(error)
  }

  const capabilities = ehlo
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.slice(4).trim())
    .filter(Boolean)

  socket.destroy()

  if (!/^250\b/.test(ehlo.trim())) {
    result.state = "wrong"
    result.detail = `EHLO не принят: ${ehlo.trim().split(/\r?\n/)[0]}`
    console.log(`  ${label} ${warn("ПОРТ ОТКРЫТ, НО EHLO НЕ ПРИНЯТ")}`)
    return result
  }

  result.state = "open"
  result.capabilities = capabilities
  result.detail = banner.split(/\r?\n/)[0]

  const useful = capabilities.filter((line) =>
    /^(STARTTLS|AUTH|8BITMIME|SIZE|PLAIN)/i.test(line)
  )

  console.log(
    `  ${label} ${ok("ОТКРЫТ")}  ${dim(result.detail.slice(0, 52))}`
  )

  // Сырой ответ нужен, когда сервер пишет нестандартно: по урезанному
  // списку легко сделать вывод, будто сервер не умеет чего-то умеет.
  if (process.argv.includes("--verbose")) {
    console.log(
      ehlo
        .trim()
        .split(/\r?\n/)
        .map((line) => `      ${dim(line)}`)
        .join("\n")
    )
  }

  console.log(
    `  ${" ".repeat(28)} ${dim(`умеет: ${useful.join(" · ") || "ничего не сообщил"}`)}`
  )

  /*
    Gmail и Mail.ru не показывают AUTH в баннере, хотя входят только по
    паролю. Это не поломка: они объявляют его только ПОСЛЕ того, как
    поднят TLS, а поднимать его надо через STARTTLS. Без этой оговорки
    легко сделать вывод, что сервер не годится для входа.
  */
  const hasAuth = capabilities.some((line) => /^AUTH\b/i.test(line))
  const hasStartTls = capabilities.some((line) => /^STARTTLS\b/i.test(line))

  if (!hasAuth && hasStartTls) {
    console.log(
      `  ${" ".repeat(28)} ${dim("AUTH не объявлен — сервер ждёт его после STARTTLS, это обычное дело")}`
    )
  }

  if (!hasAuth && !hasStartTls && target.port === 587) {
    console.log(
      `  ${" ".repeat(28)} ${warn("ни AUTH, ни STARTTLS — вход по паролю скорее всего невозможен")}`
    )
  }

  return result
}

/* ------------------------------------------------------------------ *
 * Интернет в целом
 *
 * Проверяем HTTPS тем самым хостом, через который пойдёт API почтового
 * провайдера. Ответ 401 здесь — не беда: значит сеть доехала и сервис
 * ответил, просто без ключа. Беда — если таймаут или ошибка соединения.
 * ------------------------------------------------------------------ */

async function checkInternet() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    const response = await fetch("https://api.brevo.com", {
      signal: controller.signal,
    })
    clearTimeout(timer)
    console.log(
      `  ${"api.brevo.com".padEnd(28)} ${ok("ДОСТУПЕН")}  ${dim(`ответил HTTP ${response.status} — сеть доехала, ключа у нас нет`)}`
    )
    return true
  } catch (error) {
    console.log(`  ${"api.brevo.com".padEnd(28)} ${bad("НЕДОСТУПЕН")}  ${dim(error?.name ?? String(error))}`)
    return false
  }
}

/* ------------------------------------------------------------------ *
 * Итог
 * ------------------------------------------------------------------ */

function verdict(results, internet) {
  console.log("\n" + "─".repeat(64))

  const open = results.filter((r) => r.state === "open")

  if (!internet) {
    console.log(bad("Итог: с этого узла нет интернета."))
    console.log("Порт 587 здесь ничего не значит — сначала сеть.")
    return
  }

  if (open.length) {
    console.log(ok("Итог: отправлять почту отсюда можно."))
    console.log(`Подойдёт: ${open.map((r) => `${r.host}:${r.port}`).join(", ")}`)
    console.log(dim("Дальше: подключить nodemailer и слать через smtp."))
    return
  }

  const noDns = results.filter((r) => r.state === "dns")
  if (noDns.length === results.length) {
    console.log(bad("Итог: нет исходящего DNS."))
    console.log("SMTP не заработает при любых настройках.")
    return
  }

  console.log(bad("Итог: почтовые порты закрыты."))
  console.log(
    dim("Интернет есть, но исходящие соединения на почту хост не пускает.")
  )
  console.log(
    dim("Значит вариант с почтой на этом узле невозможен — берите Telegram-бота.")
  )
}

/* ------------------------------------------------------------------ *
 * Запуск
 * ------------------------------------------------------------------ */

async function main() {
  console.log(warn("Проверка исходящей связи"))
  console.log(dim(`узел: ${(await dns.lookup("localhost")).address}   node: ${process.version}`))

  console.log("\nИнтернет в целом")
  const internet = await checkInternet()

  console.log("\nПочтовые порты")
  const targets = parseArgs()
  const results = []
  for (const target of targets) {
    results.push(await probe(target))
  }

  verdict(results, internet)
}

main().catch((error) => {
  console.error(bad(`Проверка упала: ${error?.message ?? error}`))
  process.exitCode = 1
})