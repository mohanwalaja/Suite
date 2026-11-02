import type { Palette, Rect } from '../types'
import { alpha, rng } from '../color'
import type { Ctx } from '../draw'

export interface ArtContext {
  ctx: Ctx
  rect: Rect
  palette: Palette
  /** Unit scale: 1 at a 1080px short edge. */
  u: number
  seed: number
  /** Animation time in seconds (0 for static renders). */
  time: number
  /** 0 = simple, 1 = maximum engraving detail. */
  detail: number
}

export function center(a: ArtContext) {
  return { cx: a.rect.x + a.rect.w / 2, cy: a.rect.y + a.rect.h / 2, R: Math.min(a.rect.w, a.rect.h) / 2 }
}

/** Draw a leaf/petal pointing up from (0,0) in local space. */
export function petalPath(
  ctx: Ctx,
  r0: number,
  r1: number,
  halfWidth: number,
  curve = 0.62,
) {
  ctx.beginPath()
  ctx.moveTo(0, -r0)
  ctx.bezierCurveTo(halfWidth, -(r0 + (r1 - r0) * curve), halfWidth * 0.62, -r1, 0, -r1)
  ctx.bezierCurveTo(-halfWidth * 0.62, -r1, -halfWidth, -(r0 + (r1 - r0) * curve), 0, -r0)
  ctx.closePath()
}

export function radialRepeat(
  ctx: Ctx,
  cx: number,
  cy: number,
  count: number,
  draw: (index: number, angle: number) => void,
  offset = 0,
) {
  for (let i = 0; i < count; i++) {
    const angle = offset + (i / count) * Math.PI * 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    draw(i, angle)
    ctx.restore()
  }
}

export function tickRing(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  count: number,
  length: number,
  color: string,
  width = 1,
  offset = 0,
  majorEvery = 0,
  majorLength = 0,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  for (let i = 0; i < count; i++) {
    const a = offset + (i / count) * Math.PI * 2
    const len = majorEvery > 0 && i % majorEvery === 0 ? majorLength : length
    const x1 = cx + Math.cos(a) * radius
    const y1 = cy + Math.sin(a) * radius
    const x2 = cx + Math.cos(a) * (radius - len)
    const y2 = cy + Math.sin(a) * (radius - len)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
  }
  ctx.stroke()
  ctx.restore()
}

export function ring(ctx: Ctx, cx: number, cy: number, r: number, color: string, width = 1, dash: number[] = []) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function softDisc(ctx: Ctx, cx: number, cy: number, r: number, color: string, inner = 0.05) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(0.1, r))
  g.addColorStop(0, alpha(color, 0.55))
  g.addColorStop(Math.max(0.02, inner), alpha(color, 0.3))
  g.addColorStop(0.55, alpha(color, 0.09))
  g.addColorStop(1, alpha(color, 0))
  ctx.save()
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function constellation(
  ctx: Ctx,
  rect: Rect,
  count: number,
  color: string,
  seed: number,
  u: number,
  linkDistance: number,
) {
  const rand = rng(seed)
  const pts: Array<{ x: number; y: number; r: number }> = []
  for (let i = 0; i < count; i++) {
    pts.push({
      x: rect.x + rand() * rect.w,
      y: rect.y + rand() * rect.h,
      r: (0.8 + rand() * 2.1) * u,
    })
  }
  ctx.save()
  ctx.strokeStyle = alpha(color, 0.28)
  ctx.lineWidth = Math.max(0.5, u * 0.9)
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
      if (d < linkDistance) {
        ctx.globalAlpha = 0.32 * (1 - d / linkDistance)
        ctx.beginPath()
        ctx.moveTo(pts[i].x, pts[i].y)
        ctx.lineTo(pts[j].x, pts[j].y)
        ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1
  for (const p of pts) {
    ctx.fillStyle = alpha(color, 0.9)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = alpha(color, 0.18)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** Simple engraved flame used by lamps and devotional motifs. */
export function flame(ctx: Ctx, cx: number, baseY: number, height: number, width: number, colors: [string, string]) {
  const g = ctx.createLinearGradient(cx, baseY - height, cx, baseY)
  g.addColorStop(0, colors[0])
  g.addColorStop(0.55, colors[1])
  g.addColorStop(1, alpha(colors[1], 0.15))
  ctx.save()
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(cx, baseY - height)
  ctx.bezierCurveTo(cx + width * 1.5, baseY - height * 0.55, cx + width, baseY - height * 0.1, cx, baseY)
  ctx.bezierCurveTo(cx - width, baseY - height * 0.1, cx - width * 1.5, baseY - height * 0.55, cx, baseY - height)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function kalasam(ctx: Ctx, x: number, y: number, size: number, color: string, filled = true) {
  // Temple finial: base bulb, neck, lotus, spike.
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(0.6, size * 0.05)
  ctx.beginPath()
  ctx.arc(0, -size * 0.32, size * 0.24, 0, Math.PI * 2)
  if (filled) ctx.fill()
  else ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-size * 0.3, size * 0.02)
  ctx.lineTo(size * 0.3, size * 0.02)
  ctx.lineTo(size * 0.16, size * 0.16)
  ctx.lineTo(-size * 0.16, size * 0.16)
  ctx.closePath()
  if (filled) ctx.fill()
  else ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.56)
  ctx.lineTo(size * 0.1, -size * 0.86)
  ctx.lineTo(0, -size * 1.1)
  ctx.lineTo(-size * 0.1, -size * 0.86)
  ctx.closePath()
  if (filled) ctx.fill()
  else ctx.stroke()
  ctx.restore()
}

export function lotusBloom(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  petals: number,
  color: string,
  filled: boolean,
  lineWidth = 1,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  for (let i = 0; i < petals; i++) {
    ctx.save()
    ctx.rotate((i / petals) * Math.PI * 2)
    petalPath(ctx, radius * 0.18, radius, radius * 0.32, 0.55)
    if (filled) {
      ctx.globalAlpha = 0.55
      ctx.fill()
      ctx.globalAlpha = 1
    }
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

export function ornamentDots(ctx: Ctx, cx: number, cy: number, radius: number, count: number, color: string, size: number) {
  ctx.save()
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** Hairline clipping helper for engraved patterns. */
export function clipped(ctx: Ctx, rect: Rect, draw: () => void) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.clip()
  draw()
  ctx.restore()
}

export function sigil(ctx: Ctx, kind: number, size: number, color: string, width: number) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  switch (kind % 6) {
    case 0:
      ctx.arc(0, 0, size * 0.34, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-size * 0.5, 0)
      ctx.lineTo(size * 0.5, 0)
      ctx.stroke()
      break
    case 1:
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.3, -Math.PI / 2, Math.PI / 2, true)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.3, Math.PI / 2, (Math.PI * 3) / 2, true)
      ctx.stroke()
      break
    case 2:
      ctx.moveTo(-size * 0.4, size * 0.34)
      ctx.quadraticCurveTo(0, -size * 0.55, size * 0.4, size * 0.34)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, size * 0.2, size * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break
    case 3:
      ctx.moveTo(-size * 0.42, -size * 0.2)
      ctx.quadraticCurveTo(0, size * 0.5, size * 0.42, -size * 0.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -size * 0.28, size * 0.16, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 4:
      ctx.moveTo(0, -size * 0.45)
      ctx.lineTo(size * 0.42, 0)
      ctx.lineTo(0, size * 0.45)
      ctx.lineTo(-size * 0.42, 0)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2)
      ctx.fill()
      break
    default:
      ctx.moveTo(-size * 0.4, size * 0.4)
      ctx.lineTo(0, -size * 0.45)
      ctx.lineTo(size * 0.4, size * 0.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-size * 0.22, size * 0.16)
      ctx.lineTo(size * 0.22, size * 0.16)
      ctx.stroke()
  }
  ctx.restore()
}

export function groundGradient(ctx: Ctx, rect: Rect, top: string, bottom: string) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h)
  g.addColorStop(0, top)
  g.addColorStop(1, bottom)
  return g
}
