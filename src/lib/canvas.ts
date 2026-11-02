import type { CanvasFactory, CanvasLike, DesignSpec, RenderAssets, RenderReport } from '../engine/types'
import { renderDesign } from '../engine/renderer'
import { resolveFormat } from '../engine/formats'

export const browserCanvasFactory: CanvasFactory = (w, h) => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas as unknown as CanvasLike
}

export function createRenderCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('This browser could not create a 2D canvas context.')
  return { canvas, ctx }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image could not be loaded'))
    img.src = src
  })
}

export async function loadAssets(design: DesignSpec): Promise<RenderAssets> {
  const assets: RenderAssets = {}
  if (design.brand.logoDataUrl) {
    try {
      assets.logo = (await loadImage(design.brand.logoDataUrl)) as unknown as RenderAssets['logo']
    } catch {
      assets.logo = null
    }
  }
  const artSource =
    design.art.mode === 'upload'
      ? design.art.uploadDataUrl
      : design.art.mode === 'provider'
        ? design.art.providerImageDataUrl
        : null
  if (artSource) {
    try {
      assets.artwork = (await loadImage(artSource)) as unknown as RenderAssets['artwork']
    } catch {
      assets.artwork = null
    }
  }
  return assets
}

export interface PreviewResult {
  report: RenderReport
  canvas: HTMLCanvasElement
}

/** Render at a preview scale that keeps the canvas under a sensible pixel budget. */
export function renderPreview(
  design: DesignSpec,
  canvas: HTMLCanvasElement,
  opts: { maxSize?: number; time?: number; static?: boolean; assets?: RenderAssets },
): RenderReport {
  const format = resolveFormat(design)
  const maxSize = opts.maxSize ?? 1200
  const scale = Math.min(1, maxSize / Math.max(format.width, format.height))
  const w = Math.max(2, Math.round(format.width * scale))
  const h = Math.max(2, Math.round(format.height * scale))
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas unavailable')
  return renderDesign(ctx, {
    spec: design,
    width: w,
    height: h,
    time: opts.time ?? 0,
    static: opts.static ?? true,
    assets: opts.assets,
    createCanvas: browserCanvasFactory,
    quality: 'full',
  })
}

export interface ExportOptions {
  scale?: number
  quality?: number
  transparent?: boolean
  assets?: RenderAssets
}

export async function exportImage(
  design: DesignSpec,
  format: 'png' | 'jpeg',
  opts: ExportOptions = {},
): Promise<{ blob: Blob; width: number; height: number; report: RenderReport }> {
  const spec = { ...design, width: resolveFormat(design).width, height: resolveFormat(design).height }
  const scale = Math.min(4, Math.max(1, opts.scale ?? 1))
  const width = Math.round(spec.width * scale)
  const height = Math.round(spec.height * scale)
  const { canvas, ctx } = createRenderCanvas(width, height)
  const report = renderDesign(ctx, {
    spec,
    width,
    height,
    static: true,
    assets: opts.assets,
    createCanvas: browserCanvasFactory,
    quality: 'full',
  })
  const mime = format === 'png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, format === 'jpeg' ? (opts.quality ?? 0.94) : undefined),
  )
  if (!blob) throw new Error('The browser could not encode this image.')
  return { blob, width, height, report }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function safeFilename(name: string, suffix: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'astrosivam-poster'
  return `${base}-${suffix}`
}

/* ── Video export ─────────────────────────────────────────────────────────── */

export interface VideoSupport {
  supported: boolean
  mimeType: string
  extension: 'mp4' | 'webm'
  label: string
  reason?: string
}

const VIDEO_CANDIDATES: Array<{ mimeType: string; extension: 'mp4' | 'webm'; label: string }> = [
  { mimeType: 'video/mp4;codecs=avc1.42E01E', extension: 'mp4', label: 'MP4 · H.264 (hardware encoder)' },
  { mimeType: 'video/mp4', extension: 'mp4', label: 'MP4' },
  { mimeType: 'video/webm;codecs=vp9', extension: 'webm', label: 'WebM · VP9' },
  { mimeType: 'video/webm;codecs=vp8', extension: 'webm', label: 'WebM · VP8' },
  { mimeType: 'video/webm', extension: 'webm', label: 'WebM' },
]

export function detectVideoSupport(): VideoSupport {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return {
      supported: false,
      mimeType: '',
      extension: 'webm',
      label: 'Not supported',
      reason: 'This browser does not expose MediaRecorder.',
    }
  }
  if (typeof HTMLCanvasElement.prototype.captureStream !== 'function') {
    return {
      supported: false,
      mimeType: '',
      extension: 'webm',
      label: 'Not supported',
      reason: 'This browser cannot capture a canvas stream.',
    }
  }
  for (const candidate of VIDEO_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return { supported: true, ...candidate }
  }
  return {
    supported: false,
    mimeType: '',
    extension: 'webm',
    label: 'Not supported',
    reason: 'No supported recording codec was found.',
  }
}

export interface VideoExportOptions {
  assets?: RenderAssets
  fps?: number
  onProgress?: (progress: number) => void
  signal?: AbortSignal
  /** Long edge in pixels. 1080 keeps recording smooth on mobile. */
  longEdge?: number
}

/**
 * Real animation export: the design is drawn frame-by-frame at a fixed timestep
 * into a canvas whose stream is recorded by MediaRecorder. The resulting file is
 * a genuine video of the composition timeline — there is no fake progress state.
 */
export async function exportVideo(
  design: DesignSpec,
  opts: VideoExportOptions = {},
): Promise<{ blob: Blob; extension: 'mp4' | 'webm'; mimeType: string; duration: number; frames: number }> {
  const support = detectVideoSupport()
  if (!support.supported) throw new Error(support.reason ?? 'Video recording is not supported in this browser.')

  const format = resolveFormat(design)
  const longEdge = opts.longEdge ?? 1080
  const scale = Math.min(1, longEdge / Math.max(format.width, format.height))
  const width = Math.round((format.width * scale) / 2) * 2
  const height = Math.round((format.height * scale) / 2) * 2
  const { canvas, ctx } = createRenderCanvas(width, height)
  const fps = Math.min(60, Math.max(12, opts.fps ?? design.animation.fps ?? 30))
  const duration = Math.max(1, Math.min(30, design.animation.duration))
  const totalFrames = Math.round(duration * fps)

  // Draw the first frame before capture so the stream starts with content.
  renderDesign(ctx, {
    spec: design,
    width,
    height,
    time: 0,
    assets: opts.assets,
    createCanvas: browserCanvasFactory,
    quality: 'full',
  })
  const stream = canvas.captureStream(fps)
  const recorder = new MediaRecorder(stream, {
    mimeType: support.mimeType,
    videoBitsPerSecond: Math.min(16_000_000, Math.max(4_000_000, Math.round(width * height * fps * 0.14))),
  })
  const chunks: BlobPart[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve()
    recorder.onerror = () => reject(new Error('The recorder stopped unexpectedly.'))
  })

  recorder.start(200)
  const frameMs = 1000 / fps
  const startTime = performance.now()

  await new Promise<void>((resolve, reject) => {
    let frame = 0
    const tick = () => {
      if (opts.signal?.aborted) {
        reject(new DOMException('Export cancelled', 'AbortError'))
        return
      }
      const elapsed = performance.now() - startTime
      const targetFrame = Math.min(totalFrames, Math.floor(elapsed / frameMs))
      while (frame < targetFrame) {
        frame++
        const time = (frame / fps) * (design.animation.loop ? 1 : 1)
        renderDesign(ctx, {
          spec: design,
          width,
          height,
          time,
          assets: opts.assets,
          createCanvas: browserCanvasFactory,
          quality: 'full',
        })
      }
      opts.onProgress?.(Math.min(1, elapsed / (duration * 1000)))
      if (frame >= totalFrames) {
        resolve()
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  // Give the encoder a final moment to flush the last frame.
  await new Promise((r) => setTimeout(r, 120))
  recorder.stop()
  await stopped
  stream.getTracks().forEach((track) => track.stop())
  const blob = new Blob(chunks, { type: support.mimeType.split(';')[0] })
  if (blob.size === 0) throw new Error('Recording produced an empty file. Try a shorter duration.')
  return { blob, extension: support.extension, mimeType: support.mimeType, duration, frames: totalFrames }
}

export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a PNG, JPG, WebP or SVG image.')
  if (file.size > 4 * 1024 * 1024) throw new Error('Images must be smaller than 4 MB.')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsDataURL(file)
  })
}

/** Thumbnail data URL used by the gallery (JPEG keeps localStorage small). */
export function renderThumbnail(design: DesignSpec, assets?: RenderAssets, width = 420): string {
  const format = resolveFormat(design)
  const scale = width / format.width
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = Math.round(format.height * scale)
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return ''
  renderDesign(ctx, {
    spec: design,
    width: canvas.width,
    height: canvas.height,
    static: true,
    assets,
    createCanvas: browserCanvasFactory,
    quality: 'draft',
  })
  return canvas.toDataURL('image/jpeg', 0.78)
}
