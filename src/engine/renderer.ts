import type {
  CanvasFactory,
  DesignSpec,
  RenderAssets,
  RenderReport,
} from './types'
import { getPalette } from './palettes'
import { aspectClass, resolveFormat } from './formats'
import { getComposition } from './compositions'
import { createFrame, ReportBuilder } from './frame'
import { FONT_BY_ID } from './fonts'
import { clamp, mix, shade } from './color'
import { grain, lightSweep, particles, transitionOverlay } from './fx'
import { clearMeasureCache } from './text'

export interface RenderOptions {
  spec: DesignSpec
  time?: number
  width?: number
  height?: number
  assets?: RenderAssets
  createCanvas?: CanvasFactory
  /** Skip expensive post-processing (used for thumbnails). */
  quality?: 'full' | 'draft'
  /** Render the finished frame (all entrances complete, no intro overlay).
   *  Used for PNG/JPEG export and thumbnails. */
  static?: boolean
}

/**
 * The single source of truth for every rendering surface: editor preview,
 * PNG/JPEG export, video frames and Node sample generation all call this.
 */
export function renderDesign(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
): RenderReport {
  const { spec } = options
  const format = resolveFormat(spec)
  const W = Math.max(1, Math.round(options.width ?? format.width))
  const H = Math.max(1, Math.round(options.height ?? format.height))
  const time = options.static ? Math.max(1, spec.animation.duration) * 1.25 : (options.time ?? 0)
  const quality = options.quality ?? 'full'
  const basePalette = getPalette(spec.paletteId)
  const palette = applyOverrides(basePalette, spec)
  const composition = getComposition(spec.compositionId)
  const displayFont = FONT_BY_ID[spec.typography.displayFont] ?? FONT_BY_ID['Playfair Display']
  const bodyFont = FONT_BY_ID[spec.typography.bodyFont] ?? FONT_BY_ID['Inter']
  const report = new ReportBuilder()

  clearMeasureCache()
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  // Base fill guarantees no transparent edges in JPEG exports.
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, W, H)

  const aspect = aspectClass(W, H)
  const frame = createFrame({
    ctx,
    spec,
    palette,
    width: W,
    height: H,
    aspect,
    time,
    assets: options.assets ?? {},
    report,
    displayStack: displayFont.stack,
    bodyStack: bodyFont.stack,
    displayName: displayFont.id,
    bodyName: bodyFont.id,
    createCanvas: options.createCanvas,
  })

  // Scene transition is a real move: the composition is clipped revealing
  // itself from left (wipe) or scaled up into place (zoom).
  const anim = spec.animation
  const introProgress = options.static || !anim.enabled ? 1 : clamp(time / Math.max(0.35, anim.duration * 0.16), 0, 1)
  const u = Math.min(W, H) / 1080

  ctx.save()
  if (anim.enabled && anim.sceneTransition === 'zoom' && introProgress < 1) {
    const s = 1 + (1 - introProgress) * 0.12
    ctx.translate(W / 2, H / 2)
    ctx.scale(s, s)
    ctx.translate(-W / 2, -H / 2)
  }
  if (anim.enabled && anim.sceneTransition === 'wipe' && introProgress < 1) {
    ctx.beginPath()
    ctx.rect(0, 0, W * introProgress, H)
    ctx.clip()
  }
  if (anim.enabled && anim.sceneTransition === 'fade' && introProgress < 0.35) {
    ctx.globalAlpha = 0.55 + introProgress * 1.3
  }
  composition.render(frame)
  ctx.restore()

  if (spec.layout.frame) {
    // A real finish applied to every composition: inset double rule with
    // corner ticks, drawn after the layout so it frames the finished page.
    const inset = Math.min(W, H) * 0.045
    ctx.save()
    ctx.strokeStyle = `rgba(${hexToRgb(palette.accent)}, 0.55)`
    ctx.lineWidth = Math.max(1, Math.min(W, H) * 0.0016)
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2)
    ctx.strokeStyle = `rgba(${hexToRgb(palette.accent)}, 0.22)`
    ctx.lineWidth = Math.max(0.6, Math.min(W, H) * 0.0008)
    ctx.strokeRect(inset * 0.72, inset * 0.72, W - inset * 1.44, H - inset * 1.44)
    ctx.restore()
  }

  // ── Shared physical treatment ────────────────────────────────────────────
  if (quality === 'full') {
    if (spec.layout.grain > 0) {
      grain(ctx, W, H, spec.layout.grain * 0.7, 31, options.createCanvas, anim.enabled ? time : 0)
    }
    if (anim.enabled && anim.particles && !options.static) {
      const mode = palette.mode === 'dark' ? (palette.tags.includes('festival') ? 'ember' : 'dust') : 'petal'
      particles(ctx, W, H, {
        time,
        color: palette.ink,
        accent: palette.accent,
        seed: 5,
        count: Math.round((W * H) / 26000),
        mode,
      })
    }
    if (anim.enabled && anim.lightSweep && anim.duration > 0 && !options.static) {
      const cycle = 2.4
      const p = ((time / anim.duration) * (anim.duration / cycle)) % 1
      lightSweep(ctx, W, H, p, palette.ink, 0.12, 16)
    }
    if (anim.enabled && introProgress < 1) {
      transitionOverlay(ctx, W, H, anim.sceneTransition, introProgress, palette)
    }
  }

  if (aspect === 'story') {
    // Editorial hint: mark the safe zone used by the layout engine (very faint,
    // export-safe). Previews can toggle this separately.
    ctx.save()
    ctx.globalAlpha = 0.0
    ctx.restore()
  }

  ctx.restore()
  void u

  return {
    compositionId: composition.meta.id,
    paletteId: palette.id,
    motifId: spec.art.motifId,
    width: W,
    height: H,
    blocks: report.blocks,
    issues: dedupeIssues(report.issues),
    scannedAt: Date.now(),
  }
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const n = Number.parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(n)) return '255,255,255'
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function dedupeIssues(issues: RenderReport['issues']) {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    const key = `${issue.id}|${issue.kind}|${issue.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function applyOverrides<T extends ReturnType<typeof getPalette>>(palette: T, spec: DesignSpec): T {
  const o = spec.overrides
  if (!o || (!o.background && !o.ink && !o.accent)) return palette
  const next = { ...palette }
  if (o.ink) {
    next.ink = o.ink
    next.inkSoft = mix(o.ink, o.background ?? palette.bg, 0.35)
  }
  if (o.background) {
    next.bg = o.background
    next.surface = mix(o.background, next.ink, 0.06)
    next.deep = shade(o.background, 0.28)
  }
  if (o.accent) {
    next.accent = o.accent
    next.accentAlt = mix(o.accent, next.ink, 0.22)
  }
  return next
}

/** Render into a fresh canvas (browser + Node friendly). */
export function renderToCanvas(
  createCanvas: CanvasFactory,
  spec: DesignSpec,
  opts: {
    width?: number
    height?: number
    time?: number
    assets?: RenderAssets
    quality?: 'full' | 'draft'
    static?: boolean
  } = {},
) {
  const format = resolveFormat(spec)
  const width = Math.round(opts.width ?? format.width)
  const height = Math.round(opts.height ?? format.height)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  const report = renderDesign(ctx as unknown as CanvasRenderingContext2D, {
    ...opts,
    spec,
    width,
    height,
    createCanvas,
  })
  return { canvas, ctx, report }
}
