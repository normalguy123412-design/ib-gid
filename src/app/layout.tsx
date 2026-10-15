import type { Metadata } from "next"
import { Golos_Text, Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { site } from "@/lib/content"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

/*
  Golos Text — на заголовки.

  Гарнитура русская: кириллица в ней основная, а не дописанная к латинице,
  поэтому строчные «ч», «а» и «е» набраны так, как их рисуют для русского
  текста. Она заметно отличается от Inter по характеру — чуть шире и
  спокойнее, — но остаётся нейтральной: сайт про безопасность не должен
  выглядеть нарядно.

  Вес не указан: это переменный шрифт, и next сам подключит всю шкалу —
  заголовкам нужны и 500, и 600, и 700.
*/
const golos = Golos_Text({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: [
    "информационная безопасность",
    "ИБ",
    "триада CIA",
    "конфиденциальность",
    "целостность",
    "доступность",
    "фишинг",
    "MFA",
  ],
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "ru_RU",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${golos.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Слабый ли это прибор — решается здесь, до первой отрисовки.

          Скрипт стоит в разметке, а не в модуле, потому что ответ нужен
          раньше, чем загрузится хоть один компонент: иначе первая секунда
          прошла бы в полном режиме с размытием и тремя холстами, и слабый
          прибор успел бы дёрнуться ровно там, где это заметнее всего —
          на первом экране.

          Он синхронный и крошечный: несколько проверок и один класс на
          <html>. Дальше по этому классу размытие отключает CSS, а холсты
          берут меньшую плотность пикселей — см. src/lib/quality.ts.
          Ошибка здесь не должна ломать страницу, поэтому всё в try.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var n = navigator;
                  var m = n.deviceMemory || 8;
                  var c = n.hardwareConcurrency || 8;
                  var slow =
                    window.matchMedia("(update: slow)").matches ||
                    (n.connection && n.connection.saveData === true) ||
                    c <= 2 ||
                    m <= 2 ||
                    (c <= 4 && m <= 4);
                  if (slow) document.documentElement.classList.add("quality-low");
                } catch (e) {}
              })();
            `,
          }}
        />
        {/*
          Секции появляются с анимацией Framer Motion, поэтому в исходной
          разметке они прозрачны. Если JavaScript отключён, принудительно
          показываем их содержимое — иначе страница останется пустой.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}