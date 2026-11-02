import type { Rect } from './types'

export function inset(rect: Rect, dx: number, dy = dx): Rect {
  return { x: rect.x + dx, y: rect.y + dy, w: Math.max(0, rect.w - dx * 2), h: Math.max(0, rect.h - dy * 2) }
}

export function splitX(rect: Rect, ratio: number, gutter = 0): [Rect, Rect] {
  const w = (rect.w - gutter) * ratio
  return [
    { x: rect.x, y: rect.y, w, h: rect.h },
    { x: rect.x + w + gutter, y: rect.y, w: rect.w - w - gutter, h: rect.h },
  ]
}

export function splitY(rect: Rect, ratio: number, gutter = 0): [Rect, Rect] {
  const h = (rect.h - gutter) * ratio
  return [
    { x: rect.x, y: rect.y, w: rect.w, h },
    { x: rect.x, y: rect.y + h + gutter, w: rect.w, h: rect.h - h - gutter },
  ]
}

export function columns(rect: Rect, n: number, gutter = 0): Rect[] {
  const w = (rect.w - gutter * (n - 1)) / n
  return Array.from({ length: n }, (_, i) => ({
    x: rect.x + i * (w + gutter),
    y: rect.y,
    w,
    h: rect.h,
  }))
}

export function rows(rect: Rect, n: number, gutter = 0): Rect[] {
  const h = (rect.h - gutter * (n - 1)) / n
  return Array.from({ length: n }, (_, i) => ({
    x: rect.x,
    y: rect.y + i * (h + gutter),
    w: rect.w,
    h,
  }))
}

export function cell(
  rect: Rect,
  cols: number,
  rowIdx: number,
  colIdx: number,
  opts: { cols?: number; gutter?: number; rowHeight: number; rowGap?: number } = { rowHeight: 0 },
): Rect {
  const gutter = opts.gutter ?? 0
  const cw = (rect.w - gutter * (cols - 1)) / cols
  const span = opts.cols ?? 1
  return {
    x: rect.x + colIdx * (cw + gutter),
    y: rect.y + rowIdx * (opts.rowHeight + (opts.rowGap ?? 0)),
    w: cw * span + gutter * (span - 1),
    h: opts.rowHeight,
  }
}

export function scaleRect(rect: Rect, scale: number, fx = 0.5, fy = 0.5): Rect {
  const w = rect.w * scale
  const h = rect.h * scale
  return { x: rect.x + (rect.w - w) * fx, y: rect.y + (rect.h - h) * fy, w, h }
}

export function bottom(rect: Rect, height: number): Rect {
  return { x: rect.x, y: rect.y + rect.h - height, w: rect.w, h: height }
}

export function top(rect: Rect, height: number): Rect {
  return { x: rect.x, y: rect.y, w: rect.w, h: height }
}

export function right(rect: Rect, width: number): Rect {
  return { x: rect.x + rect.w - width, y: rect.y, w: width, h: rect.h }
}

export function left(rect: Rect, width: number): Rect {
  return { x: rect.x, y: rect.y, w: width, h: rect.h }
}

export function centerRect(rect: Rect, w: number, h: number): Rect {
  return { x: rect.x + (rect.w - w) / 2, y: rect.y + (rect.h - h) / 2, w, h }
}

export function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  }
}
