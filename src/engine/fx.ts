import type { CanvasFactory, Palette } from './types'
import { alpha, rng } from './color'
import type { Ctx } from './draw'
import { clamp } from './color'

/**
 * Post-processing effects. These run after a composition has drawn its own
 * layout so every composition shares the same physical film treatment.
 */

const noiseTiles = new Map<string, { ctx: Ctx; size: number }>()

function noiseTile(createCanvas: CanvasFactory, seed: number, size = 256) {
  const key = `${seed}-${size}`
  const hit = noiseTiles.get(key)
  if (hit) return hit.ctx
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const image = ctx.createImageData(size, size)
  const rand = rng(seed)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 120 + rand() * 135
    image.data[i] = v
    image.data[i + 1] = v
    image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  noiseTiles.set(key, { ctx, size })
  return ctx
}

/** Film grain. Uses a cached noise tile when a canvas factory is available and
 *  falls back to sparse specks otherwise (e.g. inside a restricted iframe). */
export function grain(
  ctx: Ctx,
  W: number,
  H: number,
  amount: number,
  seed: number,
  createCanvas?: CanvasFactory,
  time = 0,
) {
  if (amount <= 0.001) return
  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = clamp(amount * 0.55, 0, 0.6)
  if (createCanvas) {
    const tile = noiseTile(createCanvas, seed + Math.floor(time * 6) * 7)
    if (tile) {
      const pattern = ctx.createPattern(tile.canvas as unknown as CanvasImageSource, 'repeat')
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
        return
      }
    }
  }
  const rand = rng(seed + Math.floor(time * 8))
  const count = Math.round((W * H) / 5200)
  for (let i = 0; i < count; i++) {
    const v = Math.round(rand() * 255)
    ctx.fillStyle = `rgba(${v},${v},${v},${0.2 + rand() * 0.5})`
    ctx.fillRect(rand() * W, rand() * H, 1.4, 1.4)
  }
  ctx.restore()
}

/** Slow diagonal light band. `progress` is 0..1 of a travel cycle. */
export function lightSweep(
  ctx: Ctx,
  W: number,
  H: number,
  progress: number,
  color: string,
  strength = 0.16,
  angle = 18,
) {
  const x = -0.35 * W + progress * (W * 1.7)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.translate(W / 2, H / 2)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.translate(-W / 2, -H / 2)
  const g = ctx.createLinearGradient(x - W * 0.22, 0, x + W * 0.22, 0)
  g.addColorStop(0, alpha(color, 0))
  g.addColorStop(0.35, alpha(color, strength * 0.55))
  g.addColorStop(0.5, alpha(color, strength))
  g.addColorStop(0.65, alpha(color, strength * 0.55))
  g.addColorStop(1, alpha(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(-H, -H, W + H * 2, H * 3)
  ctx.restore()
}

export type ParticleMode = 'dust' | 'ember' | 'star' | 'petal'

export function particles(
  ctx: Ctx,
  W: number,
  H: number,
  opts: {
    time: number
    count?: number
    color: string
    accent?: string
    seed?: number
    mode?: ParticleMode
    accentBase?: (index: number) => string | undefined
  },
) {
  const mode = opts.mode ?? 'dust'
  const count = opts.count ?? (mode === 'star' ? 90 : 55)
  const rand = rng(opts.seed ?? 9)
  ctx.save()
  ctx.globalCompositeOperation = mode === 'dust' ? 'source-over' : 'lighter'
  for (let i = 0; i < count; i++) {
    const seedX = rand()
    const seedY = rand()
    const size = (mode === 'star' ? 0.6 : 1.1) + rand() * (mode === 'star' ? 1.6 : 2.6)
    const speed = 0.04 + rand() * 0.16
    const sway = rand() * 6.28
    const drift = (mode === 'petal' ? 0.06 : 0.02) * W
    const x = (seedX * W + Math.sin(opts.time * 0.6 + sway) * drift + W) % W
    const y =
      mode === 'ember' || mode === 'petal'
        ? (seedY * H - opts.time * speed * H + H * 4) % H
        : (seedY * H + opts.time * speed * H * 0.35) % H
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(opts.time * 1.4 + i * 1.7))
    const col = opts.accentBase?.(i) ?? (i % 3 === 0 && opts.accent ? opts.accent : opts.color)
    ctx.fillStyle = alpha(col, (mode === 'star' ? 0.7 : 0.5) * twinkle)
    ctx.beginPath()
    if (mode === 'petal') {
      ctx.ellipse(x, y, size * 1.8, size * 0.8, opts.time + i, 0, Math.PI * 2)
    } else if (mode === 'ember') {
      ctx.ellipse(x, y, size * 0.8, size * 1.5, 0, 0, Math.PI * 2)
    } else {
      ctx.arc(x, y, size, 0, Math.PI * 2)
    }
    ctx.fill()
  }
  ctx.restore()
}

/** Intro transition: wipe / fade / zoom. `progress` 0..1 where 1 = fully shown. */
export function transitionOverlay(
  ctx: Ctx,
  W: number,
  H: number,
  kind: 'none' | 'wipe' | 'fade' | 'zoom',
  progress: number,
  palette: Palette,
) {
  if (kind === 'none' || progress >= 1) return
  const p = clamp(progress, 0, 1)
  ctx.save()
  if (kind === 'fade') {
    ctx.fillStyle = alpha(palette.deep, 1 - p)
    ctx.fillRect(0, 0, W, H)
  } else if (kind === 'wipe') {
    const edge = W * p
    ctx.fillStyle = alpha(palette.deep, 0.98)
    ctx.fillRect(edge, 0, W - edge, H)
    ctx.fillStyle = alpha(palette.accent, 0.85)
    ctx.fillRect(edge - W * 0.006, 0, Math.max(1.5, W * 0.004), H)
  }
  ctx.restore()
}

export function filmBars(ctx: Ctx, W: number, H: number, ratio = 0.055, color = '#000000') {
  const h = H * ratio
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, h)
  ctx.fillRect(0, H - h, W, h)
  ctx.restore()
}
