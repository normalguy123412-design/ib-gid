"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Зона у нижней кромки окна, с которой док поднимается.
 *
 * Док постоянно висел бы внизу и закрывал собой содержимое последнего
 * экрана. Поэтому он спрятан за нижней кромкой и выезжает, только когда
 * курсор подходит близко — как панель задач в macOS.
 */
const REVEAL_ZONE = 120

export type DockAction = {
  key: string
  label: string
  icon: LucideIcon
  onSelect: () => void
  active?: boolean
  /**
   * Признак-разделитель. Объявлен и у обычного пункта — иначе TypeScript
   * не сужает объединение по `entry.separator`.
   */
  separator?: false
}

export type DockSeparator = { key: string; separator: true }

export type DockEntry = DockAction | DockSeparator

/**
 * Всплывающая подпись.
 *
 * Позиционирование вынесено в обычную обёртку, а анимируется только
 * содержимое. В исходном варианте и `-translate-x-1/2`, и `animate={{y}}`
 * работали через `transform`, и motion перезаписывал сдвиг по X — подпись
 * уезжала вбок от кнопки.
 */
function DockTooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2">
        <AnimatePresence>
          {visible ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="mb-2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-lg"
            >
              {content}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Кнопка дока: при наведении подпрыгивает и растёт, у активного раздела
 * остаётся постоянная подсветка — иначе в доке из семи кнопок непонятно,
 * где вы находитесь.
 */
function DockItem({
  children,
  tooltip,
  active,
}: {
  children: React.ReactNode
  tooltip: string
  active?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, y: -8 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      <DockTooltip content={tooltip}>{children}</DockTooltip>
      {active ? (
        <span className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-sky-400" />
      ) : null}
    </motion.div>
  )
}

function DockDivider() {
  return <span aria-hidden className="mx-1 h-8 w-px bg-border" />
}

function DockButton({
  label,
  active,
  onSelect,
  children,
}: {
  label: string
  active?: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className={cn(
        "grid size-12 place-items-center rounded-full transition-colors",
        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        active ? "text-sky-400" : "text-foreground/70 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

/**
 * ДОК В СТИЛЕ macOS.
 *
 * Нижняя панель навигации. Прячется за нижней кромкой окна и поднимается,
 * когда курсор подходит к низу экрана.
 */
export function MacOsDock({
  entries,
  progress = 0,
  onScrub,
}: {
  entries: DockEntry[]
  /** Доля пройденного пути 0…1. */
  progress?: number
  /** Перемотка страницы по позиции указателя на линии прогресса. */
  onScrub?: (ratio: number) => void
}) {
  // На сенсорном экране курсора нет: прятать док незачем, он виден сразу.
  // Значение берётся прямо при первом рендере, а не в эффекте — иначе док
  // появлялся бы кадром позже, уже после отрисовки.
  const [revealed, setRevealed] = React.useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover)").matches
  )
  const [hovered, setHovered] = React.useState(false)
  const lineRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return

    const last = { current: false }

    const onMove = (event: PointerEvent) => {
      const next = event.clientY > window.innerHeight - REVEAL_ZONE
      // Состояние меняем только на переходах через границу зоны, иначе
      // док перерисовывался бы на каждом движении мыши.
      if (next !== last.current) {
        last.current = next
        setRevealed(next)
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  const open = revealed || hovered

  const scrubTo = (clientX: number) => {
    const el = lineRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onScrub?.(ratio)
  }

  return (
    // Скрытый док не должен перехватывать клики внизу экрана, поэтому
    // события на обёртке выключены, а сам док их включает.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Клавиатура не знает про курсор: при фокусе на доке он тоже раскрыт.
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false)
      }}
    >
      <motion.div
        initial={false}
        animate={{ y: open ? 0 : "130%", opacity: open ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="pointer-events-auto flex flex-col items-center gap-1 pb-2"
      >
        <div className="flex items-center gap-1 rounded-2xl border bg-background/80 px-4 py-3 shadow-lg backdrop-blur-lg">
          {entries.map((entry) =>
            entry.separator ? (
              <DockDivider key={entry.key} />
            ) : (
              <DockItem
                key={entry.key}
                tooltip={entry.label}
                active={entry.active}
              >
                <DockButton
                  label={entry.label}
                  active={entry.active}
                  onSelect={entry.onSelect}
                >
                  <entry.icon className="size-4" />
                </DockButton>
              </DockItem>
            )
          )}
        </div>

        {onScrub ? (
          <div
            ref={lineRef}
            role="presentation"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              scrubTo(event.clientX)
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                scrubTo(event.clientX)
              }
            }}
            className="h-1 w-56 cursor-grab touch-none rounded-full bg-foreground/10 active:cursor-grabbing"
          >
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}
