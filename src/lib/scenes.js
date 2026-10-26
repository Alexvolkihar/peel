// Procedural "mise en scène" backgrounds: no image assets, everything is drawn with gradients.

function linear(ctx, x0, y0, x1, y1, stops) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color))
  return gradient
}

function fill(ctx, style, x, y, w, h) {
  ctx.fillStyle = style
  ctx.fillRect(x, y, w, h)
}

function ellipse(ctx, cx, cy, rx, ry, style) {
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** Deterministic pseudo-random sequence, so a scene renders identically every frame. */
function seeded(seed) {
  let state = seed
  return () => (state = (state * 16807) % 2147483647) / 2147483647
}

export const SCENES = [
  {
    id: 'studio',
    label: 'Studio',
    paint(ctx, W, H) {
      const horizon = H * 0.72
      fill(ctx, linear(ctx, 0, 0, 0, horizon, [[0, '#f6f4ef'], [1, '#e2ddd2']]), 0, 0, W, horizon)
      fill(ctx, linear(ctx, 0, horizon, 0, H, [[0, '#cfc8ba'], [1, '#f1ece0']]), 0, horizon, W, H - horizon)
    },
  },
  {
    id: 'podium',
    label: 'Podium',
    paint(ctx, W, H, box) {
      fill(ctx, linear(ctx, 0, 0, W, H, [[0, '#ebe8ff'], [1, '#ffffff']]), 0, 0, W, H)
      const rx = Math.max(box.width * 0.62, W * 0.22)
      const ry = rx * 0.22
      const height = H * 0.14
      ellipse(ctx, box.cx, box.bottom + height + ry * 0.4, rx * 1.1, ry * 0.9, 'rgba(15,16,17,.12)')
      fill(ctx, linear(ctx, box.cx - rx, 0, box.cx + rx, 0, [[0, '#d9d4f5'], [0.5, '#ffffff'], [1, '#cfc9ef']]), box.cx - rx, box.bottom, rx * 2, height)
      ellipse(ctx, box.cx, box.bottom + height, rx, ry, '#cfc9ef')
      ellipse(ctx, box.cx, box.bottom, rx, ry, '#ffffff')
    },
  },
  {
    id: 'bois',
    label: 'Table en bois',
    paint(ctx, W, H) {
      const horizon = H * 0.62
      fill(ctx, linear(ctx, 0, 0, 0, horizon, [[0, '#f3efe8'], [1, '#e6dfd2']]), 0, 0, W, horizon)
      fill(ctx, linear(ctx, 0, horizon, 0, H, [[0, '#b98a5a'], [1, '#8a5f38']]), 0, horizon, W, H - horizon)
      const random = seeded(7)
      for (let i = 0; i < 14; i++) {
        const y = horizon + random() * (H - horizon)
        fill(ctx, `rgba(60,35,15,${0.05 + random() * 0.08})`, 0, y, W, 1 + random() * 2)
      }
    },
  },
  {
    id: 'sunset',
    label: 'Coucher de soleil',
    paint(ctx, W, H) {
      fill(ctx, linear(ctx, 0, 0, 0, H, [[0, '#ffd9e8'], [0.55, '#f5b63d'], [1, '#ff4040']]), 0, 0, W, H)
      ellipse(ctx, W / 2, H * 0.62, W * 0.16, W * 0.16, 'rgba(255,255,255,.55)')
    },
  },
  {
    id: 'nuit',
    label: 'Nuit',
    paint(ctx, W, H) {
      fill(ctx, linear(ctx, 0, 0, 0, H, [[0, '#0f1011'], [1, '#492ffb']]), 0, 0, W, H)
      const random = seeded(42)
      for (let i = 0; i < 60; i++) {
        ellipse(ctx, random() * W, random() * H * 0.75, 1 + random() * 2, 1 + random() * 2, `rgba(255,255,255,${0.3 + random() * 0.6})`)
      }
    },
  },
]

export const findScene = (id) => SCENES.find((scene) => scene.id === id)
