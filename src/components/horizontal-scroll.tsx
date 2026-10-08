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
  overlay,
}: {
  children: React.ReactNode
  /**
   * Фон, который едет вместе с лентой. Рендерится внутри липкого экрана,
   * но вне трека, — чтобы фон видел тот же прогресс прокрутки и мог
   * двигаться в ту же сторону, что и содержимое.
   */
  background?: React.ReactNode
  /**
   * Элементы поверх ленты: нижняя полоса прогресса и подобное.
   *
   * Им обязательно нужен контекст прогресса, поэтому просто положить их
   * рядом с HorizontalScroll нельзя — снаружи провайдера рельс не видел бы
   * прогресс и считал бы активный раздел по вертикали, где у всех панелей
   * одинаковый верх. При этом внутрь самого трека их класть тоже нельзя:
   * трек трансформирован, а над transform `position: fixed` начинает
   * отсчитываться не от экрана, а от трека, и полоса уехала бы вбок.
   * Липкий экран трансформации не имеет, поэтому слот безопасный.
   */
  overlay?: React.ReactNode
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  /**
   * Геометрия ленты в пикселях.
   *
   * Высота экрана хранится явно, а не через `100svh`: единицы viewport
   * и `innerHeight` иногда расходятся, и из-за этого сдвиг ленты переставал
   * быть один к одному с прокруткой — переходы уезжали мимо цели.
   */
  const [metrics, setMetrics] = React.useState({
    viewportWidth: 0,
    viewportHeight: 0,
    maxX: 0,
  })
  const maxX = metrics.maxX
  const jumpedToHash = React.useRef(false)

  // Замер геометрии ленты. Идёт в useLayoutEffect, чтобы высота контейнера
  // была верной до первой отрисовки — иначе страница дёрнулась бы вниз.
  React.useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      // Именно clientWidth/clientHeight, а не innerWidth/innerHeight:
      // последние включают полосы прокрутки. Из-за этого лента уезжала
      // дальше нужного, а в конце пути справа зияла пустая полоса.
      const size = document.documentElement
      setMetrics({
        viewportWidth: size.clientWidth,
        viewportHeight: size.clientHeight,
        maxX: Math.max(0, track.scrollWidth - size.clientWidth),
      })
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
      if (!target || maxX === 0) return

      // Контейнер выше высоты экрана ровно на maxX, поэтому диапазон
      // прокрутки страницы тоже maxX — и один пиксель прокрутки сдвигает
      // ленту ровно на пиксель. Значит нужная позиция равна смещению
      // панели от начала ленты, без всяких долей и пересчётов.
      //
      // Раньше здесь стояло `левая граница / maxX * (высота − экран)`,
      // и эта формула ломалась: высоты считались разными способами
      // (`svh` и `innerHeight`), из-за чего переход уезжал на следующий
      // раздел — тем дальше, чем дальше была цель.
      window.scrollTo({
        top: target.offsetLeft,
        behavior: smooth ? "smooth" : "auto",
      })
      // Хэш меняем вручную: иначе браузер начнёт собственный переход.
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

  /**
   * Шаг по панелям клавишами-стрелками.
   *
   * Без этого приходилось бы подкручивать колёсико точно до нужного
   * раздела. Нажатие вправо переходит на следующую панель, влево — на
   * предыдущую, то есть ровно на один шаг ленты.
   */
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
      // В полях ввода стрелки должны двигать курсор, а не сайт.
      const target = event.target as HTMLElement | null
      if (
        target?.closest?.("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }

      const panels = Array.from(
        trackRef.current?.querySelectorAll<HTMLElement>("[data-panel]") ?? []
      )
      if (!panels.length) return

      // Текущая панель — последняя, чей левый край уже пройден.
      const position = window.scrollY
      let index = 0
      panels.forEach((panel, i) => {
        if (panel.offsetLeft <= position + 1) index = i
      })

      const next =
        event.key === "ArrowRight"
          ? Math.min(index + 1, panels.length - 1)
          : Math.max(index - 1, 0)

      if (next === index) return
      event.preventDefault()
      scrollToSection(panels[next].id)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [scrollToSection])

  const value = React.useMemo(
    () => ({ scrollToSection, maxX, progress: scrollYProgress }),
    [scrollToSection, maxX, scrollYProgress]
  )

  return (
    <HorizontalScrollContext.Provider value={value}>
      {/* Контейнер выше экрана ровно на ширину ленты: благодаря этому
          диапазон прокрутки страницы равен maxX, а сдвиг ленты идёт
          один к одному с прокруткой. */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${metrics.viewportHeight + maxX}px` }}
      >
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: `${metrics.viewportHeight}px` }}
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

          {overlay}
        </div>
      </div>
    </HorizontalScrollContext.Provider>
  )
}
