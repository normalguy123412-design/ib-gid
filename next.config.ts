import path from "node:path"
import type { NextConfig } from "next"

/**
 * Путь, под которым сайт живёт на хостинге.
 *
 * Локально переменная не задана — префикс пустой и `npm run dev` открывается
 * на http://localhost:3000/. В CI для GitHub Pages передаётся /<имя-репозитория>,
 * потому что проект публикуется в подкаталоге https://<user>.github.io/<repo>/.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Статическая генерация: на выходе папка out/ со всем HTML/CSS/JS,
 * которую можно выложить на любой хостинг без Node.js.
 */
const output = "export"

/**
 * Partial Prerendering (cacheComponents + partialPrefetching) умеет
 * отдавать страницу сразу и догружать части на клиенте, но requires
 * сервер на рантайме. В режиме export это несовместимо — Next падает
 * с «PPR cannot be enabled in export mode», поэтому в статике выключаем.
 */
const isExport = output === "export"

const nextConfig: NextConfig = {
  output,
  basePath,
  // Для статики next/image не умеет оптимизировать — картинки отдаём как есть.
  images: { unoptimized: true },
  // GitHub Pages отдаёт каталоги, поэтому слеши обязательны.
  trailingSlash: true,
  cacheComponents: !isExport,
  partialPrefetching: !isExport,
  turbopack: {
    root: path.resolve("."),
    rules: {
      /*
        Загрузчик Tailwind подключается ТОЛЬКО к входному stylesheet
        проекта — globals.css, который импортирует layout.tsx.

        Раньше здесь стоял шаблон «*.css», и он ловил любой css в проекте.
        В том числе code-slots.module.css: модуль уходил в Tailwind как
        обычный стиль, класс-неймы не подставлялись, и компонент получал
        на каждом элементе styles.root === undefined. Поле ввода кода
        оставалось совсем без оформления: невидимое поле ввода вставало
        в поток, а не поверх ячеек, и набирать код было нечем.

        Шаблон записан как «*globals.css», а не «src/app/globals.css»:
        пути Turbopack сопоставляет целиком, и точный относительный путь
        не совпал — загрузчик не применился вовсе, и сборка падала на
        неизвестных директивах @theme. Суффикс не зависит ни от корня,
        ни от разделителя в пути. Глобальных css в проекте ровно два —
        этот и сам модуль, так что под шаблон больше никто не попадает.
      */
      "*globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig