import { BASE_DIMENSION } from '../config'
import { drawCover } from './image'

function paintBackground(ctx, W, H, bg, { original, bgImage, flatten }) {
  switch (bg.kind) {
    case 'color':
      ctx.fillStyle = bg.color
      ctx.fillRect(0, 0, W, H)
      break
    case 'gradient': {
      const gradient = ctx.createLinearGradient(0, 0, W, H)
      gradient.addColorStop(0, bg.gradient[0])
      gradient.addColorStop(1, bg.gradient[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'image':
      if (bgImage) drawCover(ctx, bgImage, W, H)
      break
    case 'blur':
      ctx.save()
      ctx.filter = `blur(${bg.blur * (W / BASE_DIMENSION)}px)`
      drawCover(ctx, original, W * 1.1, H * 1.1)
      ctx.restore()
      break
    default:
      if (flatten) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, W, H)
      }
  }
}

function paintGroundShadow(ctx, { cx, bottom, width }, shadow) {
  const radius = width / 2
  ctx.save()
  ctx.translate(cx, bottom)
  ctx.scale(1, 0.12)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  gradient.addColorStop(0, `rgba(0,0,0,${shadow.opacity})`)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintSubject(ctx, W, H, cutout, subject, shadow) {
  const fit = Math.min(W / cutout.width, H / cutout.height) * subject.scale
  const width = cutout.width * fit
  const height = cutout.height * fit
  const unit = W / BASE_DIMENSION
  const cx = subject.x * W
  const cy = subject.y * H

  if (shadow.kind === 'ground') paintGroundShadow(ctx, { cx, bottom: cy + height / 2, width }, shadow)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((subject.rotate * Math.PI) / 180)
  if (subject.flip) ctx.scale(-1, 1)
  ctx.filter = `brightness(${subject.brightness}%) contrast(${subject.contrast}%) saturate(${subject.saturate}%)`
  if (shadow.kind === 'drop') {
    ctx.shadowColor = `rgba(0,0,0,${shadow.opacity})`
    ctx.shadowBlur = shadow.blur * unit
    ctx.shadowOffsetY = shadow.offset * unit
  }
  ctx.drawImage(cutout, -width / 2, -height / 2, width, height)
  ctx.restore()
}

/**
 * Pure render of a scene onto a canvas context.
 * `flatten` fills transparent backgrounds with white (for formats without alpha).
 */
export function paintScene(ctx, { width: W, height: H }, scene, assets, { flatten = false } = {}) {
  ctx.clearRect(0, 0, W, H)
  paintBackground(ctx, W, H, scene.bg, { ...assets, flatten })
  if (assets.cutout) paintSubject(ctx, W, H, assets.cutout, scene.subject, scene.shadow)
}
