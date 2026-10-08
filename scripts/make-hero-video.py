"""Генерация фонового ролика для первого экрана сайта «ИБ-Гид».

Кадры рисуются в PIL и по конвейеру передаются в ffmpeg, который кодирует
их в mp4 (H.264, без звука). Отдельных промежуточных файлов не создаётся.

Анимация замкнута в цикл: положение любого объекта — функция фазы
`t/T` в диапазоне [0, 1), поэтому последний кадр бесшовно переходит
в первый и ролик зацикливается без заметного скачка.

Запуск из корня проекта:
    python scripts/make-hero-video.py

Требуются Pillow и ffmpeg в PATH.
"""

from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

# --- Параметры ролика -------------------------------------------------------

WIDTH, HEIGHT = 1280, 720
FPS = 24
SECONDS = 5
TOTAL_FRAMES = FPS * SECONDS

# Кадр, который сохраняется как заставка (см. main).
POSTER_FRAME = int(TOTAL_FRAMES * 0.35)

BG = (10, 11, 14)
DOT = (48, 60, 76)
LANE = (40, 52, 68)
PACKET_BODY = (40, 150, 210)
PACKET_HEAD = (195, 240, 255)
SCAN = (76, 194, 255)
RADAR = (70, 150, 205)

OUTPUT_DIR = Path("public/media")
OUTPUT_MP4 = OUTPUT_DIR / "hero.mp4"
OUTPUT_POSTER = OUTPUT_DIR / "hero-poster.jpg"

# --- Геометрия сцены -------------------------------------------------------

DOT_STEP = 40
LANE_TOP, LANE_BOTTOM, LANE_STEP = 140, 620, 60

# Пакеты: (смещение по фазе, скорость в долях ширины за цикл, яркость).
# Смещение и скорость задают равномерное движение: за цикл пакет проходит
# ровно одну ширину экрана, поэтому обратная перемотка не видна.
PACKETS = [
    (0.00, 1.0, 1.00),
    (0.10, 1.0, 0.55),
    (0.20, 1.0, 0.85),
    (0.30, 1.0, 0.62),
    (0.40, 1.0, 0.72),
    (0.50, 1.0, 0.50),
    (0.60, 1.0, 0.90),
    (0.70, 1.0, 0.58),
    (0.80, 1.0, 1.00),
    (0.90, 1.0, 0.65),
]


def build_vignette() -> Image.Image:
    """Затемнение по краям. Считается один раз и переиспользуется."""
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    px = mask.load()
    cx, cy = WIDTH / 2, HEIGHT / 2
    max_dist = math.hypot(cx, cy)
    for y in range(HEIGHT):
        for x in range(WIDTH):
            dist = math.hypot(x - cx, y - cy) / max_dist
            px[x, y] = int(min(255, max(0, (dist - 0.45) * 105)))
    return mask


def draw_frame(phase: float, vignette: Image.Image) -> Image.Image:
    """Один кадр. `phase` — положение внутри цикла от 0.0 до 1.0."""
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)

    # Точечная сетка — неподвижный фон, задаёт масштаб и глубину.
    for y in range(0, HEIGHT, DOT_STEP):
        for x in range(0, WIDTH, DOT_STEP):
            draw.rectangle((x, y, x + 1, y + 1), fill=DOT)

    # Дорожки, по которым идут пакеты данных.
    lanes = list(range(LANE_TOP, LANE_BOTTOM, LANE_STEP))
    for lane_y in lanes:
        draw.rectangle((0, lane_y, WIDTH, lane_y), fill=LANE)

    # Пакеты. За цикл каждый проходит ровно одну ширину экрана.
    for lane_index, lane_y in enumerate(lanes):
        for offset, speed, brightness in PACKETS:
            if (lane_index + int(offset * 10)) % 3 == 0 and brightness < 0.9:
                continue
            x = (offset + phase * speed) % 1.0
            px = x * (WIDTH + 80) - 40
            body = tuple(int(c * brightness) for c in PACKET_BODY)
            head = tuple(int(c * brightness) for c in PACKET_HEAD)
            draw.rectangle((px, lane_y - 2, px + 30, lane_y + 2), fill=body)
            draw.rectangle((px + 30, lane_y - 3, px + 37, lane_y + 3), fill=head)

    # Свечение рисуется на чёрном холсте и «зажигается» режимом screen.
    # Обычное наложение через alpha на почти чёрном фоне даёт еле заметную
    # серую вуаль, а screen складывает яркости и выглядит как реальный свет.
    glow = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)

    scan_y = phase * (HEIGHT + 320) - 160
    for offset in range(0, 320, 8):
        intensity = (1 - offset / 320) ** 2
        color = tuple(int(c * intensity * 0.6) for c in SCAN)
        y = int(scan_y + offset)
        if 0 <= y < HEIGHT:
            glow_draw.rectangle((0, y, WIDTH, y + 1), fill=color)

    for ring in range(3):
        t = (phase + ring / 3.0) % 1.0
        radius = t * 640
        intensity = (1 - t) ** 2
        color = tuple(int(c * intensity * 0.5) for c in RADAR)
        if radius > 6:
            glow_draw.ellipse(
                (
                    WIDTH / 2 - radius,
                    HEIGHT / 2 - radius * 0.62,
                    WIDTH / 2 + radius,
                    HEIGHT / 2 + radius * 0.62,
                ),
                outline=color,
                width=2,
            )

    image = ImageChops.screen(image, glow.filter(ImageFilter.GaussianBlur(5)))

    # Виньетка поверх всего, чтобы края не отвлекали от текста поверх ролика.
    # В `Image.composite` значение маски 0 берёт второй аргумент, поэтому
    # здесь первым идёт `dark`: маска равна 0 в центре (картинка цела)
    # и растёт к краям (края затемняются).
    dark = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    return Image.composite(dark, image, vignette)


def require(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        sys.exit(f"Не найден {tool}. Установите его и повторите.")
    return path


def main() -> None:
    ffmpeg = require("ffmpeg")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Рисую {TOTAL_FRAMES} кадров {WIDTH}x{HEIGHT}...")
    vignette = build_vignette()

    command = [
        ffmpeg,
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-profile:v",
        "main",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "30",
        "-preset",
        "slow",
        "-movflags",
        "+faststart",
        str(OUTPUT_MP4),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)

    for index in range(TOTAL_FRAMES):
        frame = draw_frame(index / TOTAL_FRAMES, vignette)
        process.stdin.write(frame.tobytes())

        # Заставку берём не с нулевого кадра, а примерно из трети цикла:
        # там уже видны и сканирующая полоса, и расходящиеся кольца.
        # Пока браузер не начал играть ролик, пользователь видит этот кадр.
        if index == POSTER_FRAME:
            frame.save(OUTPUT_POSTER, quality=82, optimize=True)

    process.stdin.close()
    if process.wait() != 0:
        sys.exit("ffmpeg завершился с ошибкой")

    size_kb = OUTPUT_MP4.stat().st_size / 1024
    poster_kb = OUTPUT_POSTER.stat().st_size / 1024
    print(f"Готово: {OUTPUT_MP4} ({size_kb:.0f} КБ)")
    print(f"Заставка: {OUTPUT_POSTER} ({poster_kb:.0f} КБ)")


if __name__ == "__main__":
    main()
