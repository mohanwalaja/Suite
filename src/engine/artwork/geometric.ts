import { alpha, mix, rng } from '../color'
import { hatch, sparkle } from '../draw'
import { type ArtContext, center, clipped, ring, softDisc } from './common'

/* ────────────────────────────────────────────────────────────────────────────
   Geometric strata — angular art-deco bands with engraved separations
   ──────────────────────────────────────────────────────────────────────────── */
export function drawGeometricStrata(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const rect = a.rect
  const lw = Math.max(0.6, a.u)

  ctx.save()
  const layers = 5
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1)
    const yBase = cy + R * 0.75 - i * R * 0.34
    const peak = R * (0.55 - i * 0.08)
    const tilt = R * (0.2 - i * 0.07)
    const g = ctx.createLinearGradient(cx - R, yBase - peak, cx + R, yBase)
    g.addColorStop(0, alpha(mix(palette.accent, palette.deep, 0.25 + t * 0.55), 0.9 - i * 0.1))
    g.addColorStop(1, alpha(mix(palette.accentAlt, palette.deep, 0.45 + t * 0.4), 0.75 - i * 0.1))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(rect.x, rect.y + rect.h)
    ctx.lineTo(rect.x, yBase)
    ctx.lineTo(cx - R * 0.55 + tilt, yBase - peak * 0.35)
    ctx.lineTo(cx - R * 0.1, yBase - peak)
    ctx.lineTo(cx + R * 0.35 + tilt * 0.5, yBase - peak * 0.55)
    ctx.lineTo(cx + R * 0.7, yBase - peak * 0.82)
    ctx.lineTo(rect.x + rect.w, yBase - peak * 0.25)
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = alpha(palette.accent, 0.35 - i * 0.04)
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(rect.x, yBase)
    ctx.lineTo(cx - R * 0.55 + tilt, yBase - peak * 0.35)
    ctx.lineTo(cx - R * 0.1, yBase - peak)
    ctx.lineTo(cx + R * 0.35 + tilt * 0.5, yBase - peak * 0.55)
    ctx.lineTo(cx + R * 0.7, yBase - peak * 0.82)
    ctx.lineTo(rect.x + rect.w, yBase - peak * 0.25)
    ctx.stroke()
  }

  // Sun disc with engraved line work
  const sunR = R * 0.24
  const sunY = cy - R * 0.18
  const sg = ctx.createLinearGradient(cx, sunY - sunR, cx, sunY + sunR)
  sg.addColorStop(0, alpha(palette.accent, 0.95))
  sg.addColorStop(1, alpha(palette.accent, 0.25))
  ctx.fillStyle = sg
  ctx.beginPath()
  ctx.arc(cx, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, sunY, sunR, 0, Math.PI * 2)
  ctx.clip()
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = alpha(palette.deep, 0.25)
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(cx - sunR, sunY + (i / 9) * sunR)
    ctx.lineTo(cx + sunR, sunY + (i / 9) * sunR)
    ctx.stroke()
  }
  ctx.restore()

  // Fine hatching in one band for texture
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x + rect.w * 0.05, cy + R * 0.2, rect.w * 0.24, R * 0.3)
  ctx.clip()
  hatch(ctx, { x: rect.x, y: cy + R * 0.1, w: rect.w, h: rect.h }, alpha(palette.ink, 0.16), R * 0.035, lw * 0.7, 62)
  ctx.restore()

  sparkle(ctx, cx + R * 0.62, cy - R * 0.62, R * 0.045, alpha(palette.accent, 0.7))
  ring(ctx, cx, cy - R * 0.18, sunR * 1.55, alpha(palette.accent, 0.18), lw * 0.8, [R * 0.012, R * 0.02])
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Painted hills — atmospheric layered landscape with celestial sky
   ──────────────────────────────────────────────────────────────────────────── */
export function drawPaintedHills(a: ArtContext) {
  const { ctx, palette } = a
  const rect = a.rect
  const lw = Math.max(0.6, a.u)
  const rand = rng(a.seed + 53)
  const horizon = rect.y + rect.h * 0.62
  const R = Math.min(rect.w, rect.h) / 2

  ctx.save()
  const sky = ctx.createLinearGradient(rect.x, rect.y, rect.x, horizon)
  sky.addColorStop(0, alpha(palette.deep, 0.9))
  sky.addColorStop(0.55, alpha(palette.surface, 0.75))
  sky.addColorStop(1, alpha(mix(palette.accent, palette.surface, 0.55), 0.5))
  ctx.fillStyle = sky
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)

  // Sun / moon
  const sx = rect.x + rect.w * (0.62 + (a.seed % 7) * 0.02)
  const sy = rect.y + rect.h * 0.36
  const sr = R * 0.34
  softDisc(ctx, sx, sy, sr * 2.4, palette.accent, 0.16)
  const disc = ctx.createRadialGradient(sx - sr * 0.28, sy - sr * 0.32, sr * 0.08, sx, sy, sr * 1.05)
  disc.addColorStop(0, alpha(mix(palette.ink, palette.accent, 0.35), 0.95))
  disc.addColorStop(0.5, alpha(palette.accent, 0.75))
  disc.addColorStop(1, alpha(mix(palette.accent, palette.deep, 0.55), 0.6))
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(sx, sy, sr, 0, Math.PI * 2)
  ctx.fill()
  // craters
  const cr = rng(a.seed + 91)
  for (let i = 0; i < 5; i++) {
    const ang = cr() * Math.PI * 2
    const d = cr() * sr * 0.62
    const rr = sr * (0.05 + cr() * 0.1)
    ctx.fillStyle = alpha(palette.deep, 0.12 + cr() * 0.1)
    ctx.beginPath()
    ctx.arc(sx + Math.cos(ang) * d, sy + Math.sin(ang) * d, rr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.save()
  ctx.beginPath()
  ctx.arc(sx, sy, sr, 0, Math.PI * 2)
  ctx.clip()
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = alpha(palette.deep, 0.16)
    ctx.lineWidth = Math.max(0.7, sr * 0.03)
    ctx.beginPath()
    ctx.moveTo(sx - sr, sy + (i / 7) * sr * 0.9)
    ctx.lineTo(sx + sr, sy + (i / 7) * sr * 0.9)
    ctx.stroke()
  }
  ctx.restore()

  // Stars
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = alpha(palette.ink, 0.25 + rand() * 0.5)
    ctx.beginPath()
    ctx.arc(rect.x + rand() * rect.w, rect.y + rand() * rect.h * 0.5, Math.max(0.5, rand() * a.u * 1.6), 0, Math.PI * 2)
    ctx.fill()
  }

  // Hills / ridges
  const layers = [
    { y: 0.58, amp: 0.1, shade: 0.55 },
    { y: 0.68, amp: 0.09, shade: 0.7 },
    { y: 0.78, amp: 0.08, shade: 0.85 },
    { y: 0.9, amp: 0.06, shade: 1 },
  ]
  layers.forEach((layer, li) => {
    const baseY = rect.y + rect.h * layer.y
    const g = ctx.createLinearGradient(rect.x, baseY - rect.h * 0.18, rect.x, rect.y + rect.h)
    const ridge = mix(palette.accent, palette.ink, 0.28 - li * 0.05)
    g.addColorStop(0, alpha(mix(ridge, palette.deep, 0.3 + li * 0.1), 0.92))
    g.addColorStop(1, alpha(mix(palette.deep, '#000000', 0.45), 0.97))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(rect.x, rect.y + rect.h)
    ctx.lineTo(rect.x, baseY)
    let x = rect.x
    let idx = 0
    while (x < rect.x + rect.w) {
      const step = rect.w * 0.14
      const h = Math.sin((x - rect.x) / rect.w * 7 + li * 2.1 + a.seed * 0.1) * rect.h * layer.amp
      ctx.quadraticCurveTo(x + step * 0.5, baseY + h, x + step, baseY + h * 0.35)
      x += step
      idx++
    }
    void idx
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = alpha(palette.accent, 0.16)
    ctx.lineWidth = lw
    ctx.stroke()
  })

  // Temple silhouette on the second ridge — a small gopuram with finials
  const tx = rect.x + rect.w * 0.15
  const ty = rect.y + rect.h * 0.93
  const th = rect.h * 0.22
  ctx.fillStyle = alpha(palette.deep, 0.96)
  ctx.beginPath()
  ctx.moveTo(tx - th * 0.52, ty)
  const tiers = 4
  let tw = th * 0.52
  for (let i = 0; i < tiers; i++) {
    const yTop = ty - th * (0.2 + i * 0.18)
    const nw = tw * 0.8
    ctx.lineTo(tx - tw, yTop + th * 0.07)
    ctx.lineTo(tx - nw, yTop + th * 0.07)
    ctx.lineTo(tx - nw, yTop)
    tw = nw
  }
  ctx.lineTo(tx - tw * 0.35, ty - th * 1.0)
  ctx.lineTo(tx, ty - th * 1.22)
  ctx.lineTo(tx + tw * 0.35, ty - th * 1.0)
  tw = th * 0.52
  for (let i = 0; i < tiers; i++) {
    const k = tiers - 1 - i
    const wHere = tw * Math.pow(0.8, k)
    const wNext = tw * Math.pow(0.8, k + 1)
    const yTop = ty - th * (0.2 + k * 0.18)
    ctx.lineTo(tx + wNext, yTop)
    ctx.lineTo(tx + wNext, yTop + th * 0.07)
    ctx.lineTo(tx + wHere, yTop + th * 0.07)
  }
  ctx.lineTo(tx + th * 0.52, ty)
  ctx.closePath()
  ctx.fill()
  // Finial glint
  ctx.strokeStyle = alpha(palette.accent, 0.45)
  ctx.lineWidth = Math.max(0.8, rect.h * 0.003)
  ctx.beginPath()
  ctx.moveTo(tx, ty - th * 1.22)
  ctx.lineTo(tx, ty - th * 1.34)
  ctx.stroke()

  // Birds
  ctx.strokeStyle = alpha(palette.ink, 0.5)
  ctx.lineWidth = lw
  for (let i = 0; i < 3; i++) {
    const bx = rect.x + rect.w * (0.55 + i * 0.08)
    const by = rect.y + rect.h * (0.3 + i * 0.04)
    const s = R * 0.035
    ctx.beginPath()
    ctx.moveTo(bx - s, by)
    ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.6, bx, by)
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.6, bx + s, by)
    ctx.stroke()
  }

  // Haze at horizon
  const haze = ctx.createLinearGradient(rect.x, horizon - rect.h * 0.16, rect.x, horizon + rect.h * 0.12)
  haze.addColorStop(0, alpha(palette.accent, 0))
  haze.addColorStop(0.55, alpha(palette.accent, 0.14))
  haze.addColorStop(1, alpha(palette.accent, 0))
  ctx.fillStyle = haze
  ctx.fillRect(rect.x, horizon - rect.h * 0.16, rect.w, rect.h * 0.28)
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Topographic — nested contour field used as a quiet background structure
   ──────────────────────────────────────────────────────────────────────────── */
export function drawTopographic(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const rand = rng(a.seed + 71)
  const lw = Math.max(0.6, a.u * 0.9)
  const centers = Array.from({ length: 3 }, (_, i) => ({
    x: cx + (rand() - 0.5) * R * 1.1 + (i - 1) * R * 0.3,
    y: cy + (rand() - 0.5) * R * 1.1,
    speed: 0.4 + rand() * 0.7,
    squash: 0.6 + rand() * 0.4,
  }))

  ctx.save()
  clipped(ctx, a.rect, () => {
    centers.forEach((c, ci) => {
      const count = 16
      for (let i = 1; i <= count; i++) {
        const rr = (R * 1.4 * i) / count
        ctx.strokeStyle = alpha(palette.accent, (0.1 + (1 - i / count) * 0.18) * (ci === 0 ? 1 : 0.7))
        ctx.lineWidth = lw
        ctx.beginPath()
        for (let s = 0; s <= 90; s++) {
          const ang = (s / 90) * Math.PI * 2
          const wobble =
            1 +
            Math.sin(ang * 3 + i * 0.5 + ci) * 0.06 +
            Math.sin(ang * 5 - i * 0.3) * 0.03 +
            Math.cos(ang * 2 + ci * 2) * 0.04
          const x = c.x + Math.cos(ang) * rr * wobble
          const y = c.y + Math.sin(ang) * rr * wobble * c.squash
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }
    })
  })
  ctx.restore()
}
