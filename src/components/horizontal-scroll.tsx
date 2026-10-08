"use client"

import * as React from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

type HorizontalScrollValue = {
  /**
   * Прокрутить к разделу по его `id`.
   *
   * Обычный переход по якорю здесь не годится: браузер прокрутил бы
   * страницу до верха нужного блока, а блоки стоят в ряд по горизонтали.
   * Поэтому позиция раздела пересчитывается в вертикальную прокрутку:
   * доля пути до раздела отражается на положение рельса.
   */
  scrollToSection: (id: string, smooth?: boolean) => void
  /** Насколько трек длиннее экрана — нужно рельсу прогресса. */
  maxX: number
  /** Прогресс 0…1 по всей ленте. */
  progress: MotionValue<number>
}

const HorizontalScrollContext =
  React.createContext<HorizontalScrollValue | null>(null)

/**
 * Доступ к горизонтальному режиму.
 *
 * Возвращает `null`, если сайт свёрстан обычным вертикальным способом —
 * на это и рассчитаны все проверки в потребителях.
 */
export function useHorizontalScroll(): HorizontalScrollValue | null {
  return React.useContext(HorizontalScrollContext)
}

/**
 * ГОРИЗТОНТАЛЬНАЯ ПРОКРУТКА.
 *
 * Сайт разложен в одну длинную ленту разделов. Страница при этом
 * прокручивается вертикально, а лента сдвигается влево — так работает
 * приём «листай вниз, а сайт уезжает вправо».
 *
 * Устройство:
 *   • высокий контейнер высотой `100svh + ширина трека` — именно она
 *     даёт документу вертикальный путь прокрутки;
 *   • внутри липкий экран высотой в один viewport;
 *   • внутри него трек `w-max`, сдвигаемый трансформом по X.
 *
 * Ширина трека измеряется через ResizeObserver, а не берётся из
 * `100vw`: у разделов разная высота контента, и часть из них
 * прокручивается внутри своей панели.
 */
export function HorizontalScroll({
  children,
  background,
}: {
  children: React.ReactNode
  /**
   * Фон, который едет вместе с лентой. Рендерится внутри липкого экрана,
   * но вне трека, — чтобы фон видел тот же прогресс прокрутки и мог
   * двигаться в ту же сторону, что и содержимое.
   */
  background?: React.ReactNode
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [maxX, setMaxX] = React.useState(0)
  const jumpedToHash = React.useRef(false)

  // Замер длины ленты. Идёт в useLayoutEffect, чтобы высота контейнера
  // верная до первой отрисовки — иначе страница дёрнулась бы вниз.
  React.useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      // Именно clientWidth, а не innerWidth: innerWidth включает полосу
      // прокрутки документа, и из-за этого лента уезжала бы на её ширину
      // дальше нужного — в конце пути справа зияла бы пустая полоса.
      const viewport = document.documentElement.clientWidth
      setMaxX(Math.max(0, track.scrollWidth - viewport))
    }

    measure()

    const track = trackRef.current
    const observer = new ResizeObserver(measure)
    if (track) observer.observe(track)
    window.addEventListener("resize", measure)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Сдвиг ленты влево ровно на ту величину, на которую лента длиннее экрана.
  //
  // `prefers-reduced-motion` здесь намеренно не трогаем. Сдвиг идёт без
  // инерции и пружин — он связан с прокруткой один в один, без
  // дорисовки и догоняющих анимаций. Если выключить его, лента останется
  // неподвижной и обрезанной по краю экрана: до разделов дальше первого
  // экрана будет невозможно добраться. Статичная альтернатива — вертикальная
  // раскладка, но это уже другая вёрстка, а не отключение анимации.
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX])

  const scrollToSection = React.useCallback(
    (id: string, smooth = true) => {
      const target = document.getElementById(id)
      const container = containerRef.current
      if (!target || !container) return

      // Панели лежат внутри трека, который `relative`, поэтому offsetLeft
      // отсчитывается от начала ленты, а не от страницы.
      const left = target.offsetLeft
      const ratio = maxX > 0 ? Math.min(1, Math.max(0, left / maxX)) : 0
      const pageMax = Math.max(1, container.offsetHeight - window.innerHeight)

      window.scrollTo({
        top: ratio * pageMax,
        behavior: smooth ? "smooth" : "auto",
      })
      // Хэш меняем вручную: `behavior: smooth` иначе не даёт браузеру
      // начать собственный вертикальный переход.
      window.history.replaceState(null, "", `#${id}`)
    },
    [maxX]
  )

  // Переход по ссылке вида «#threats» превращаем в горизонтальную
  // прокрутку. Обработчик один на всю ленту, поэтому менять приходится
  // не двадцать ссылок в компонентах, а одно место здесь.
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.(
      'a[href^="#"]'
    ) as HTMLAnchorElement | null
    if (!anchor) return

    const href = anchor.getAttribute("href")
    if (!href || href === "#") return

    event.preventDefault()
    scrollToSection(href.slice(1))
  }

  // Если пришли по готовой ссылке вида site/#threats, докручиваемся
  // до нужной панели один раз — после того, как ширина ленты измерена.
  React.useEffect(() => {
    if (jumpedToHash.current) return
    const id = window.location.hash.slice(1)
    if (!id || maxX === 0) return

    jumpedToHash.current = true
    scrollToSection(id, false)
  }, [maxX, scrollToSection])

  const value = React.useMemo(
    () => ({ scrollToSection, maxX, progress: scrollYProgress }),
    [scrollToSection, maxX, scrollYProgress]
  )

  return (
    <HorizontalScrollContext.Provider value={value}>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `calc(100svh + ${maxX}px)` }}
      >
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: "100svh" }}
        >
          {background}

          <motion.div
            ref={trackRef}
            onClick={handleClick}
            style={{ x }}
            className="relative z-10 flex h-full w-max will-change-transform"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </HorizontalScrollContext.Provider>
  )
}
