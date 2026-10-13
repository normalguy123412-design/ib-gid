/**
 * ПРОВЕРКА ОТПРАВКИ С КОМАНДНОЙ СТРОКИ.
 *
 * Отправляет одно настоящее письмо и печатает, что ответил почтовый
 * сервер. Нужен, чтобы проверить «у себя» — без сервера, без
 * задеплоенного index.js, без панели.
 *
 * Зачем это отдельно от страницы проверки:
 *
 *   • отвечает на вопрос «работает ли мой пароль» — самая частая причина
 *     молчаливого отказа, и на сервере её не отличить от «сервер не так
 *     настроен»;
 *   • показывает ответ почтового сервера дословно, а не «что-то пошло
 *     не так». Страница на сайте эту подробность прячет: пользователю
 *     она не нужна, а при настройке — нужна очень.
 *
 *   node check-send.cjs
 *   node check-send.cjs strahsasa08@gmail.com
 *
 * Читает .env рядом с собой — тот же файл, что и сервис.
 */

const fs = require("node:fs")
const path = require("node:path")
const nodemailer = require("nodemailer")

/*
  Разбор .env здесь намеренно повторяет такой же, как в index.js: файла
  два, и каждый должен работать сам по себе. Общий модуль означал бы,
  что на сервер пришлось бы класть лишний файл, а диагностический
  скрипт из-за этого нельзя было бы запустить, не разобравшись с
  устройством сервиса.
*/
function loadEnv(file) {
  let raw

  try {
    raw = fs.readFileSync(file, "utf8")
  } catch {
    return false
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim().replace(/^﻿/, "")
    if (!trimmed || trimmed.startsWith("#")) continue

    const match = trimmed.match(/^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
    if (!match) continue

    const key = match[1]
    let value = match[2].trim()

    const quoted =
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)

    if (quoted) value = value.slice(1, -1)

    if (!(key in process.env)) process.env[key] = value
  }

  return true
}

/** Что обычно означает тот или иной ответ почтового сервера. */
function explain(error) {
  const text = String(error?.message ?? error)
  const code = String(error?.responseCode ?? error?.code ?? "")

  if (/535|BadCredentials|Invalid login/i.test(text)) {
    return [
      "Пароль не принят.",
      "Почти всегда это основной пароль ящика вместо пароля приложения.",
      "У Gmail он выдаётся в аккаунте: Безопасность → Двухэтапная",
      "аутентификация → Пароли приложений → Создать пароль приложения.",
      "У Яндекса — Аккаунт → Безопасность → Пароли приложений.",
    ].join("\n  ")
  }

  if (/550|User unknown|Recipient/i.test(text)) {
    return "Ящик не найден. Проверьте адрес: опечатка в одной букве не проходит."
  }

  if (/ETIMEDOUT|ETIMEDOUT|connection/i.test(text)) {
    return "Не дозвонились до почтового сервера. Проверьте хост и порт."
  }

  if (/530|Authentication must be sent/i.test(text)) {
    return [
      "Сервер требует шифрование. Обычно лечится портом 587 вместо 25.",
      "Проверьте, что SMTP_PORT действительно 587.",
    ].join("\n  ")
  }

  if (code === "ECONNREFUSED") {
    return "Порт закрыт. Обычно это порт 25, который хостинги режут."
  }

  return "Ответ сервера выше — с ним и стоит разбираться."
}

const REQUIRED = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]

async function main() {
  const found = loadEnv(path.join(__dirname, ".env"))

  if (!found) {
    console.log("Файл .env не найден рядом с этим скриптом.")
    console.log("Создайте его — образец в .env.example.")
    process.exitCode = 1
    return
  }

  const missing = REQUIRED.filter((name) => !process.env[name])

  if (missing.length) {
    console.log("В .env не заданы: " + missing.join(", "))
    process.exitCode = 1
    return
  }

  const to = (process.argv[2] ?? process.env.TEST_TO ?? "").trim()

  if (!to) {
    console.log("Не указан получатель.")
    console.log("Запуск: node check-send.cjs адрес@почты")
    process.exitCode = 1
    return
  }

  console.log("Отправитель: " + (process.env.MAIL_FROM ?? process.env.SMTP_USER))
  console.log("Получатель:  " + to)
  console.log("Сервер:      " + process.env.SMTP_HOST + ":" + (process.env.SMTP_PORT ?? "587"))
  console.log("Пароль:      " + (process.env.SMTP_PASS ?? "").length + " знаков")
  console.log("")

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const code = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("")

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to,
      subject: "Проверка отправки — ИБ-Гид",
      text: "Проверка отправки.\n\nКод: " + code + "\n\nЕсли вы это читаете — отправка работает.",
      html:
        "<p>Проверка отправки.</p>" +
        '<p style="font:600 30px ui-monospace,monospace;letter-spacing:.3em">' +
        code +
        "</p>" +
        "<p>Если вы это читаете — отправка работает.</p>",
    })

    console.log("ПИСЬМО ОТПРАВЛЕНО")
    console.log("Код в письме: " + code + "  (сверьте, что он тот же)")
    console.log("Ответ сервера: " + (info.response ?? "—"))
  } catch (error) {
    console.log("НЕ ОТПРАВЛЕНО")
    console.log("")
    console.log("Ответ сервера: " + String(error?.message ?? error))
    console.log("")
    console.log("Что это значит:")
    console.log("  " + explain(error))
  }
}

main()