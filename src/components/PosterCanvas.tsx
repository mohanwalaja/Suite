import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DesignSpec, RenderAssets, RenderReport } from '../engine/types'
import { renderDesign } from '../engine/renderer'
import { resolveFormat } from '../engine/formats'
import { browserCanvasFactory } from '../lib/canvas'
import { cx } from './ui'

interface PosterCanvasProps {
  design: DesignSpec
  assets?: RenderAssets
  playing?: boolean
  /** Frame time when paused (motion scrubbing). */
  time?: number
  showSafe?: boolean
  interactiveArt?: boolean
  onReport?: (report: RenderReport) => void
  onTime?: (time: number) => void
  onArtOffset?: (offset: { x: number; y: number }) => void
  maxSize?: number
  className?: string
}

/**
 * Live preview. Renders through the same engine as PNG export, so what you see
 * is the actual composition output — never a separately built DOM mock.
 */
export function PosterCanvas({
  design,
  assets,
  playing = false,
  time = 0,
  showSafe = false,
  interactiveArt = false,
  onReport,
  onTime,
  onArtOffset,
  maxSize = 1300,
  className,
}: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const reportRef = useRef(onReport)
  reportRef.current = onReport
  const timeRef = useRef(onTime)
  timeRef.current = onTime
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const reportSig = useRef('')

  const format = resolveFormat(design)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const draw = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas || size.w < 8 || size.h < 8) return
      const dpr = Math.min(2.4, window.devicePixelRatio || 1)
      const fit = Math.min(size.w / format.width, size.h / format.height)
      const displayW = Math.max(64, Math.round(format.width * fit))
      const displayH = Math.max(64, Math.round(format.height * fit))
      const scale = Math.min(maxSize / format.width, dpr * fit)
      const w = Math.round(format.width * scale)
      const h = Math.round(format.height * scale)
      canvas.style.width = `${displayW}px`
      canvas.style.height = `${displayH}px`
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) return
      const report = renderDesign(ctx, {
        spec: design,
        width: w,
        height: h,
        time,
        assets,
        createCanvas: browserCanvasFactory,
        quality: 'full',
      })
      const signature = `${w}x${h}|${report.issues.map((i) => `${i.kind}:${i.message}`).join('|')}|${report.blocks.length}`
      if (signature !== reportSig.current) {
        reportSig.current = signature
        reportRef.current?.(report)
      }
    },
    [design, assets, size, format.width, format.height, maxSize],
  )

  // Static redraw
  useEffect(() => {
    if (playing) return
    draw(time)
  }, [draw, playing, time])

  // Animation loop
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const start = performance.now()
    let lastReport = 0
    const duration = Math.max(1, design.animation.duration)
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000
      const t = design.animation.loop ? elapsed % duration : Math.min(duration, elapsed)
      draw(t)
      if (now - lastReport > 90) {
        lastReport = now
        timeRef.current?.(t)
      }
      if (!design.animation.loop && elapsed >= duration) {
        draw(duration)
        timeRef.current?.(duration)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, draw, design.animation.duration, design.animation.loop])

  const canDrag = interactiveArt && (design.art.mode === 'upload' || design.art.mode === 'provider') && !!onArtOffset

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDrag) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, ox: design.art.offsetX, oy: design.art.offsetY }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || !canvas || !onArtOffset) return
    const rect = canvas.getBoundingClientRect()
    const dx = (e.clientX - drag.x) / Math.max(1, rect.width)
    const dy = (e.clientY - drag.y) / Math.max(1, rect.height)
    onArtOffset({
      x: Math.max(-1, Math.min(1, drag.ox + dx)),
      y: Math.max(-1, Math.min(1, drag.oy + dy)),
    })
  }

  const endDrag = () => {
    dragRef.current = null
  }

  const base = Math.min(format.width, format.height)
  const margin = Math.max(format.width * 0.035, base * 0.082 * Math.min(1.9, Math.max(0.4, design.layout.margin)))
  const storyTop = format.height > format.width * 1.6 ? format.height * 0.07 : 0
  const storyBottom = format.height > format.width * 1.6 ? format.height * 0.11 : 0
  const safeInset = {
    x: (margin / format.width) * 100,
    top: ((margin + storyTop) / format.height) * 100,
    bottom: ((margin + storyBottom) / format.height) * 100,
  }
  return (
    <div ref={wrapRef} className={cx('relative flex h-full w-full items-center justify-center', className)}>
      <div className="relative" style={{ width: 'fit-content' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cx(
            'block rounded-[3px] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10',
            canDrag ? 'cursor-grab active:cursor-grabbing' : '',
          )}
          style={{ touchAction: canDrag ? 'none' : undefined }}
          aria-label={`${design.name} poster preview`}
          role="img"
        />
        {showSafe ? (
          <div
            className="pointer-events-none absolute border border-dashed border-cyan-300/45"
            style={{
              left: `${safeInset.x}%`,
              right: `${safeInset.x}%`,
              top: `${safeInset.top}%`,
              bottom: `${safeInset.bottom}%`,
            }}
          >
            <span className="absolute -top-5 left-0 rounded bg-cyan-400/15 px-1 text-[9px] uppercase tracking-[0.14em] text-cyan-200/80">
              Safe margin
            </span>
          </div>
        ) : null}
        {canDrag ? (
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur">
            Drag to reposition artwork
          </span>
        ) : null}
      </div>
    </div>
  )
}

/* ── Thumbnails ──────────────────────────────────────────────────────────── */

const thumbCache = new Map<string, string>()

export function designThumbnail(design: DesignSpec, assets?: RenderAssets, width = 260): string {
  const key = `${design.id}:${design.updatedAt}:${design.compositionId}:${design.paletteId}:${design.formatId}:${design.content.headline}:${width}`
  const cached = thumbCache.get(key)
  if (cached) return cached
  const format = resolveFormat(design)
  const scale = width / format.width
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(2, Math.round(width))
  canvas.height = Math.max(2, Math.round(format.height * scale))
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return ''
  try {
    renderDesign(ctx, {
      spec: design,
      width: canvas.width,
      height: canvas.height,
      static: true,
      assets,
      createCanvas: browserCanvasFactory,
      quality: 'draft',
    })
  } catch (error) {
    console.warn('Thumbnail render failed', error)
    return ''
  }
  const url = canvas.toDataURL('image/jpeg', 0.82)
  if (thumbCache.size > 160) {
    const first = thumbCache.keys().next().value
    if (first) thumbCache.delete(first)
  }
  thumbCache.set(key, url)
  return url
}

export function PosterThumb({
  design,
  assets,
  width = 260,
  className,
}: {
  design: DesignSpec
  assets?: RenderAssets
  width?: number
  className?: string
}) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    const id = window.setTimeout(() => {
      const url = designThumbnail(design, assets, width)
      if (alive) setSrc(url)
    }, 30)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [design, assets, width])

  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-white/[0.03]', className)}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
      ) : (
        <div className="skeleton h-full w-full" />
      )}
    </div>
  )
}
