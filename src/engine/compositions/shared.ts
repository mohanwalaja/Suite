import type { Rect } from '../types'
import type { Frame } from '../frame'
import { alpha, mix } from '../color'
import { dotRing, fillEllipse, fillRect, roundRectPath, strokeLine, strokeRect } from '../draw'
import { drawSingleLine, measure } from '../text'

/** Small caps eyebrow with an accent dot and optional trailing rule. */
export function eyebrow(
  f: Frame,
  value: string,
  x: number,
  baseline: number,
  opts: { color?: string; size?: number; tracking?: number; rule?: boolean; width?: number; align?: 'left' | 'center' | 'right' } = {},
) {
  if (!value.trim()) return
  const { ctx, palette, u } = f
  const size = opts.size ?? u * 19
  const color = opts.color ?? palette.accent
  const tracking = opts.tracking ?? 0.2
  const style = f.style(size, {
    role: 'body',
    weight: 600,
    tracking,
    uppercase: true,
    color,
    align: 'left',
  })
  ctx.save()
  ctx.fillStyle = color
  const dotR = size * 0.15
  const textValue = value.toUpperCase()
  const w = measure(ctx, textValue, style)
  let textX = x
  if (opts.align === 'center') textX = x - w / 2
  if (opts.align === 'right') textX = x - w
  if (opts.rule !== false) {
    fillEllipse(ctx, textX - size * 0.65, baseline - size * 0.28, dotR, dotR, color)
  }
  drawSingleLine(ctx, textValue, textX, baseline, w + 2, style)
  if (opts.width) {
    const lineStart = textX + w + size * 0.6
    const lineEnd = (opts.align === 'center' ? x : opts.align === 'right' ? x : x + opts.width)
    if (lineEnd > lineStart) {
      strokeLine(ctx, lineStart, baseline - size * 0.26, lineEnd, baseline - size * 0.26, alpha(color, 0.35), Math.max(0.6, u * 0.8))
    }
  }
  ctx.restore()
}

export function ctaPill(
  f: Frame,
  text: string,
  x: number,
  y: number,
  opts: { fill?: string; color?: string; size?: number; padX?: number; height?: number; align?: 'left' | 'center' | 'right'; radius?: number; border?: string } = {},
): Rect {
  const { ctx, u } = f
  const size = opts.size ?? u * 19
  const padX = opts.padX ?? u * 28
  const height = opts.height ?? u * 54
  const style = f.style(size, {
    role: 'body',
    weight: 600,
    tracking: 0.14,
    uppercase: true,
    color: opts.color ?? f.palette.deep,
    align: 'center',
  })
  const label = text.toUpperCase()
  const textW = measure(ctx, label, style)
  const w = textW + padX * 2
  const rx = opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x
  const radius = opts.radius ?? height / 2
  ctx.save()
  roundRectPath(ctx, rx, y, w, height, radius)
  ctx.fillStyle = opts.fill ?? f.palette.accent
  ctx.fill()
  if (opts.border) {
    ctx.strokeStyle = opts.border
    ctx.lineWidth = Math.max(0.8, u)
    ctx.stroke()
  }
  ctx.restore()
  drawSingleLine(ctx, label, rx + padX, y + height / 2 + size * 0.35, textW + 2, { ...style, align: 'center' })
  return { x: rx, y, w, h: height }
}

/** Contact / website / footer line with a hairline above. */
export function contactFooter(
  f: Frame,
  y: number,
  opts: {
    x?: number
    w?: number
    align?: 'left' | 'center' | 'right'
    color?: string
    rule?: boolean
    showBrand?: boolean
    size?: number
    items?: string[]
  } = {},
) {
  const { ctx, palette, u } = f
  const x = opts.x ?? f.safe.x
  const w = opts.w ?? f.safe.w
  const align = opts.align ?? 'left'
  const color = opts.color ?? palette.ink
  const size = opts.size ?? u * 18
  const items = (opts.items ?? [f.spec.content.contact, f.spec.content.website]).filter((s) => s && s.trim())
  if (opts.rule !== false) {
    strokeLine(ctx, x, y - size * 1.6, x + w, y - size * 1.6, alpha(color, 0.18), Math.max(0.6, u * 0.8))
  }
  const style = f.style(size, {
    role: 'body',
    weight: 400,
    tracking: 0.08,
    uppercase: true,
    color: alpha(color, 0.78),
    align,
  })
  if (opts.showBrand !== false) {
    const brand = (f.brand.name || 'ASTROSIVAM').toUpperCase()
    const bstyle = f.style(size * 0.95, {
      role: 'body',
      weight: 600,
      tracking: 0.18,
      uppercase: true,
      color,
      align: 'left',
    })
    drawSingleLine(ctx, brand, x, y, w, bstyle)
  }
  const right = items.join('   ·   ')
  if (right) {
    const rstyle = { ...style, align: 'left' as const }
    const rw = measure(ctx, right, rstyle)
    if (align === 'center') {
      drawSingleLine(ctx, right, x + w / 2 - rw / 2, y, rw + 2, rstyle)
    } else {
      drawSingleLine(ctx, right, x + w - rw, y, rw + 2, { ...rstyle, align: 'left' })
    }
  }
}

export function numberedList(
  f: Frame,
  points: string[],
  rect: Rect,
  opts: {
    color?: string
    accent?: string
    size?: number
    gap?: number
    rule?: boolean
    align?: 'left' | 'right'
    counter?: boolean
  } = {},
) {
  const { ctx, u } = f
  const size = opts.size ?? u * 22
  const color = opts.color ?? f.palette.ink
  const accent = opts.accent ?? f.palette.accent
  const count = Math.max(1, points.length)
  const gap = opts.gap ?? rect.h / count
  points.forEach((point, i) => {
    const y = rect.y + i * gap + gap * 0.55
    if (opts.rule !== false) {
      strokeLine(ctx, rect.x, rect.y + i * gap, rect.x + rect.w, rect.y + i * gap, alpha(color, 0.16), Math.max(0.6, u * 0.7))
    }
    if (opts.counter !== false) {
      const idx = String(i + 1).padStart(2, '0')
      const idxStyle = f.style(size * 0.72, {
        role: 'body',
        weight: 600,
        tracking: 0.1,
        color: alpha(accent, 0.9),
        align: 'left',
      })
      drawSingleLine(ctx, idx, opts.align === 'right' ? rect.x + rect.w - size * 1.4 : rect.x, y, size * 2, idxStyle)
    }
    const textX = opts.align === 'right' ? rect.x : rect.x + size * 2.3
    const textW = opts.align === 'right' ? rect.w - size * 2.3 : rect.w - size * 2.3
    const style = f.style(size, {
      role: 'body',
      weight: 400,
      tracking: 0.01,
      uppercase: false,
      color: alpha(color, 0.88),
      align: 'left',
    })
    drawSingleLine(ctx, point, textX, y, textW, style)
  })
  if (opts.rule !== false) {
    strokeLine(ctx, rect.x, rect.y + count * gap, rect.x + rect.w, rect.y + count * gap, alpha(color, 0.16), Math.max(0.6, u * 0.7))
  }
}

/** Soft scrim so type stays legible over artwork. */
export function scrim(
  f: Frame,
  rect: Rect,
  opts: { from?: 'bottom' | 'top' | 'left' | 'right'; color?: string; strength?: number; start?: number; end?: number } = {},
) {
  const { ctx, palette } = f
  const from = opts.from ?? 'bottom'
  const color = opts.color ?? palette.bg
  const strength = opts.strength ?? 0.95
  const start = opts.start ?? 0.2
  const end = opts.end ?? 1
  const g = (() => {
    if (from === 'left') return ctx.createLinearGradient(rect.x, 0, rect.x + rect.w, 0)
    if (from === 'right') return ctx.createLinearGradient(rect.x + rect.w, 0, rect.x, 0)
    if (from === 'top') return ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h)
    return ctx.createLinearGradient(0, rect.y + rect.h, 0, rect.y)
  })()
  g.addColorStop(0, alpha(color, strength))
  g.addColorStop(start, alpha(color, strength * 0.72))
  g.addColorStop(end, alpha(color, 0))
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.restore()
}

export function hairlineGrid(f: Frame, rect: Rect, divisions: number, color?: string, vertical = true) {
  const { ctx, palette, u } = f
  const c = color ?? alpha(palette.ink, 0.14)
  ctx.save()
  ctx.lineWidth = Math.max(0.6, u * 0.7)
  ctx.strokeStyle = c
  for (let i = 1; i < divisions; i++) {
    const t = i / divisions
    ctx.beginPath()
    if (vertical) {
      ctx.moveTo(rect.x + rect.w * t, rect.y)
      ctx.lineTo(rect.x + rect.w * t, rect.y + rect.h)
    } else {
      ctx.moveTo(rect.x, rect.y + rect.h * t)
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h * t)
    }
    ctx.stroke()
  }
  ctx.restore()
}

export function frameBorder(f: Frame, rect: Rect, color?: string, width?: number) {
  const { ctx, palette, u } = f
  strokeRect(ctx, rect, color ?? alpha(palette.ink, 0.22), width ?? Math.max(0.7, u))
}

export function cornerTicks(f: Frame, rect: Rect, size: number, color?: string) {
  const { ctx, palette, u } = f
  const c = color ?? alpha(palette.accent, 0.6)
  ctx.save()
  ctx.strokeStyle = c
  ctx.lineWidth = Math.max(0.7, u)
  const corners: Array<[number, number, number, number]> = [
    [rect.x, rect.y, 1, 1],
    [rect.x + rect.w, rect.y, -1, 1],
    [rect.x, rect.y + rect.h, 1, -1],
    [rect.x + rect.w, rect.y + rect.h, -1, -1],
  ]
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(x, y + dy * size)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dx * size, y)
    ctx.stroke()
  }
  ctx.restore()
}

export function bigIndex(f: Frame, value: string, x: number, baseline: number, size: number, opts: { color?: string; align?: 'left' | 'center' | 'right'; weight?: number; tracking?: number; role?: 'display' | 'body' } = {}) {
  const style = f.style(size, {
    weight: opts.weight ?? 300,
    tracking: opts.tracking ?? 0.02,
    color: opts.color ?? alpha(f.palette.ink, 0.16),
    align: opts.align ?? 'left',
    role: opts.role ?? 'display',
    lineHeight: 1,
  })
  const width = f.aspect === 'landscape' ? f.W : f.safe.w + f.safe.x
  return drawSingleLine(f.ctx, value, x, baseline, width * 1.2, style, { ellipsis: false })
}

/** Legacy plate with optional shadow used by collage + campaign layouts. */
export function plate(
  f: Frame,
  rect: Rect,
  opts: { fill: string; radius?: number; rotate?: number; shadow?: number; border?: string; texture?: boolean } = { fill: '#000' },
) {
  const { ctx, u, palette } = f
  ctx.save()
  if (opts.rotate) {
    const cx = rect.x + rect.w / 2
    const cy = rect.y + rect.h / 2
    ctx.translate(cx, cy)
    ctx.rotate(opts.rotate)
    ctx.translate(-cx, -cy)
  }
  if (opts.shadow) {
    ctx.shadowColor = alpha(palette.deep, 0.55)
    ctx.shadowBlur = opts.shadow * u
    ctx.shadowOffsetY = opts.shadow * 0.5 * u
  }
  roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius ?? 0)
  ctx.fillStyle = opts.fill
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  if (opts.border) {
    ctx.strokeStyle = opts.border
    ctx.lineWidth = Math.max(0.7, u)
    ctx.stroke()
  }
  ctx.restore()
  if (opts.texture) {
    ctx.save()
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius ?? 0)
    ctx.clip()
    ctx.globalAlpha = 0.05
    ctx.fillStyle = mix(palette.ink, palette.bg, 0.4)
    for (let i = 0; i < 160; i++) {
      const x = rect.x + ((i * 92821) % 997) / 997 * rect.w
      const y = rect.y + ((i * 137) % 991) / 991 * rect.h
      ctx.fillRect(x, y, u * 2, u * 2)
    }
    ctx.restore()
  }
}

export function dotCluster(f: Frame, cx: number, cy: number, radius: number, count: number, size: number, color: string) {
  dotRing(f.ctx, cx, cy, radius, count, size, color)
}

export function fillPanel(f: Frame, rect: Rect, color: string) {
  fillRect(f.ctx, rect, color)
}
