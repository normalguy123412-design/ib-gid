"use client"

import * as React from "react"
import { useTheme } from "next-themes"

/**
 * ГЛОБАЛЬНЫЙ АНИМИРОВАННЫЙ ФОН — «Сетевой экран ИБ».
 *
 * Фиксированный canvas на весь экран позади всего контента: движется сетка
 * тайлов, по ней бегут пакеты данных, сверху вниз идёт сканирующая волна,
 * в узлах расходятся пульсирующие кольца. Скорость мира зависит от скорости
 * прокрутки страницы — при быстром скролле фон разгоняется и плавно тормозит.
 *
 * Слой не перехватывает события мыши (pointer-events-none) и находится под
 * контентом, поэтому страница остаётся полностью кликабельной.
 * При `prefers-reduced-motion` рисуется один статичный кадр без анимации.
 */

/** Размер одного тайла в логических пикселях. */
const TILE = 56
/** Скорость слоёв фона в пикселях в секунду. */
const LAYER_SPEED = [13, 27] as const
/**
 * Через сколько рядов рисунок сетки повторяется.
 *
 * Нужно, потому что noise() считает sin(y * 311.7): при неограниченном росте
 * номера ряда аргумент синуса уходит в тысячи радиан, точность падает и сетка
 * со временем «рассыпается». Повтор за ~28 секунд на глаз незаметен.
 */
const ROW_CYCLE = 512
/** Длина светящейся полосы пакета. */
const PACKET_LEN = 76

/**
 * Подписи, которые едут вместе с пакетами данных — как на референсном сайте
 * (там это слой .world__labels). Текст короткий и понятный новичку,
 * чтобы фон не выглядел случайным набором символов.
 */
const SCENE_LABELS: { text: string; packet: number; tone: "accent" | "ok" }[] = [
  { text: "пароль", packet: 1, tone: "accent" },
  { text: "двухфакторный код", packet: 4, tone: "ok" },
  { text: "шифрование", packet: 7, tone: "accent" },
  { text: "резервная копия", packet: 10, tone: "ok" },
]

type Palette = {
  tileFill: string
  tileStroke: string
  grid: string
  packet: string
  packetTail: string
  node: string
  nodeRing: string
  scan: string
  scanEdge: string
}

/** Палитра под тему: холодные голубые на тёмном, синие на светлом. */
const PALETTES: Record<"light" | "dark", Palette> = {
  dark: {
    tileFill: "rgba(148,197,255,0.05)",
    tileStroke: "rgba(148,197,255,0.14)",
    grid: "rgba(148,197,255,0.05)",
    packet: "#7dd3fc",
    packetTail: "rgba(125,211,252,0)",
    node: "#34d399",
    nodeRing: "rgba(52,211,153,0.32)",
    scan: "rgba(125,211,252,0.045)",
    scanEdge: "rgba(125,211,252,0.18)",
  },
  light: {
    tileFill: "rgba(15,60,90,0.05)",
    tileStroke: "rgba(15,60,90,0.14)",
    grid: "rgba(15,60,90,0.05)",
    packet: "#0284c7",
    packetTail: "rgba(2,132,199,0)",
    node: "#059669",
    nodeRing: "rgba(5,150,105,0.3)",
    scan: "rgba(2,132,199,0.04)",
    scanEdge: "rgba(2,132,199,0.16)",
  },
}

/**
 * Детерминированный шум по координате.
 * Нужен, чтобы тайл всегда выглядел одинаково между кадрами — иначе
 * сетка мерцает, так как случайные числа пересоздавались бы каждый кадр.
 */
function noise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

type Packet = {
  x: number
  /** Позиция по вертикали в пикселях; значение меняется при прокрутке мира. */
  y: number
  /** Экранная координата Y, вычисляется в drawPackets. */
  screenY: number
  speed: number
  dir: 1 | -1
  alpha: number
}

type Node = {
  /** Доля ширины экрана, 0–1. */
  nx: number
  y: number
  phase: number
  period: number
}

export function SecurityWorld() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  /** DOM-подписи, следующие за пакетами: индекс пакета + сам элемент. */
  const labelsRef = React.useRef<
    { packetIndex: number; el: HTMLSpanElement | null }[]
  >([])
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme !== "light"

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const palette = dark ? PALETTES.dark : PALETTES.light
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let width = 0
    let height = 0
    let dpr = 1
    /** Число тайлов по горизонтали и вертикали с запасом на скругление. */
    let cols = 0
    let rows = 0

    /** Смещение мира по вертикали — растёт со временем. */
    let camY = 0
    /** Смещение мира по горизонтали — следует за курсором. */
    let camX = 0
    let pointerX = 0
    let targetPointerX = 0
    /** Добавочная скорость от прокрутки, затухает сама. */
    let boost = 0
    let lastScrollY = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      // Ограничиваем DPR: на 3x-экранах рисовать втрое дороже без видимой пользы.
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(width / TILE) + 2
      rows = Math.ceil(height / TILE) + 2
    }

    resize()

    // Пакеты: едут по рядам сетки в обе стороны.
    const packets: Packet[] = Array.from({ length: 14 }, (_, i) => {
      const a = noise(i, 7)
      const b = noise(i, 19)
      return {
        x: a * width,
        y: b * 2400,
        screenY: 0,
        speed: 28 + a * 40,
        dir: b > 0.5 ? 1 : -1,
        alpha: 0.3 + b * 0.5,
      }
    })

    // Узлы с расходящимися кольцами.
    const nodes: Node[] = Array.from({ length: 10 }, (_, i) => ({
      nx: noise(i, 3),
      y: noise(i, 11) * 2600,
      phase: noise(i, 23),
      period: 2.6 + noise(i, 31) * 3.4,
    }))

    /**
     * Тонкая сетка-подложка: едет вместе с тайлами, иначе фон распадается
     * на два слоя, которые двигаются с разной скоростью.
     */
    const drawGrid = () => {
      const scroll = camY * LAYER_SPEED[0]
      const base = Math.floor(scroll / TILE)
      const offset = scroll - base * TILE

      ctx.strokeStyle = palette.grid
      ctx.lineWidth = 1
      ctx.beginPath()
      const startX = ((camX % TILE) + TILE) % TILE
      for (let x = startX; x < width; x += TILE) {
        ctx.moveTo(Math.round(x) + 0.5, 0)
        ctx.lineTo(Math.round(x) + 0.5, height)
      }
      for (let r = -1; r <= rows; r++) {
        const y = Math.round(r * TILE - offset) + 0.5
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    }

    /**
     * Сетка тайлов в два слоя с разной скоростью — даёт параллакс.
     *
     * Важно: рисунок привязан к МИРОВОЙ строке (base + r), а не к позиции
     * на экране. Иначе при каждом переходе через границу TILE весь узор
     * перетасовывается и сетка «моргает».
     */
    const drawTiles = (layer: 0 | 1) => {
      const inset = layer === 0 ? 9 : 3
      const alphaScale = layer === 0 ? 0.9 : 1.6

      const scroll = camY * LAYER_SPEED[layer]
      const base = Math.floor(scroll / TILE)
      const offset = scroll - base * TILE

      ctx.lineWidth = 1
      for (let r = -1; r <= rows; r++) {
        const y = r * TILE - offset + inset
        // За пределами экрана (кроме первого ряда) можно не рисовать вовсе.
        if (y > height + TILE || y < -TILE * 2) continue
        const worldRow =
          (((base + r + layer * 11) % ROW_CYCLE) + ROW_CYCLE) % ROW_CYCLE

        for (let c = -1; c < cols; c++) {
          const n = noise(c + layer * 37, worldRow)
          // Рисуем только часть тайлов: остальное было бы визуальным шумом.
          if (n < 0.42) continue

          const x = c * TILE + camX + inset
          const size = TILE - inset * 2

          ctx.globalAlpha = (n - 0.42) * alphaScale
          ctx.fillStyle = palette.tileFill
          ctx.fillRect(x, y, size, size)

          if (n > 0.86) {
            ctx.strokeStyle = palette.tileStroke
            ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    /** Сканирующая волна: широкая мягкая полоса сверху вниз. */
    const drawScan = (time: number) => {
      const p = (time % 9) / 9
      const band = 320
      const y = p * (height + band * 2) - band
      const g = ctx.createLinearGradient(0, y - band, 0, y + band)
      g.addColorStop(0, palette.scan)
      g.addColorStop(0.5, palette.scanEdge)
      g.addColorStop(1, palette.scan)
      ctx.fillStyle = g
      ctx.fillRect(0, y - band, width, band * 2)
    }

    /**
     * Перенос мировой координаты в экранную с зацикливанием.
     *
     * Период равен целому числу рядов, поэтому пакет и узел при переходе
     * через нижний край появляются сверху ровно там, где были — без щелчка.
     */
    const wrapY = (worldY: number) => {
      const span = rows * TILE
      return (((worldY % span) + span) % span) + TILE / 2
    }

    /** Пакеты данных: полоса с затухающим хвостом и яркой головой. */
    const drawPackets = (dt: number) => {
      for (const p of packets) {
        p.x += p.speed * p.dir * dt
        if (p.x < -PACKET_LEN) p.x = width + PACKET_LEN
        if (p.x > width + PACKET_LEN) p.x = -PACKET_LEN

        const y = wrapY(p.y - camY * LAYER_SPEED[0])
        // Сохраняем экранную координату: по ней едут подписи слоя labels.
        p.screenY = y
        const x1 = p.x
        const x0 = p.x - PACKET_LEN * p.dir

        const g = ctx.createLinearGradient(x0, 0, x1, 0)
        g.addColorStop(0, palette.packetTail)
        g.addColorStop(1, palette.packet)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = g
        ctx.fillRect(Math.min(x0, x1), y - 1, PACKET_LEN, 2)

        ctx.globalAlpha = Math.min(1, p.alpha + 0.35)
        ctx.fillStyle = palette.packet
        ctx.fillRect(p.dir > 0 ? x1 - 3 : x1, y - 1.5, 3, 3)
      }
      ctx.globalAlpha = 1
    }

    /** Узлы сети: точка и расходящееся кольцо. */
    const drawNodes = (time: number) => {
      for (const n of nodes) {
        const x = n.nx * width
        const y = wrapY(n.y - camY * LAYER_SPEED[0])
        const t = ((time + n.phase * n.period) % n.period) / n.period

        ctx.globalAlpha = 0.75 * (1 - t)
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = palette.node
        ctx.fill()

        ctx.globalAlpha = (1 - t) * 0.7
        ctx.beginPath()
        ctx.arc(x, y, 3 + t * 26, 0, Math.PI * 2)
        ctx.strokeStyle = palette.nodeRing
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    /** Слой подписей: элементы следуют за пакетами, как .world__labels. */
    const moveLabels = () => {
      const nodes = labelsRef.current
      if (!nodes) return
      for (const { packetIndex, el } of nodes) {
        if (!el) continue
        const p = packets[packetIndex % packets.length]
        if (!p) continue
        // Небольшой вертикальный сдвиг, чтобы подпись не резала сам пакет.
        el.style.transform = `translate3d(${p.x}px, ${p.screenY - 16}px, 0)`
        // Гаснем у краёв экрана, чтобы подписи не резались о границы.
        const edge = Math.min(p.x / 120, (width - p.x) / 120, 1)
        el.style.opacity = String(Math.max(0, Math.min(1, edge)) * 0.9)
      }
    }

    /** Один полный кадр сцены. */
    const render = (dt: number, time: number) => {
      camY += (14 + boost * 110) * dt
      pointerX += (targetPointerX - pointerX) * 0.06
      camX = pointerX

      // Кадр очищаем полностью. Полупрозрачная заливка «поверх» старого кадра
      // копила бы призраки и тянула за объектами шлейфы.
      ctx.clearRect(0, 0, width, height)
      drawGrid()
      drawTiles(0)
      drawTiles(1)
      drawScan(time)
      drawPackets(dt)
      drawNodes(time)
      moveLabels()

      // Мир плавно замедляется после быстрой прокрутки.
      boost *= 0.94
    }

    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    // Быстрый скролл разгоняет фон; значение само затухает в render().
    const onScroll = () => {
      const y = window.scrollY
      boost = Math.max(boost, Math.min(1, Math.abs(y - lastScrollY) / 90))
      lastScrollY = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    // Лёгкий параллакс за курсором (только когда движение разрешено).
    const onPointerMove = (e: PointerEvent) => {
      targetPointerX = (e.clientX / window.innerWidth - 0.5) * 26
    }
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
    }

    const cleanup = () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointermove", onPointerMove)
    }

    if (reduceMotion) {
      // Статичный кадр: без requestAnimationFrame.
      render(0, 0)
      return cleanup
    }
    let frame = 0
    let last = performance.now()
    let time = 0

    const loop = (now: number) => {
      // Ограничиваем dt: после возврата на вкладку сцена не должна «прыгнуть».
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt
      render(dt, time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    // Не жжём процессор и батарею, пока вкладка не видна.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
      } else {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", onVisibility)
      cleanup()
    }
  }, [dark])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 animate-world-in"
    >
      {/* Подложка и свет сверху — статичный CSS-градиент на обёртке, чтобы
          canvas оставался прозрачным и кадры не наслаивались. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,var(--world-glow),transparent_70%)]" />

      <canvas ref={canvasRef} className="block size-full" />

      {/* Подписи, которые едут вместе с пакетами данных. */}
      <div className="absolute inset-0 overflow-hidden">
        {SCENE_LABELS.map((label, i) => (
          <span
            key={label.text}
            ref={(el) => {
              labelsRef.current[i] = { packetIndex: label.packet, el }
            }}
            className={
              "absolute left-0 top-0 whitespace-nowrap rounded-md border bg-background/70 px-2 py-1 font-mono text-[0.65rem] backdrop-blur-sm will-change-transform " +
              (label.tone === "accent"
                ? "border-sky-500/40 text-sky-600 dark:text-sky-300"
                : "border-emerald-500/40 text-emerald-600 dark:text-emerald-300")
            }
            style={{ opacity: 0 }}
          >
            {label.text}
          </span>
        ))}
      </div>
    </div>
  )
}