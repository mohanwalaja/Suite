import type { Rect } from './types'
import { alpha, rng, mix } from './color'

export type Ctx = CanvasRenderingContext2D

export interface GradientStop {
  at: number
  color: string
}

export type FillSpec =
  | string
  | CanvasGradient
  | { type: 'linear'; angle: number; stops: GradientStop[] }
  | { type: 'radial'; cx: number; cy: number; r: number; stops: GradientStop[] }

export function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export function fillRoundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.save()
  ctx.fillStyle = fill
  roundRectPath(ctx, x, y, w, h, r)
  ctx.fill()
  ctx.restore()
}

export function linearGradient(
  ctx: Ctx,
  rect: Rect,
  angle: number,
  stops: GradientStop[],
): CanvasGradient {
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const len = Math.max(rect.w, rect.h)
  const rad = (angle - 90) * (Math.PI / 180)
  const dx = Math.cos(rad) * len
  const dy = Math.sin(rad) * len
  const g = ctx.createLinearGradient(cx - dx / 2, cy - dy / 2, cx + dx / 2, cy + dy / 2)
  for (const s of stops) g.addColorStop(Math.min(1, Math.max(0, s.at)), s.color)
  return g
}

export function radialGradient(
  ctx: Ctx,
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  stops: GradientStop[],
): CanvasGradient {
  const g = ctx.createRadialGradient(cx, cy, Math.max(0, r0), cx, cy, Math.max(r0 + 0.01, r1))
  for (const s of stops) g.addColorStop(Math.min(1, Math.max(0, s.at)), s.color)
  return g
}

export function paint(ctx: Ctx, spec: FillSpec, rect: Rect): string | CanvasGradient {
  if (typeof spec === 'string') return spec
  if (typeof (spec as CanvasGradient).addColorStop === 'function') return spec as CanvasGradient
  if ((spec as { type: string }).type === 'linear') {
    const g = spec as { angle: number; stops: GradientStop[] }
    return linearGradient(ctx, rect, g.angle, g.stops)
  }
  const rg = spec as { cx: number; cy: number; r: number; stops: GradientStop[] }
  return radialGradient(
    ctx,
    rect.x + rect.w * rg.cx,
    rect.y + rect.h * rg.cy,
    0,
    Math.max(rect.w, rect.h) * rg.r,
    rg.stops,
  )
}

export function fillRect(ctx: Ctx, rect: Rect, fill: FillSpec) {
  ctx.save()
  ctx.fillStyle = paint(ctx, fill, rect)
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.restore()
}

export function fillEllipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, fill: FillSpec) {
  const rect = { x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 }
  ctx.save()
  ctx.fillStyle = paint(ctx, fill, rect)
  ctx.beginPath()
  ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function strokeLine(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1,
  dash: number[] = [],
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

export function strokeRect(ctx: Ctx, rect: Rect, color: string, width = 1, dash: number[] = []) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
  ctx.restore()
}

export function hairline(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, u = 1) {
  strokeLine(ctx, x1, y1, x2, y2, color, Math.max(0.6, 1 * u))
}

export function dashedHairline(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, u = 1) {
  strokeLine(ctx, x1, y1, x2, y2, color, Math.max(0.6, 1 * u), [6 * u, 6 * u])
}

/** Soft radial light blob used for atmosphere and depth. */
export function glow(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  strength = 0.5,
) {
  if (radius <= 0) return
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  g.addColorStop(0, alpha(color, strength))
  g.addColorStop(0.45, alpha(color, strength * 0.42))
  g.addColorStop(1, alpha(color, 0))
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  ctx.restore()
}

export function vignette(ctx: Ctx, W: number, H: number, color: string, strength = 0.55, spread = 1) {
  const r = Math.hypot(W, H) * 0.62 * spread
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.18, W / 2, H / 2, r)
  g.addColorStop(0, alpha(color, 0))
  g.addColorStop(0.62, alpha(color, strength * 0.35))
  g.addColorStop(1, alpha(color, strength))
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

export function withClip(ctx: Ctx, rect: Rect, draw: () => void) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.clip()
  draw()
  ctx.restore()
}

export function withClipPath(ctx: Ctx, build: () => void, draw: () => void) {
  ctx.save()
  ctx.beginPath()
  build()
  ctx.clip()
  draw()
  ctx.restore()
}

/** Draw an image covering a rect (object-fit: cover) with focal point. */
export function drawImageCover(
  ctx: Ctx,
  img: { width: number; height: number },
  rect: Rect,
  opts: {
    focalX?: number
    focalY?: number
    scale?: number
    opacity?: number
    radius?: number
    treat?: { color: string; mode: GlobalCompositeOperation; strength: number }
    mirror?: boolean
  } = {},
) {
  const fx = opts.focalX ?? 0.5
  const fy = opts.focalY ?? 0.5
  const scale = opts.scale ?? 1
  const imgRatio = img.width / img.height
  const rectRatio = rect.w / rect.h
  let w: number
  let h: number
  if (imgRatio > rectRatio) {
    h = rect.h * scale
    w = h * imgRatio
  } else {
    w = rect.w * scale
    h = w / imgRatio
  }
  const x = rect.x - (w - rect.w) * fx
  const y = rect.y - (h - rect.h) * fy
  ctx.save()
  if (opts.opacity !== undefined) ctx.globalAlpha *= opts.opacity
  if (opts.radius) {
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius)
    ctx.clip()
  }
  if (opts.mirror) {
    ctx.translate(rect.x * 2 + rect.w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(img as CanvasImageSource, x, y, w, h)
  } else {
    ctx.drawImage(img as CanvasImageSource, x, y, w, h)
  }
  ctx.restore()
  if (opts.treat && opts.treat.strength > 0) {
    ctx.save()
    ctx.globalCompositeOperation = opts.treat.mode
    ctx.globalAlpha = opts.treat.strength
    ctx.fillStyle = opts.treat.color
    if (opts.radius) {
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius)
      ctx.fill()
    } else {
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
    ctx.restore()
  }
}

export function drawImageContain(
  ctx: Ctx,
  img: { width: number; height: number },
  rect: Rect,
  opacity = 1,
) {
  const scale = Math.min(rect.w / img.width, rect.h / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.save()
  ctx.globalAlpha *= opacity
  ctx.drawImage(
    img as CanvasImageSource,
    rect.x + (rect.w - w) / 2,
    rect.y + (rect.h - h) / 2,
    w,
    h,
  )
  ctx.restore()
}

/** Ring of small dots, used for charts and decorative structure. */
export function dotRing(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  count: number,
  dotRadius: number,
  color: string,
  startAngle = 0,
  sweep = Math.PI * 2,
) {
  ctx.save()
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const a = startAngle + (sweep * i) / (count === 1 ? 1 : count - 1)
    const x = cx + Math.cos(a) * radius
    const y = cy + Math.sin(a) * radius
    ctx.beginPath()
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function arcStroke(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  start: number,
  end: number,
  color: string,
  width = 1,
  dash: number[] = [],
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0.1, radius), start, end)
  ctx.stroke()
  ctx.restore()
}

export function starPath(ctx: Ctx, cx: number, cy: number, outer: number, inner: number, points = 4, rotation = 0) {
  ctx.beginPath()
  const step = Math.PI / points
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = rotation + i * step - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

export function sparkle(ctx: Ctx, cx: number, cy: number, size: number, color: string, opacity = 1) {
  ctx.save()
  ctx.globalAlpha *= opacity
  ctx.fillStyle = color
  starPath(ctx, cx, cy, size, size * 0.16, 3, 0)
  ctx.fill()
  ctx.restore()
}

/** A fine concentric ring set used across several compositions. */
export function rings(
  ctx: Ctx,
  cx: number,
  cy: number,
  radii: number[],
  color: string,
  width = 1,
  dash: number[] = [],
) {
  for (const r of radii) arcStroke(ctx, cx, cy, r, 0, Math.PI * 2, color, width, dash)
}

/** Diagonal hatch pattern clipped to a shape. */
export function hatch(
  ctx: Ctx,
  rect: Rect,
  color: string,
  spacing: number,
  width = 1,
  angle = 45,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  const diag = Math.hypot(rect.w, rect.h)
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad) * diag
  const dy = Math.sin(rad) * diag
  const count = Math.ceil(diag / spacing)
  for (let i = -count; i <= count; i++) {
    const ox = rect.x + rect.w / 2 + (dx * i * spacing) / diag
    const oy = rect.y + rect.h / 2 + (dy * i * spacing) / diag
    ctx.moveTo(ox - dx / 2, oy - dy / 2)
    ctx.lineTo(ox + dx / 2, oy + dy / 2)
  }
  ctx.stroke()
  ctx.restore()
}

/** A deterministic star field. */
export function starField(
  ctx: Ctx,
  rect: Rect,
  count: number,
  color: string,
  seed = 7,
  opts: { maxRadius?: number; opacity?: number; time?: number; drift?: number } = {},
) {
  const rand = rng(seed)
  const maxR = opts.maxRadius ?? 2
  const op = opts.opacity ?? 0.8
  ctx.save()
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const x = rect.x + rand() * rect.w
    let y = rect.y + rand() * rect.h
    if (opts.time && opts.drift) y = rect.y + ((y - rect.y + opts.time * opts.drift * (0.3 + rand())) % rect.h)
    const r = maxR * (0.25 + rand() * rand() * 1.4)
    const a = op * (0.25 + rand() * 0.75)
    ctx.globalAlpha = a
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** Draw text-independent decorative corner ornament (art-deco style, not a
 *  generic gold border). */
export function decoCorner(
  ctx: Ctx,
  x: number,
  y: number,
  size: number,
  color: string,
  mirror: { x: number; y: number } = { x: 1, y: 1 },
  width = 1,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(mirror.x, mirror.y)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  // Long L stem with a stepped fan of arcs.
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(0, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(size * 0.18, size * 0.5)
  ctx.lineTo(size * 0.18, size * 0.18)
  ctx.lineTo(size * 0.5, size * 0.18)
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const r = size * (0.24 + i * 0.16)
    ctx.beginPath()
    ctx.arc(size * 0.18, size * 0.18, r, 0, Math.PI / 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(size * 0.18, size * 0.08)
  ctx.lineTo(size * 0.18, size * 0.18)
  ctx.lineTo(size * 0.08, size * 0.18)
  ctx.stroke()
  ctx.restore()
}

export function inkLine(
  ctx: Ctx,
  points: Array<[number, number]>,
  color: string,
  width = 1,
  close = false,
) {
  if (points.length === 0) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1])
  if (close) ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function alphaMix(a: string, b: string, t: number) {
  return mix(a, b, t)
}
