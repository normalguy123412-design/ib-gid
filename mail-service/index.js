/**
 * ПОЧТОВЫЙ СЕРВИС ДЕМОНСТРАЦИИ 2FA.
 *
 * Запускается на сервере хостинга: панель сама ставит зависимости и
 * запускает этот файл командой `node index.js`.
 *
 * ГЛАВНОЕ ПРО ДИЗАЙН
 *
 * Код придумывает браузер, и он же виден на экране. Это осознанно:
 * демонстрация показывает, как выглядит подтверждение по почте, а не
 * настоящая двухфакторная защита. Настоящая система держит код в тайне от
 * того, кто его вводит, и хранит его только у себя и на устройстве.
 * Поэтому хранилища, срока жизни и сверки здесь нет, и добавлять их
 * незачем: как только код перестаёт быть виден, половина демонстрации
 * теряет смысл.
 *
 * ПОЧЕМУ ГОТОВЫЙ ЯЗЫК НЕ ВЗЯТ
 *
 * Требовалась одна-две строки роутинга. Вместо этого используется
 * стандартный node:http: единственная внешняя зависимость — nodemailer,
 * и та нужна ради TLS. Чем меньше чего ставится на сервер, тем меньше
 * может сломаться при развёртывании, а разворачивается это руками.
 *
 * ЧТО ЗДЕСЬ ВАЖНО НЕ ЗАБЫТЬ
 *
 *   • Секреты только в переменных окружения. В коде их нет, в
 *     репозиторий они не попадают, а `.env` закрыт в `.gitignore`.
 *
 *   • Проверка источника запроса на сервере, а не только заголовком CORS.
 *     Заголовок лишь запрещает браузеру показать ответ — запрос всё
 *     равно уходит. Без проверки любой сайт слал бы письма от вашего
 *     имени, пока открыта ваша вкладка.
 *
 *   • Ограничение частоты. Эндпоинт публичный, и без счётчиков через
 *     него можно было бы слать письма кому угодно. Два счётчика: по
 *     адресу отправителя и по адресу получателя. Второй важнее — без
 *     него через сайт можно завалить почту конкретному человеку.
 */

const http = require("node:http")
const fs = require("node:fs")
const path = require("node:path")
const crypto = require("node:crypto")

/* ------------------------------------------------------------------ *
 * Чтение .env
 *
 * Панель хостинга умеет записывать файл .env прямо на сервер, и это
 * удобно: секреты лежат отдельным файлом, а не в настройках панели.
 *
 * Но полагаться на встроенную поддержку Node нельзя: флаг --env-file
 * появился только в версии 20.6, а на сервере стоит 19.9. Файл был бы
 * записан, прочитан никем не был бы, и сервис упал бы с «не заданы
 * переменные» — при том что настройки вводились верно.
 *
 * Поэтому читаем файл сами, десятью строками и без зависимостей.
 * Уже заданные переменные окружения не трогаем: то, что пришло из
 * панели или командной строки, имеет приоритет, иначе файл мог бы молча
 * перебить настройки, заданные администратором сервера.
 * ------------------------------------------------------------------ */

function loadEnv(file) {
  let raw

  try {
    raw = fs.readFileSync(file, "utf8")
  } catch {
    return
  }

  for (const line of raw.split(/\r?\n/)) {
    // Невидимый символ в начале строки пропускаем: «Блокнот» и часть
    // редакторов сохраняют файл в UTF-8 с меткой порядка байтов. Из-за
    // неё первая строка не распозналась бы, SMTP_HOST молча пропал бы,
    // и сервис упал бы с «не задана переменная» — хотя человек всё ввёл
    // верно и искал бы ошибку в своём коде.
    const trimmed = line.trim().replace(/^﻿/, "")
    if (!trimmed || trimmed.startsWith("#")) continue

    const match = trimmed.match(/^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
    if (!match) continue

    const key = match[1]
    let value = match[2].trim()

    // Кавычки снимаются вместе с содержимым внутри: иначе в значении
    // остались бы кавычки и адрес отправителя оказался бы неверным.
    const quoted =
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)

    if (quoted) value = value.slice(1, -1)

    /*
      Предупреждение о пробелах без кавычек. Пароль приложения Google
      показывают четырьмя группами через пробелы, и пробелы в него не
      входят. Скопировав его «как есть», человек получит неверный пароль
      и упрётся в «Invalid credentials», не понимая почему. Сообщаем
      только имя переменной: само значение — секрет, и оно в лог не
      попадает ни при каких условиях.
    */
    if (!quoted && /\s/.test(value)) {
      console.warn(
        `Внимание: значение ${key} содержит пробелы, а кавычек не было.` +
          " Проверьте, не скопирован ли пароль приложения вместе с" +
          " разделителями групп — пробелы в нём лишние."
      )
    }

    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnv(path.join(__dirname, ".env"))

/* ------------------------------------------------------------------ *
 * Настройки
 *
 * Ничего не подставляем по умолчанию: если переменной нет, сервис обязан
 * упасть при старте с внятным текстом, а не молча работать и ничего не
 * слать. Молчаливый отказ — худший вид поломки, его видно только по
 * отсутствию письма.
 * ------------------------------------------------------------------ */

const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]

const missing = required.filter((name) => !process.env[name])

if (missing.length) {
  console.error(
    "Не заданы переменные окружения: " + missing.join(", ") +
      "\nЗадайте их в настройках сервера и перезапустите его."
  )
  process.exit(1)
}

/*
  Требуем nodemailer только после проверки переменных. Порядок неслучаен:
  если человек забыл настроить сервер, он должен увидеть внятное
  «не заданы переменные», а не падение Node с «Cannot find module».
  Самая частая ошибка обязана давать самый понятный ответ.
*/
const nodemailer = require("nodemailer")

/**
 * Порт и адрес.
 *
 * Панель пишет, что приложение должно слушать назначенный порт и
 * 0.0.0.0, а не только 127.0.0.1: привязка к локальному адресу оставит
 * сервис недоступным снаружи, и поддомен будет показывать пустоту.
 */
const PORT = Number(process.env.PORT ?? 11678)
const HOST = process.env.HOST ?? "0.0.0.0"

/** Адрес сайта, которому разрешено обращаться к сервису. */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? ""

/**
 * Страница самопроверки.
 *
 * ПОЧЕМУ ТОКЕН, А НЕ ПРОСТО ЗАКРЫТАЯ СТРАНИЦА
 *
 * Здесь можно написать письмо на любой адрес. Без токена такая форма
 * стала бы почтовым шлюзом: ею пользовался бы любой, кто узнает адрес
 * вашего сервера, и рассылал бы письма от вашего имени. Токен придумывает
 * сам сервис и печатает в консоль — её видите только вы.
 *
 * Адреса отправителя в форме нет намеренно: он берётся из настроек, и
 * подделать его отправкой нельзя.
 */
const TEST_TOKEN = process.env.TEST_TOKEN || crypto.randomBytes(12).toString("hex")
const tokenGenerated = !process.env.TEST_TOKEN

/** Куда уходят письма самопроверки. */
const TEST_TO = process.env.TEST_TO || process.env.SMTP_USER || ""

/** Сравнение токена за постоянное время: обычное сравнение строк успевает
 *  отличаться на первом несовпавшем символе, и по времени ответа можно
 *  подбирать токен по одному символу. */
function tokenMatches(candidate) {
  const given = Buffer.from(String(candidate ?? ""))
  const expected = Buffer.from(TEST_TOKEN)

  if (given.length !== expected.length) return false
  return crypto.timingSafeEqual(given, expected)
}

/** Экранирование для вставки в HTML. */
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const randomCode = () =>
  Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("")

/* ------------------------------------------------------------------ *
 * Страница самопроверки
 *
 * Стили внутри, одной строкой: тянуть отдельный файл ради одной
 * страницы незачем, а на сервере тем меньше файлов, которые могут
 * разъехаться.
 * ------------------------------------------------------------------ */

function testPage(note, ok, recipient, code) {
  const color = ok === null ? "#a1a1aa" : ok ? "#34d399" : "#f87171"

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Проверка отправки — ИБ-Гид</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:grid; place-items:center;
         background:#0a0a0a; color:#e4e4e7;
         font:15px/1.6 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
         padding:24px; }
  .card { width:100%; max-width:460px; background:#18181b; border:1px solid #27272a;
          border-radius:14px; padding:28px; }
  h1 { margin:0 0 4px; font-size:19px; }
  .sub { margin:0 0 22px; color:#a1a1aa; font-size:13px; }
  dl { display:grid; grid-template-columns:auto 1fr; gap:8px 16px;
       margin:0 0 22px; font-size:13px; }
  dt { color:#a1a1aa; }
  dd { margin:0; overflow-wrap:anywhere; }
  label { display:block; margin:0 0 6px; color:#a1a1aa; font-size:13px; }
  input { width:100%; padding:11px 13px; margin:0 0 12px; border-radius:10px;
          border:1px solid #3f3f46; background:#0a0a0a; color:#fafafa;
          font:15px inherit; }
  input:focus { outline:2px solid #52525b; outline-offset:1px; }
  button { width:100%; padding:12px 16px; border:0; border-radius:10px;
           background:#fafafa; color:#18181b; font:600 15px inherit; cursor:pointer; }
  button:hover { background:#e4e4e7; }
  .code { font:600 30px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;
          letter-spacing:.35em; margin:8px 0 0; }
  .note { margin:18px 0 0; font-size:13px; color:${color}; overflow-wrap:anywhere; }
  .hint { margin:24px 0 0; padding-top:16px; border-top:1px solid #27272a;
          color:#71717a; font-size:12px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Проверка отправки</h1>
    <p class="sub">Письмо уходит тем же путём, что и на сайте.</p>

    <dl>
      <dt>Отправитель</dt><dd>${escapeHtml(process.env.MAIL_FROM ?? process.env.SMTP_USER)}</dd>
      <dt>Сервер</dt><dd>${escapeHtml(process.env.SMTP_HOST ?? "")}:${escapeHtml(process.env.SMTP_PORT ?? "587")}</dd>
      <dt>Ограничение</dt><dd>10 писем в час с одного адреса, 3 — на один ящик</dd>
    </dl>

    <form method="post" action="/?key=${escapeHtml(TEST_TOKEN)}">
      <label for="email">Кому отправить</label>
      <input id="email" name="email" type="email" required autocomplete="off"
             placeholder="you@example.com" value="${escapeHtml(recipient)}">
      <button type="submit">Отправить письмо</button>
    </form>

    ${note ? `<p class="note">${escapeHtml(note)}</p>` : ""}
    ${ok ? `<p class="code">${escapeHtml(code)}</p>
           <p class="note">Код в письме — тот, что показан выше. Сверьте, что
           он совпадает: так проверяется вся цепочка от нажатия до входящих.</p>` : ""}

    <p class="hint">Страница закрыта токеном, который напечатан в логе сервера
    при запуске. Адрес отправителя здесь не выбирается — он взят из настроек,
    подделать его отправкой нельзя.</p>
  </div>
</body>
</html>`
}

/* ------------------------------------------------------------------ *
 * Письмо
 * ------------------------------------------------------------------ */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  // 465 — шифрование сразу при подключении, 587 — STARTTLS после.
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Текст письма.
 *
 * В письме сказано, что код виден на экране: иначе получатель решит,
 * что это настоящая проверка, и на защите это будет ложью.
 */
function buildMessage(code) {
  const text = [
    "Это демонстрация двухфакторной аутентификации с сайта «ИБ-Гид».",
    "",
    "Ваш код: " + code,
    "",
    "Важно: код виден на экране сайта — настоящая система так не делает.",
    "Она держит код в тайне от того, кто его вводит, и хранит его",
    "только у себя и на устройстве пользователя.",
    "",
    "Проект — школьная работа об информационной безопасности,",
    "письмо отправлено с адреса автора проекта.",
  ].join("\n")

  const html = `<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:24px;background:#0a0a0a;
               font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
               color:#e4e4e7;line-height:1.5">
    <div style="max-width:480px;margin:0 auto;background:#18181b;
                border:1px solid #27272a;border-radius:12px;padding:24px">
      <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;
                text-transform:uppercase;color:#a1a1aa">
        ИБ-Гид · демонстрация 2FA
      </p>
      <h1 style="margin:0 0 20px;font-size:20px;font-weight:600">Код подтверждения</h1>
      <p style="margin:0 0 8px;color:#a1a1aa;font-size:14px">Ваш код:</p>
      <p style="margin:0 0 20px;font-size:34px;font-weight:700;letter-spacing:.4em;
                font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fafafa">
        ${code}
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa">
        Код виден на экране сайта — настоящая система так не делает.
        Она держит код в тайне от того, кто его вводит, и хранит его
        только у себя и на устройстве пользователя.
      </p>
      <p style="margin:0;font-size:14px;color:#a1a1aa">
        Проект — школьная работа об информационной безопасности,
        письмо отправлено с адреса автора проекта.
      </p>
    </div>
  </body>
</html>`

  return { text, html }
}

/* ------------------------------------------------------------------ *
 * Ограничение частоты
 * ------------------------------------------------------------------ */

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_IP = 10
const MAX_PER_EMAIL = 3

const hits = { ip: new Map(), email: new Map() }

function count(map, key, limit) {
  const now = Date.now()
  const list = (map.get(key) ?? []).filter((time) => now - time < WINDOW_MS)

  if (list.length >= limit) {
    map.set(key, list)
    return false
  }

  list.push(now)
  map.set(key, list)
  return true
}

// Подчистка протухших ключей, иначе карта растёт бесконечно.
setInterval(() => {
  const now = Date.now()
  for (const map of [hits.ip, hits.email]) {
    for (const [key, list] of map) {
      const fresh = list.filter((time) => now - time < WINDOW_MS)
      if (fresh.length) map.set(key, fresh)
      else map.delete(key)
    }
  }
}, WINDOW_MS).unref()

/* ------------------------------------------------------------------ *
 * Общие части ответа
 * ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CODE_RE = /^\d{6}$/

/**
 * Предел размера тела запроса.
 *
 * Запрос отправляет адрес и шесть цифр — это меньше сотни байт. Всё, что
 * длиннее, отбрасывается: без предела через сервис можно было бы впихнуть
 * в него несколько мегабайт и занять память сервера, которого на тарифе
 * всего 512 МиБ.
 */
const MAX_BODY_BYTES = 4096

function reply(res, status, payload, origin) {
  if (origin && ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
  }
  // Ответ не должен попасть в кэш: иначе следующий запрос с того же
  // адреса получил бы чужой результат.
  res.setHeader("Cache-Control", "no-store")
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(payload))
}

/**
 * Тело запроса.
 *
 * Формат зависит от того, кто спрашивает. Сайт присылает JSON, а обычная
 * HTML-форма браузера — urlencoded, и это разные вещи: json-запросом
 * разобрать её нельзя, получится «не почта». Раньше здесь принимался
 * только JSON, и отправка со страницы проверки не работала вовсе.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ""
    let tooLarge = false

    req.on("data", (chunk) => {
      if (tooLarge) return
      raw += chunk

      if (raw.length > MAX_BODY_BYTES) {
        tooLarge = true
        reject(new Error("too-large"))
        req.destroy()
      }
    })

    req.on("end", () => {
      if (tooLarge) return

      const contentType = String(req.headers["content-type"] ?? "")

      if (!raw) return resolve({})

      try {
        if (contentType.includes("application/json")) {
          resolve(JSON.parse(raw))
          return
        }

        if (contentType.includes("application/x-www-form-urlencoded")) {
          resolve(Object.fromEntries(new URLSearchParams(raw)))
          return
        }

        resolve(JSON.parse(raw))
      } catch {
        reject(new Error("bad-json"))
      }
    })

    req.on("error", reject)
  })
}

/* ------------------------------------------------------------------ *
 * Обработка
 * ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin

  if (req.method === "OPTIONS") {
    if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) {
      return reply(res, 403, { ok: false, reason: "forbidden" })
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Access-Control-Max-Age", "600")
    return reply(res, 204, {}, origin)
  }

  // Проверка здоровья: с неё начинается диагностика, если что-то не так.
  if (req.url === "/health" || req.url === "/api/health") {
    return reply(res, 200, { ok: true }, origin)
  }

  /*
    Страница самопроверки.

    Без верного токена отвечаем 404, а не 403: разница кодов сказала бы
    посетителю, что страница существует и просто закрыта.
  */
  if (req.url === "/" || req.url.startsWith("/?")) {
    const given = new URL(req.url, "http://localhost").searchParams.get("key")

    if (!tokenMatches(given)) {
      return reply(res, 404, { ok: false, reason: "not-found" }, origin)
    }

    // Открытие страницы ничего не отправляет: письмо уходит только по
    // нажатию кнопки. Иначе каждый переход по ссылке слал бы письмо.
    if (req.method !== "POST") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      })
      return res.end(testPage("", null, TEST_TO, ""))
    }

    let body
    try {
      body = await readBody(req)
    } catch {
      body = {}
    }

    const email = String(body?.email ?? "").trim()

    if (!EMAIL_RE.test(email)) {
      res.writeHead(400, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      })
      return res.end(
        testPage("Адрес не похож на почтовый — проверьте написание.", false, email, "")
      )
    }

    // Те же счётчики, что и у основного эндпоинта: страница проверки
    // не должна быть обходным путём мимо ограничения частоты.
    const ip = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim()

    if (!count(hits.ip, ip || "unknown", MAX_PER_IP) || !count(hits.email, email.toLowerCase(), MAX_PER_EMAIL)) {
      res.writeHead(429, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      })
      return res.end(
        testPage(
          "Слишком много попыток: 10 писем в час с одного адреса и 3 на один ящик. Подождите.",
          false,
          email,
          ""
        )
      )
    }

    const code = randomCode()
    let note = ""
    let ok = false

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to: email,
        subject: "Проверка отправки — ИБ-Гид",
        ...buildMessage(code),
      })

      console.log(`проверка: письмо отправлено на ${email}`)
      ok = true
      note =
        "Письмо отправлено. Загляните в папку «Спам» — первое письмо от нового отправителя часто оказывается там."
    } catch (error) {
      console.error("Проверка не удалась:", error?.message ?? error)
      note = `Не отправлено: ${error?.message ?? error}`
    }

    res.writeHead(ok ? 200 : 502, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    })
    return res.end(testPage(note, ok, email, code))
  }

  if (req.url !== "/api/send-code") {
    return reply(res, 404, { ok: false, reason: "not-found" }, origin)
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return reply(res, 405, { ok: false, reason: "method" }, origin)
  }

  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) {
    return reply(res, 403, { ok: false, reason: "forbidden" }, origin)
  }

  let body
  try {
    body = await readBody(req)
  } catch (error) {
    const reason = error.message === "too-large" ? "too-large" : "bad-json"
    return reply(res, 400, { ok: false, reason }, origin)
  }

  const { email, code } = body ?? {}

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return reply(res, 400, { ok: false, reason: "bad-email" }, origin)
  }

  if (typeof code !== "string" || !CODE_RE.test(code)) {
    return reply(res, 400, { ok: false, reason: "bad-code" }, origin)
  }

  const ip = String(req.headers["x-forwarded-for"] ?? "")
    .split(",")[0]
    .trim()

  if (!count(hits.ip, ip || "unknown", MAX_PER_IP)) {
    return reply(res, 429, { ok: false, reason: "too-many-from-you" }, origin)
  }

  const recipient = email.toLowerCase()

  if (!count(hits.email, recipient, MAX_PER_EMAIL)) {
    return reply(res, 429, { ok: false, reason: "too-many-to-email" }, origin)
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to: recipient,
      subject: "Код подтверждения — ИБ-Гид",
      ...buildMessage(code),
    })

    console.log(`письмо отправлено на ${recipient}`)
    return reply(res, 200, { ok: true }, origin)
  } catch (error) {
    // Код в лог не пишется: логи читают те, кому код видеть не нужно.
    console.error("Не удалось отправить письмо:", error?.message ?? error)
    return reply(res, 502, { ok: false, reason: "mail-failed" }, origin)
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Почтовый сервис ИБ-Гид слушает ${HOST}:${PORT}`)
  console.log(`Отправитель: ${process.env.MAIL_FROM ?? process.env.SMTP_USER}`)
  console.log(`Разрешённый источник: ${ALLOWED_ORIGIN || "ЛЮБОЙ (задайте ALLOWED_ORIGIN)"}`)
  console.log(`Проверка отправки: https://<ваш-поддомен>/?key=${TEST_TOKEN}`)
  console.log(`  письма самопроверки идут на: ${TEST_TO || "адрес не задан (задайте TEST_TO)"}`)

  if (tokenGenerated) {
    console.log(
      "TEST_TOKEN не задан, токен придуман на этот запуск и сменится при" +
        " перезапуске. Задайте его в настройках, если нужен постоянный."
    )
  }
})

/*
  Падение сокета не должно ронять сервис. Без этих обработчиков одна
  оборванная отправка письма вышибала бы весь процесс, и сайт остался
  бы без кнопки отправки до перезапуска сервера.
*/
server.on("clientError", (_error, socket) => socket.destroy())
process.on("unhandledRejection", (reason) => {
  console.error("Необработанный отказ:", reason)
})