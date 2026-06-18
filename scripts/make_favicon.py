#!/usr/bin/env python3
"""Generate CW&T-style favicons: a solid agent-red circle on transparent bg,
circle diameter = 50% of width, centered."""
from PIL import Image, ImageDraw

COLOR = (176, 58, 46, 255)  # #b03a2e

def make(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    d = size * 0.5
    x0 = (size - d) / 2
    y0 = (size - d) / 2
    draw.ellipse([x0, y0, x0 + d, y0 + d], fill=COLOR)
    return img

make(16).save("favicon-16x16.png")
make(32).save("favicon-32x32.png")
make(180).save("apple-touch-icon.png")
# Multi-size .ico
make(64).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("favicons written")
