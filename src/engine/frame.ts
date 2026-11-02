import type {
  AssetImage,
  AnimationSpec,
  DesignSpec,
  Palette,
  Rect,
  RenderAssets,
  RenderReport,
  TextBlockIssue,
} from './types'
import type { AspectClass } from './formats'
import { alpha, clamp, mix } from './color'
import {
  type Ctx,
  dotRing,
  fillEllipse,
  fillRect,
  glow,
  linearGradient,
  roundRectPath,
  strokeLine,
  strokeRect,
  vignette,
} from './draw'
import {
  type ParagraphOptions,
  type ParagraphResult,
  type TextStyle,
  drawParagraph,
  drawSingleLine,
  ellipsize,
  fitTextSize,
  measure,
} from './text'
import { drawMotif, type MotifDrawOptions } from './artwork'
import type { ArtContext } from './artwork/common'

/* ── Timeline ─────────────────────────────────────────────────────────────── */

export type EasingName = 'smooth' | 'snappy' | 'cinematic'

const EASINGS: Record<EasingName, (t: number) => number> = {
  smooth: (t) => 1 - Math.pow(1 - t, 3),
  snappy: (t) => 1 - Math.pow(1 - t, 5),
  cinematic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}

export interface Timeline {
  time: number
  duration: number
  /** Normalised entrance progress for an element starting at `start` and
   *  taking `span` of the timeline. Returns 1 when animation is disabled. */
  at(start: number, span?: number): number
  /** 0..1 loop for continuous motion (particles, light sweeps). */
  loop(speed?: number, phase?: number): number
  enabled: boolean
}

export function createTimeline(animation: AnimationSpec, time: number): Timeline {
  const ease = EASINGS[animation.easing] ?? EASINGS.smooth
  const duration = Math.max(0.5, animation.duration)
  return {
    time,
    duration,
    enabled: animation.enabled,
    at(start, span = 0.45) {
      if (!animation.enabled) return 1
      const t = clamp((time / duration - start) / Math.max(0.001, span), 0, 1)
      return ease(t)
    },
    loop(speed = 1, phase = 0) {
      if (!animation.enabled) return phase
      return (time / duration) * speed
    },
  }
}

/* ── Report builder ───────────────────────────────────────────────────────── */

export class ReportBuilder {
  blocks: RenderReport['blocks'] = []
  issues: TextBlockIssue[] = []

  add(result: ParagraphResult, opts: { minSize?: number; safe?: Rect; required?: boolean } = {}) {
    this.blocks.push({
      id: result.id,
      label: result.label,
      box: result.box,
      lines: result.lines.length,
      fontSize: result.fontSize,
    })
    if (opts.required && result.lines.join('').trim().length === 0) {
      this.issues.push({
        id: result.id,
        label: result.label,
        kind: 'empty',
        severity: 'warning',
        message: `${result.label} is empty.`,
      })
    }
    if (result.truncated) {
      this.issues.push({
        id: result.id,
        label: result.label,
        kind: 'clipped',
        severity: 'error',
        message: `${result.label} is too long for its box and would be cut off. Shorten the copy or raise the text size limit.`,
      })
    }
    if (result.overflow) {
      this.issues.push({
        id: result.id,
        label: result.label,
        kind: 'overflow',
        severity: 'error',
        message: `${result.label} is taller than its available space.`,
      })
    }
    if (opts.safe) {
      const s = opts.safe
      const b = result.box
      const tol = 1
      if (b.x < s.x - tol || b.y < s.y - tol || b.x + b.w > s.x + s.w + tol || b.y + b.h > s.y + s.h + tol) {
        this.issues.push({
          id: result.id,
          label: result.label,
          kind: 'safe-area',
          severity: 'warning',
          message: `${result.label} reaches into the safety margin. It may be cropped on some devices.`,
        })
      }
    }
    if (opts.minSize && result.fontSize < opts.minSize) {
      this.issues.push({
        id: result.id,
        label: result.label,
        kind: 'small-type',
        severity: 'warning',
        message: `${result.label} is small (${Math.round(result.fontSize)}px) for a mobile feed.`,
      })
    }
    const dup = this.issues.filter((i) => i.id === result.id && i.kind === 'clipped')
    if (dup.length > 1) this.issues.splice(this.issues.indexOf(dup[dup.length - 1]), 1)
  }

  issue(issue: TextBlockIssue) {
    this.issues.push(issue)
  }
}

/* ── Frame ────────────────────────────────────────────────────────────────── */

export interface FrameTextOptions {
  text: string
  x: number
  y: number
  w: number
  h?: number
  role?: 'display' | 'body'
  size?: number
  minSize?: number
  maxSize?: number
  maxLines?: number
  fit?: boolean
  uppercase?: boolean
  weight?: number
  italic?: boolean
  tracking?: number
  lineHeight?: number
  align?: 'left' | 'center' | 'right'
  color?: string
  opacity?: number
  id?: string
  label?: string
  shadow?: TextStyle['shadow']
  vAlign?: 'top' | 'center' | 'bottom'
  required?: boolean
  reportSafe?: boolean
  /** Entrance animation for this block. */
  anim?: { start: number; span?: number; distance?: number; fade?: boolean; mask?: 'up' | 'left' | 'none' }
}

export interface RevealOptions {
  distance?: number
  fade?: boolean
  mask?: 'up' | 'left' | 'none'
  scaleFrom?: number
}

export interface LogoOptions {
  x: number
  y: number
  size: number
  align?: 'left' | 'center' | 'right'
  color?: string
  showName?: boolean
  nameSize?: number
  opacity?: number
  layout?: 'row' | 'stack'
}

export interface Frame {
  ctx: Ctx
  W: number
  H: number
  u: number
  aspect: AspectClass
  spec: DesignSpec
  palette: Palette
  typography: DesignSpec['typography']
  brand: DesignSpec['brand']
  assets: RenderAssets
  time: number
  timeline: Timeline
  margin: number
  safe: Rect
  displayStack: string
  bodyStack: string
  displayName: string
  bodyName: string
  report: ReportBuilder
  createCanvas?: (w: number, h: number) => { getContext(id: '2d'): CanvasRenderingContext2D | null }
  text: (o: FrameTextOptions) => ParagraphResult
  label: (text: string, x: number, baseline: number, size: number, opts?: Partial<FrameTextOptions>) => number
  style: (size: number, opts?: Partial<TextStyle> & { role?: 'display' | 'body' }) => TextStyle
  art: (rect: Rect, opts?: MotifDrawOptions) => void
  hasArtwork: boolean
  logo: (opts: LogoOptions) => void
  rule: (x1: number, y1: number, x2: number, y2: number, color?: string, width?: number) => void
  panel: (rect: Rect, fill: string, radius?: number) => void
  issue: (issue: TextBlockIssue) => void
  reveal: (start: number, span?: number, distance?: number) => { alpha: number; dy: number }
  /** Wrap arbitrary drawing in an entrance transition (fade / rise / mask). */
  revealDraw: (start: number, span: number, draw: () => void, opts?: RevealOptions) => void
  /** Convenience: darkened/lightened tone for secondary copy. */
  soft: (amount?: number) => string
}

export function createFrame(input: {
  ctx: Ctx
  spec: DesignSpec
  palette: Palette
  width: number
  height: number
  aspect: AspectClass
  time: number
  assets: RenderAssets
  report: ReportBuilder
  displayStack: string
  bodyStack: string
  displayName: string
  bodyName: string
  createCanvas?: (w: number, h: number) => { getContext(id: '2d'): CanvasRenderingContext2D | null }
}): Frame {
  const { ctx, spec, palette, width: W, height: H, aspect, assets, report } = input
  void ctx
  const u = Math.min(W, H) / 1080
  // `u` follows the short edge, which is right for spacing but makes type tiny
  // on wide banners. Landscape formats get a type-only boost so copy stays
  // legible at Facebook link size.
  const typeBoost = aspect === 'landscape' ? 1.45 : 1
  const baseMargin = Math.min(W, H) * 0.082
  const margin = Math.max(W * 0.035, baseMargin * clamp(spec.layout.margin, 0.4, 1.9))
  const storyTop = aspect === 'story' ? H * 0.07 : 0
  const storyBottom = aspect === 'story' ? H * 0.11 : 0
  const safe: Rect = {
    x: margin,
    y: margin + storyTop,
    w: W - margin * 2,
    h: H - margin * 2 - storyTop - storyBottom,
  }
  const timeline = createTimeline(spec.animation, input.time)
  const hasArtwork = spec.layout.showArtwork && spec.art.mode !== 'none'

  const displayStack = input.displayStack
  const bodyStack = input.bodyStack

  const style = (size: number, opts: Partial<TextStyle> & { role?: 'display' | 'body' } = {}): TextStyle => ({
    stack: opts.role === 'body' ? bodyStack : displayStack,
    size: size * typeBoost,
    weight: opts.role === 'body' ? 400 : spec.typography.headlineWeight,
    color: palette.ink,
    lineHeight: 1.35,
    align: spec.typography.align,
    ...opts,
  })

  const text = (o: FrameTextOptions): ParagraphResult => {
    const stack = o.role === 'body' ? bodyStack : displayStack
    const base: TextStyle = {
      stack,
      size: (o.size ?? u * 26) * typeBoost,
      weight: o.weight ?? (o.role === 'body' ? 400 : spec.typography.headlineWeight),
      italic: o.italic,
      tracking: o.tracking ?? 0,
      lineHeight: o.lineHeight ?? (o.role === 'body' ? 1.6 : 1.12),
      align: o.align ?? spec.typography.align,
      color: o.color ?? palette.ink,
      uppercase: o.uppercase,
      shadow: o.shadow,
      opacity: o.opacity,
    }
    let size = base.size
    if (o.fit) {
      const fit = fitTextSize(ctx, o.text, {
        stack,
        weight: base.weight,
        italic: base.italic,
        tracking: base.tracking,
        lineHeight: base.lineHeight,
        uppercase: base.uppercase,
        align: base.align,
        color: base.color,
        maxWidth: o.w,
        maxHeight: o.h,
        maxLines: o.maxLines ?? 4,
        minSize: o.minSize ?? size * 0.42,
        maxSize: o.maxSize ?? size,
        breakWords: true,
      })
      size = fit.size
    }
    const options: ParagraphOptions = {
      ...base,
      size,
      text: o.text,
      x: o.x,
      y: o.y,
      maxWidth: o.w,
      maxHeight: o.h,
      maxLines: o.maxLines,
      vAlign: o.vAlign,
      uppercase: o.uppercase,
      id: o.id,
      label: o.label,
      breakWords: true,
    }
    const anim = o.anim
    let result: ParagraphResult
    if (anim) {
      const p = timeline.at(anim.start, anim.span ?? 0.4)
      ctx.save()
      if (anim.fade !== false) ctx.globalAlpha *= Math.max(0, Math.min(1, p))
      const dy = (1 - p) * (anim.distance ?? u * 30)
      ctx.translate(0, dy)
      if (anim.mask && anim.mask !== 'none') {
        ctx.beginPath()
        if (anim.mask === 'up') {
          ctx.rect(o.x - 4, options.y, Math.max(0, o.w + 8), Math.max(0, (options.maxHeight ?? options.maxHeight ?? 0) + 8))
        } else {
          ctx.rect(o.x - 4, o.y - size, Math.max(0, (o.w + 8) * p), size * 2)
        }
        ctx.clip()
      }
      result = drawParagraph(ctx, options)
      ctx.restore()
    } else {
      result = drawParagraph(ctx, options)
    }
    report.add(result, {
      minSize: o.minSize && o.minSize < 22 ? o.minSize : 0,
      safe: o.reportSafe ? safe : undefined,
      required: o.required,
    })
    return result
  }

  const label = (
    value: string,
    x: number,
    baseline: number,
    size: number,
    opts: Partial<FrameTextOptions> = {},
  ): number => {
    const s = style(size, {
      stack: opts.role === 'body' ? bodyStack : displayStack,
      tracking: opts.tracking ?? 0.14,
      uppercase: opts.uppercase ?? true,
      weight: opts.weight ?? 500,
      color: opts.color ?? palette.inkSoft,
      align: 'left',
    })
    const maxW = opts.w ?? (opts.align === 'right' ? W - margin : opts.align === 'center' ? W : W - x)
    const value2 = opts.uppercase === false ? value : value.toUpperCase()
    const textW = measure(ctx, value2, s)
    const drawX = opts.align === 'right' ? x - Math.min(textW, maxW) : opts.align === 'center' ? x - Math.min(textW, maxW) / 2 : x
    return drawSingleLine(ctx, value2, drawX, baseline, maxW, s, { ellipsis: true })
  }

  const art = (rawRect: Rect, opts: MotifDrawOptions = {}) => {
    if (!hasArtwork) return
    const artScale = clamp(spec.layout.artScale ?? 1, 0.5, 1.8)
    const rect: Rect =
      artScale === 1
        ? rawRect
        : {
            x: rawRect.x + (rawRect.w * (1 - artScale)) / 2,
            y: rawRect.y + (rawRect.h * (1 - artScale)) / 2,
            w: rawRect.w * artScale,
            h: rawRect.h * artScale,
          }
    const radius = Math.min(spec.layout.cornerRadius ?? 0, Math.min(rect.w, rect.h) / 2)
    if (radius > 0) {
      ctx.save()
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius)
      ctx.clip()
      drawArtInto(rect, opts)
      ctx.restore()
      return
    }
    drawArtInto(rect, opts)
  }

  const drawArtInto = (rect: Rect, opts: MotifDrawOptions = {}) => {
    const uploaded =
      spec.art.mode === 'upload'
        ? spec.art.uploadDataUrl
        : spec.art.mode === 'provider'
          ? spec.art.providerImageDataUrl
          : null
    const artworkImage = assets.artwork
    if (uploaded && artworkImage) {
      const img = artworkImage
      ctx.save()
      ctx.globalAlpha *= clamp(opts.opacity ?? 1, 0, 1) * clamp(spec.art.uploadOpacity ?? 1, 0, 1)
      const cover = spec.art.uploadFit !== 'contain'
      const scale = cover
        ? Math.max(rect.w / img.width, rect.h / img.height)
        : Math.min(rect.w / img.width, rect.h / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const ox2 = clamp(spec.art.offsetX ?? 0, -1, 1) * rect.w * 0.3
      const oy2 = clamp(spec.art.offsetY ?? 0, -1, 1) * rect.h * 0.3
      const fx = clamp(spec.layout.focalX, 0, 1)
      const fy = clamp(spec.layout.focalY, 0, 1)
      const x = rect.x - (w - rect.w) * fx + ox2
      const y = rect.y - (h - rect.h) * fy + oy2
      ctx.drawImage(img as CanvasImageSource, x, y, w, h)
      ctx.restore()
      return
    }
    let ox = opts.offsetX ?? 0
    let oy = opts.offsetY ?? 0
    if (spec.animation.parallax && spec.animation.enabled) {
      const loop = timeline.loop(1)
      ox += Math.cos(loop * Math.PI * 2) * rect.w * 0.012
      oy += Math.sin(loop * Math.PI * 2) * rect.h * 0.012
    }
    const baseArt: ArtContext = {
      ctx,
      rect,
      palette,
      u,
      seed: 17 + (spec.art.motifId.length * 13) % 97,
      time: input.time,
      detail: 0.55 + spec.layout.density * 0.45,
    }
    drawMotif(baseArt, spec.art.motifId, { ...opts, offsetX: ox, offsetY: oy })
  }

  const logo = (opts: LogoOptions) => {
    const img = assets.logo
    const color = opts.color ?? palette.ink
    const showName = opts.showName ?? true
    const position = spec.brand.logoPosition ?? 'auto'
    const scale = clamp(spec.brand.logoSize ?? 1, 0.4, 2.2)
    const size = opts.size * scale
    const nameSize = (opts.nameSize ?? opts.size * 0.3) * scale
    let align = opts.align ?? 'left'
    let anchorX = opts.x
    let anchorY = opts.y
    if (position !== 'auto') {
      if (position === 'tl') [anchorX, anchorY, align] = [margin, margin, 'left']
      else if (position === 'tr') [anchorX, anchorY, align] = [W - margin, margin, 'right']
      else if (position === 'bl') [anchorX, anchorY, align] = [margin, H - margin - size, 'left']
      else if (position === 'br') [anchorX, anchorY, align] = [W - margin, H - margin - size, 'right']
      else [anchorX, anchorY, align] = [W / 2, margin, 'center']
    }
    ctx.save()
    if (opts.opacity !== undefined) ctx.globalAlpha *= clamp(opts.opacity, 0, 1)
    if (img) {
      const ratio = img.width / Math.max(1, img.height)
      const h = size
      const w = h * ratio
      const x = align === 'center' ? anchorX - w / 2 : align === 'right' ? anchorX - w : anchorX
      ctx.drawImage(img as CanvasImageSource, x, anchorY, w, h)
    } else if (spec.brand.showLogo) {
      // Wordmark fallback — never invent an official logo.
      const name = (spec.brand.name || 'ASTROSIVAM').toUpperCase()
      const wmStyle: TextStyle = {
        stack: displayStack,
        size: nameSize,
        weight: 600,
        tracking: 0.24,
        color,
        align: 'left',
        uppercase: true,
      }
      const wmWidth = measure(ctx, name, wmStyle)
      const x = align === 'center' ? anchorX - wmWidth / 2 : align === 'right' ? anchorX - wmWidth : anchorX
      ctx.fillStyle = color
      const svgFont = `600 ${Math.round(nameSize)}px ${displayStack}`
      ctx.font = svgFont
      let cursor = x
      for (const ch of name) {
        ctx.fillText(ch, cursor, anchorY + nameSize)
        cursor += ctx.measureText(ch).width + nameSize * 0.24
      }
      void wmWidth
    }
    if (showName && img && spec.brand.name) {
      const name = spec.brand.name.toUpperCase()
      const s: TextStyle = {
        stack: bodyStack,
        size: nameSize * 0.62,
        weight: 500,
        tracking: 0.22,
        color,
        align: 'left',
      }
      const w = measure(ctx, name, s)
      const x = align === 'center' ? anchorX - w / 2 : align === 'right' ? anchorX - w : anchorX + size + nameSize * 0.5
      drawSingleLine(ctx, name, x, anchorY + nameSize, w, s)
    }
    ctx.restore()
  }

  return {
    ctx,
    W,
    H,
    u,
    aspect,
    spec,
    palette,
    typography: spec.typography,
    brand: spec.brand,
    assets,
    time: input.time,
    timeline,
    margin,
    safe,
    displayStack,
    bodyStack,
    displayName: input.displayName,
    bodyName: input.bodyName,
    report,
    createCanvas: input.createCanvas,
    text,
    label,
    style,
    art,
    hasArtwork,
    logo,
    rule: (x1, y1, x2, y2, color = alpha(palette.ink, 0.25), width = Math.max(0.7, u * 1.1)) => {
      strokeLine(ctx, x1, y1, x2, y2, color, width)
    },
    panel: (rect, fill, radius = 0) => {
      if (radius > 0) {
        ctx.save()
        roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.restore()
      } else {
        fillRect(ctx, rect, fill)
      }
    },
    issue: (issue) => report.issue(issue),
    reveal: (start, span = 0.45, distance = 0) => {
      const p = timeline.at(start, span)
      return { alpha: p, dy: (1 - p) * distance }
    },
    revealDraw: (start, span, draw, opts = {}) => {
      const p = timeline.at(start, span)
      ctx.save()
      if (opts.fade !== false) ctx.globalAlpha *= Math.max(0, Math.min(1, p))
      ctx.translate(0, (1 - p) * (opts.distance ?? 0))
      if (opts.scaleFrom && opts.scaleFrom !== 1) {
        const s = opts.scaleFrom + (1 - opts.scaleFrom) * p
        ctx.translate(W / 2, H / 2)
        ctx.scale(s, s)
        ctx.translate(-W / 2, -H / 2)
      }
      if (opts.mask && opts.mask !== 'none') {
        ctx.beginPath()
        if (opts.mask === 'up') ctx.rect(0, 0, W, H * p)
        else ctx.rect(0, 0, W * p, H)
        ctx.clip()
      }
      draw()
      ctx.restore()
    },
    soft: (amount = 0.3) => mix(palette.ink, palette.bg, amount),
  }
}

/* ── Shared background helpers used by several compositions ───────────────── */

export function paintBase(
  f: Frame,
  opts: { vignetteColor?: string; strength?: number; glowColor?: string; glowAt?: [number, number]; glowRadius?: number } = {},
) {
  const { ctx, W, H, palette } = f
  const g = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 112, [
    { at: 0, color: mix(palette.bg, palette.deep, 0.55) },
    { at: 0.5, color: palette.bg },
    { at: 1, color: mix(palette.bg, palette.accentAlt, palette.mode === 'dark' ? 0.12 : 0.1) },
  ])
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  if (opts.glowColor) {
    const at = opts.glowAt ?? [0.5, 0.42]
    glow(ctx, W * at[0], H * at[1], (opts.glowRadius ?? 0.62) * Math.max(W, H), opts.glowColor, 0.3)
  }
  ctx.restore()
}

export function drawVignette(f: Frame, strength = 0.5) {
  vignette(f.ctx, f.W, f.H, f.palette.deep, strength)
}

export function motifPlate(
  f: Frame,
  rect: Rect,
  opts: { fill?: string; radius?: number; border?: string; opacity?: number } = {},
) {
  const { ctx, palette, u } = f
  ctx.save()
  if (opts.fill) {
    ctx.globalAlpha *= opts.opacity ?? 1
    if (opts.radius) {
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius)
      ctx.fillStyle = opts.fill
      ctx.fill()
    } else {
      fillRect(ctx, rect, opts.fill)
    }
    ctx.restore()
    ctx.save()
  }
  if (opts.border) {
    if (opts.radius) {
      ctx.save()
      roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, opts.radius)
      ctx.strokeStyle = opts.border
      ctx.lineWidth = Math.max(0.8, u)
      ctx.stroke()
      ctx.restore()
    } else {
      strokeRect(ctx, rect, opts.border, Math.max(0.8, u))
    }
  }
  ctx.restore()
  void palette
}

export function brandStrip(
  f: Frame,
  opts: {
    y: number
    x?: number
    w?: number
    align?: 'left' | 'center' | 'right'
    logoSize?: number
    showLogo?: boolean
    color?: string
    rule?: boolean
  },
) {
  const { ctx, palette, u } = f
  const x = opts.x ?? f.safe.x
  const w = opts.w ?? f.safe.w
  const align = opts.align ?? 'left'
  const color = opts.color ?? palette.ink
  const logoSize = opts.logoSize ?? u * 34
  if (opts.rule !== false) {
    const ly = opts.y - u * 22
    strokeLine(ctx, x, ly, x + w, ly, alpha(palette.ink, 0.16), Math.max(0.6, u * 0.8))
  }
  const brandName = (f.brand.name || 'ASTROSIVAM').toUpperCase()
  const contact = f.brand.contact || f.spec.content.contact
  const web = f.brand.website || f.spec.content.website
  const right = [contact, web].filter(Boolean).join('  ·  ')

  if (opts.showLogo !== false) {
    const lx = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x
    f.logo({
      x: lx - (align === 'left' ? 0 : 0),
      y: opts.y - logoSize * 0.5,
      size: logoSize,
      align,
      color,
      showName: true,
      nameSize: u * 24,
    })
  } else {
    ctx.fillStyle = alpha(color, 0.9)
    const s = f.style(u * 20, { tracking: 0.2, uppercase: true, weight: 500 })
    ctx.font = `500 ${Math.round(u * 20)}px ${f.bodyStack}`
    const bw = measure(ctx, brandName, s)
    const bx = align === 'center' ? x + w / 2 - bw / 2 : align === 'right' ? x + w - bw : x
    drawSingleLine(ctx, brandName, bx, opts.y, w, s)
  }

  if (right) {
    const s = f.style(u * 18, {
      role: 'body',
      tracking: 0.06,
      uppercase: false,
      weight: 400,
      color: alpha(color, 0.75),
    })
    ctx.font = `400 ${Math.round(u * 18)}px ${f.bodyStack}`
    const rw = measure(ctx, right, s)
    const rx = align === 'center' ? x + w / 2 - rw / 2 : align === 'right' ? x + w - rw : x
    if (align === 'center') {
      drawSingleLine(ctx, right, rx, opts.y + u * 26, w, s)
    } else {
      drawSingleLine(ctx, ellipsize(ctx, right, w * 0.52, s), x + w - Math.min(rw, w * 0.52), opts.y + u * 4, w * 0.52, {
        ...s,
        align: 'right',
      })
    }
  }
}

export function sectionLabel(f: Frame, textStr: string, x: number, baseline: number, opts: { color?: string; size?: number; dot?: boolean } = {}) {
  const { ctx, palette, u } = f
  const size = opts.size ?? u * 20
  const color = opts.color ?? palette.accent
  if (opts.dot !== false) {
    fillEllipse(ctx, x + size * 0.22, baseline - size * 0.28, size * 0.16, size * 0.16, color)
  }
  f.label(textStr, x + size * 0.9, baseline, size, { color, tracking: 0.18, uppercase: true, w: f.W - x })
}

export function pill(f: Frame, rect: Rect, textStr: string, opts: { fill: string; color: string; size?: number; radius?: number }) {
  const { ctx, u } = f
  const radius = opts.radius ?? rect.h / 2
  roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, radius)
  ctx.fillStyle = opts.fill
  ctx.fill()
  const s = f.style(opts.size ?? u * 19, {
    role: 'body',
    weight: 600,
    tracking: 0.12,
    uppercase: true,
    color: opts.color,
    align: 'center',
  })
  drawSingleLine(ctx, textStr, rect.x + u * 6, rect.y + rect.h / 2 + (opts.size ?? u * 19) * 0.34, rect.w - u * 12, s)
}

export function cornerDots(f: Frame, color?: string) {
  const c = color ?? alpha(f.palette.accent, 0.55)
  dotRing(f.ctx, f.W / 2, f.H / 2, Math.min(f.W, f.H) * 0.46, 4, f.u * 2.2, c, Math.PI / 4)
}

export function imageOrArt(
  f: Frame,
  rect: Rect,
  opts: { motif?: MotifDrawOptions; radius?: number; opacity?: number } = {},
) {
  if (opts.radius) {
    f.ctx.save()
    roundRectPath(f.ctx, rect.x, rect.y, rect.w, rect.h, opts.radius)
    f.ctx.clip()
    f.art(rect, { ...(opts.motif ?? {}), opacity: opts.opacity })
    f.ctx.restore()
  } else {
    f.art(rect, { ...(opts.motif ?? {}), opacity: opts.opacity })
  }
}

export function assetImage(input: AssetImage | null | undefined): AssetImage | null {
  return input ?? null
}

export function safeArtRect(f: Frame, inset = 0): Rect {
  return {
    x: f.safe.x + inset,
    y: f.safe.y + inset,
    w: f.safe.w - inset * 2,
    h: f.safe.h - inset * 2,
  }
}

export function withAlpha(color: string, a: number) {
  return alpha(color, a)
}
