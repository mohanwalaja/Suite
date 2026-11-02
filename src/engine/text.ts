import type { Rect } from './types'

/** Text style used by every composition. Sizes are in canvas pixels. */
export interface TextStyle {
  stack: string
  size: number
  weight?: number
  italic?: boolean
  /** Letter spacing in em units (0.04 = 4% of font size). */
  tracking?: number
  /** Line height as a multiplier of font size. */
  lineHeight?: number
  align?: 'left' | 'center' | 'right'
  color: string
  uppercase?: boolean
  /** Soft drop shadow for text over artwork. */
  shadow?: { color: string; blur: number; offsetY: number; offsetX?: number }
  opacity?: number
}

export interface ParagraphOptions extends TextStyle {
  text: string
  x: number
  y: number
  maxWidth: number
  maxHeight?: number
  maxLines?: number
  vAlign?: 'top' | 'center' | 'bottom'
  /** Metadata used by the pre-flight report. */
  id?: string
  label?: string
  onMeasure?: (result: ParagraphResult) => void
  /** Allow breaking inside a word when a single word is wider than the box. */
  breakWords?: boolean
  /** Minimum readable size; below this the paragraph reports a warning. */
  minSize?: number
}

export interface ParagraphResult {
  id: string
  label: string
  lines: string[]
  fontSize: number
  lineHeight: number
  height: number
  width: number
  truncated: boolean
  overflow: boolean
  box: Rect
}

const measureCache = new Map<string, number>()
const MAX_CACHE = 30000

export function applyCase(text: string, uppercase?: boolean): string {
  return uppercase ? text.toUpperCase() : text
}

export function fontString(style: Pick<TextStyle, 'stack' | 'size' | 'weight' | 'italic'>): string {
  const weight = style.weight ?? 400
  const italic = style.italic ? 'italic ' : ''
  return `${italic}${weight} ${Math.max(1, Math.round(style.size))}px ${style.stack}`
}

export function setFont(ctx: CanvasRenderingContext2D, style: TextStyle) {
  ctx.font = fontString(style)
}

export function measure(ctx: CanvasRenderingContext2D, text: string, style: TextStyle): number {
  if (!text) return 0
  const font = fontString(style)
  const key = `${font}|${style.tracking ?? 0}|${text}`
  const hit = measureCache.get(key)
  if (hit !== undefined) return hit
  ctx.font = font
  let width: number
  const tracking = (style.tracking ?? 0) * style.size
  if (Math.abs(tracking) < 0.001) {
    width = ctx.measureText(text).width
  } else {
    width = 0
    for (const ch of Array.from(text)) width += ctx.measureText(ch).width + tracking
    width -= tracking
  }
  if (measureCache.size > MAX_CACHE) measureCache.clear()
  measureCache.set(key, width)
  return width
}

export function clearMeasureCache() {
  measureCache.clear()
}

/** Split text into greedily wrapped lines that fit maxWidth. */
export function wrapLines(
  ctx: CanvasRenderingContext2D,
  raw: string,
  maxWidth: number,
  style: TextStyle,
  breakWords = false,
): string[] {
  const text = applyCase(raw, style.uppercase)
  const paragraphs = text.split(/\n+/)
  const out: string[] = []
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      out.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (measure(ctx, candidate, style) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) {
        out.push(line)
        line = ''
      }
      if (measure(ctx, word, style) <= maxWidth) {
        line = word
        continue
      }
      if (!breakWords) {
        line = word
        continue
      }
      let chunk = ''
      for (const ch of Array.from(word)) {
        if (chunk && measure(ctx, chunk + ch, style) > maxWidth) {
          out.push(chunk)
          chunk = ch
        } else {
          chunk += ch
        }
      }
      line = chunk
    }
    if (line) out.push(line)
  }
  return out
}

export function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  style: TextStyle,
): string {
  if (measure(ctx, text, style) <= maxWidth) return text
  const ell = '…'
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (measure(ctx, text.slice(0, mid).trimEnd() + ell, style) <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return text.slice(0, lo).trimEnd() + ell
}

function drawTrackedLine(ctx: CanvasRenderingContext2D, line: string, x: number, baseline: number, style: TextStyle) {
  const tracking = (style.tracking ?? 0) * style.size
  if (Math.abs(tracking) < 0.001) {
    ctx.fillText(line, x, baseline)
    return
  }
  let cursor = x
  for (const ch of Array.from(line)) {
    ctx.fillText(ch, cursor, baseline)
    cursor += ctx.measureText(ch).width + tracking
  }
}

/** Draw one line at an alphabetic baseline, aligned inside [x, x+width]. */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  baseline: number,
  width: number,
  style: TextStyle,
) {
  const align = style.align ?? 'left'
  const lineWidth = measure(ctx, line, style)
  let drawX = x
  if (align === 'center') drawX = x + (width - lineWidth) / 2
  else if (align === 'right') drawX = x + width - lineWidth
  drawTrackedLine(ctx, line, drawX, baseline, style)
}

export function fontMetrics(ctx: CanvasRenderingContext2D, style: TextStyle) {
  ctx.font = fontString(style)
  const m = ctx.measureText('Hxgjpqy')
  let ascent = (m as TextMetrics).fontBoundingBoxAscent
  let descent = (m as TextMetrics).fontBoundingBoxDescent
  if (!Number.isFinite(ascent) || ascent <= 0) ascent = style.size * 0.78
  if (!Number.isFinite(descent) || descent <= 0) descent = style.size * 0.22
  return { ascent, descent }
}

function applyShadow(ctx: CanvasRenderingContext2D, style: TextStyle) {
  if (style.shadow) {
    ctx.shadowColor = style.shadow.color
    ctx.shadowBlur = style.shadow.blur
    ctx.shadowOffsetY = style.shadow.offsetY
    ctx.shadowOffsetX = style.shadow.offsetX ?? 0
  }
}

/**
 * Draw a wrapped paragraph inside a box and report the measured result so the
 * pre-flight panel can warn about clipped or oversized copy.
 */
export function drawParagraph(ctx: CanvasRenderingContext2D, options: ParagraphOptions): ParagraphResult {
  const style: TextStyle = { ...options, size: Math.max(1, options.size) }
  const lineHeightFactor = style.lineHeight ?? 1.4
  const lh = style.size * lineHeightFactor
  const maxLines = options.maxLines ?? 99
  const wrapped = wrapLines(ctx, options.text, options.maxWidth, style, options.breakWords)
  let truncated = false
  let lines = wrapped
  if (lines.length > maxLines) {
    truncated = true
    lines = lines.slice(0, maxLines)
    lines[maxLines - 1] = ellipsize(ctx, `${lines[maxLines - 1]} …`, options.maxWidth, style)
  }
  const height = lines.length * lh
  const overflow = options.maxHeight !== undefined ? height > options.maxHeight + 0.5 : false
  const blockWidth = Math.max(0, ...lines.map((l) => measure(ctx, l, style)))
  const yOffset =
    options.vAlign === 'center'
      ? ((options.maxHeight ?? height) - height) / 2
      : options.vAlign === 'bottom'
        ? (options.maxHeight ?? height) - height
        : 0
  const top = options.y + yOffset
  const { ascent, descent } = fontMetrics(ctx, style)
  const baselineOffset = (lh - (ascent + descent)) / 2 + ascent

  ctx.save()
  ctx.fillStyle = style.color
  if (style.opacity !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, style.opacity))
  applyShadow(ctx, style)
  let largest = 0
  lines.forEach((line, i) => {
    if (!line) return
    drawLine(ctx, line, options.x, top + i * lh + baselineOffset, options.maxWidth, style)
    largest = Math.max(largest, 1)
  })
  ctx.restore()
  void largest

  const result: ParagraphResult = {
    id: options.id ?? options.label ?? 'text',
    label: options.label ?? 'Text',
    lines,
    fontSize: style.size,
    lineHeight: lh,
    height,
    width: blockWidth,
    truncated,
    overflow,
    box: { x: options.x, y: top, w: options.maxWidth, h: height },
  }
  options.onMeasure?.(result)
  return result
}

/** Measure a paragraph without drawing it (used by fitting + pre-flight). */
export function measureParagraph(
  ctx: CanvasRenderingContext2D,
  options: Omit<ParagraphOptions, 'onMeasure'>,
): ParagraphResult {
  const style: TextStyle = { ...options }
  const lh = style.size * (style.lineHeight ?? 1.4)
  const wrapped = wrapLines(ctx, options.text, options.maxWidth, style, options.breakWords)
  const truncated = options.maxLines !== undefined && wrapped.length > options.maxLines
  const lines = options.maxLines ? wrapped.slice(0, options.maxLines) : wrapped
  const height = lines.length * lh
  return {
    id: options.id ?? 'text',
    label: options.label ?? 'Text',
    lines,
    fontSize: style.size,
    lineHeight: lh,
    height,
    width: Math.max(0, ...lines.map((l) => measure(ctx, l, style))),
    truncated,
    overflow: options.maxHeight !== undefined ? height > options.maxHeight + 0.5 : false,
    box: { x: options.x, y: options.y, w: options.maxWidth, h: height },
  }
}

export interface FitOptions {
  stack: string
  weight?: number
  italic?: boolean
  tracking?: number
  lineHeight?: number
  maxWidth: number
  maxHeight?: number
  maxLines: number
  minSize: number
  maxSize: number
  breakWords?: boolean
  uppercase?: boolean
  align?: 'left' | 'center' | 'right'
  color: string
}

export interface FitResult {
  size: number
  lines: string[]
  height: number
  width: number
  fits: boolean
}

/**
 * Binary-search a font size that keeps a headline inside its box. Used by every
 * composition so long English headlines never clip.
 */
export function fitTextSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: FitOptions,
): FitResult {
  const measureAt = (size: number): FitResult => {
    const style: TextStyle = {
      stack: opts.stack,
      size,
      weight: opts.weight,
      italic: opts.italic,
      tracking: opts.tracking,
      lineHeight: opts.lineHeight,
      uppercase: opts.uppercase,
      align: opts.align ?? 'left',
      color: opts.color,
    }
    const lines = wrapLines(ctx, text, opts.maxWidth, style, opts.breakWords)
    const height = lines.length * size * (opts.lineHeight ?? 1.2)
    const width = Math.max(0, ...lines.map((l) => measure(ctx, l, style)))
    const okLines = lines.length <= opts.maxLines
    const okHeight = opts.maxHeight === undefined || height <= opts.maxHeight + 0.5
    return { size, lines, height, width, fits: okLines && okHeight }
  }

  let lo = Math.round(opts.minSize)
  let hi = Math.max(lo, Math.round(opts.maxSize))
  const atMax = measureAt(hi)
  if (atMax.fits) return atMax
  const atMin = measureAt(lo)
  if (!atMin.fits) return atMin
  while (hi - lo > 1) {
    const mid = Math.round((lo + hi) / 2)
    if (measureAt(mid).fits) lo = mid
    else hi = mid
  }
  return measureAt(lo)
}

/** Draw a single line of text, shrinking until it fits if requested. */
export function drawSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  maxWidth: number,
  style: TextStyle,
  opts: { minSize?: number; ellipsis?: boolean } = {},
): number {
  const min = opts.minSize ?? Math.max(6, style.size * 0.6)
  let size = style.size
  let value = applyCase(text, style.uppercase)
  while (size > min && measure(ctx, value, { ...style, size }) > maxWidth) size -= 1
  let styled = { ...style, size }
  if (measure(ctx, value, styled) > maxWidth) {
    value = opts.ellipsis === false ? value : ellipsize(ctx, value, maxWidth, styled)
  }
  ctx.save()
  ctx.fillStyle = styled.color
  if (styled.opacity !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, styled.opacity))
  applyShadow(ctx, styled)
  drawLine(ctx, value, x, baseline, maxWidth, styled)
  ctx.restore()
  return size
}

/** Curved text for mandala / circular compositions. */
export function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: {
    cx: number
    cy: number
    radius: number
    centerAngle: number
    spread: number
    style: TextStyle
    inverted?: boolean
  },
) {
  const chars = Array.from(applyCase(text, opts.style.uppercase))
  const gaps = Array.from(chars).map((c) => measure(ctx, c, opts.style))
  const total = gaps.reduce((a, b) => a + b, 0) + (opts.style.tracking ?? 0) * opts.style.size * chars.length
  let cursor = opts.centerAngle - (total / opts.radius) / 2
  ctx.save()
  ctx.fillStyle = opts.style.color
  if (opts.style.opacity !== undefined) ctx.globalAlpha *= opts.style.opacity
  chars.forEach((ch, i) => {
    const advance = gaps[i] + (opts.style.tracking ?? 0) * opts.style.size
    const angle = cursor + advance / 2 / opts.radius
    const dir = opts.inverted ? -1 : 1
    const x = opts.cx + Math.cos(angle) * opts.radius
    const y = opts.cy + Math.sin(angle) * opts.radius
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + (dir * Math.PI) / 2)
    ctx.font = fontString(opts.style)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    cursor += advance / opts.radius
  })
  ctx.restore()
}

export function textRect(result: ParagraphResult): Rect {
  return result.box
}
