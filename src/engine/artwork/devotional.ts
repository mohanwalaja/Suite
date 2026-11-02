import { alpha, mix, rng } from '../color'
import { arcStroke, dotRing, starPath } from '../draw'
import {
  type ArtContext,
  center,
  flame,
  kalasam,
  lotusBloom,
  ornamentDots,
  petalPath,
  radialRepeat,
  ring,
  softDisc,
  tickRing,
} from './common'

const lwOf = (a: ArtContext, k = 1.2) => Math.max(0.6, a.u * k)

/* ────────────────────────────────────────────────────────────────────────────
   Gopuram — tiered temple tower with kalasam finials and an arched gateway
   ──────────────────────────────────────────────────────────────────────────── */
export function drawTempleGopuram(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.8)
  const baseY = cy + R * 0.82
  const baseW = R * 1.32
  const tiers = 5
  const towerTop = cy - R * 0.72
  const tierH = (baseY - towerTop) / tiers
  const silhouette = alpha(palette.deep, 0.92)

  ctx.save()
  softDisc(ctx, cx, cy + R * 0.1, R * 1.05, palette.accent, 0.08)

  // Silhouette body — stepped tiers built from a left profile + mirrored right
  const leftPts: Array<[number, number]> = [[cx - baseW / 2, baseY]]
  for (let i = 0; i < tiers; i++) {
    const yTop = baseY - (i + 1) * tierH
    const wHere = baseW * Math.pow(0.82, i)
    const wNext = baseW * Math.pow(0.82, i + 1)
    leftPts.push([cx - wHere / 2, yTop + tierH * 0.2])
    leftPts.push([cx - wNext / 2, yTop + tierH * 0.2])
    leftPts.push([cx - wNext / 2, yTop])
  }
  const topY = baseY - tiers * tierH
  ctx.fillStyle = ctx.createLinearGradient(cx, topY, cx, baseY)
  ctx.fillStyle = silhouette
  ctx.beginPath()
  leftPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  for (let i = leftPts.length - 1; i >= 0; i--) {
    ctx.lineTo(cx * 2 - leftPts[i][0], leftPts[i][1])
  }
  ctx.closePath()
  ctx.fill()

  // Tier mouldings + niches
  let w = baseW
  let y = baseY
  for (let i = 0; i < tiers; i++) {
    const topY = y - tierH
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(cx - w / 2, topY + tierH * 0.16)
    ctx.lineTo(cx + w / 2, topY + tierH * 0.16)
    ctx.stroke()
    ctx.strokeStyle = alpha(palette.accent, 0.25)
    ctx.beginPath()
    ctx.moveTo(cx - w / 2, topY + tierH * 0.07)
    ctx.lineTo(cx + w / 2, topY + tierH * 0.07)
    ctx.stroke()

    const niches = Math.max(3, 7 - i)
    for (let n = 0; n < niches; n++) {
      const nx = cx - w / 2 + (w / (niches + 1)) * (n + 1)
      ctx.fillStyle = alpha(palette.accent, 0.2)
      ctx.beginPath()
      ctx.moveTo(nx - w * 0.022, topY + tierH * 0.72)
      ctx.lineTo(nx - w * 0.022, topY + tierH * 0.55)
      ctx.quadraticCurveTo(nx, topY + tierH * 0.43, nx + w * 0.022, topY + tierH * 0.55)
      ctx.lineTo(nx + w * 0.022, topY + tierH * 0.72)
      ctx.closePath()
      ctx.fill()
    }
    w *= 0.82
    y = topY
  }

  // Finials
  const finialY = towerTop - R * 0.08
  kalasam(ctx, cx, finialY, R * 0.15, gold, true)
  kalasam(ctx, cx - R * 0.2, finialY + R * 0.1, R * 0.1, alpha(palette.accent, 0.7), true)
  kalasam(ctx, cx + R * 0.2, finialY + R * 0.1, R * 0.1, alpha(palette.accent, 0.7), true)

  // Gateway
  const doorW = R * 0.42
  const doorH = R * 0.48
  const doorY = baseY
  const doorG = ctx.createLinearGradient(cx, doorY - doorH, cx, doorY)
  doorG.addColorStop(0, alpha(palette.accent, 0.32))
  doorG.addColorStop(1, alpha(palette.deep, 0.9))
  ctx.fillStyle = doorG
  ctx.beginPath()
  ctx.moveTo(cx - doorW / 2, doorY)
  ctx.lineTo(cx - doorW / 2, doorY - doorH * 0.62)
  ctx.quadraticCurveTo(cx - doorW / 2, doorY - doorH, cx, doorY - doorH)
  ctx.quadraticCurveTo(cx + doorW / 2, doorY - doorH, cx + doorW / 2, doorY - doorH * 0.62)
  ctx.lineTo(cx + doorW / 2, doorY)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 1.3
  ctx.stroke()
  // Door frame band
  ctx.beginPath()
  ctx.moveTo(cx - doorW * 0.66, doorY)
  ctx.lineTo(cx - doorW * 0.66, doorY - doorH * 0.6)
  ctx.quadraticCurveTo(cx - doorW * 0.66, doorY - doorH * 1.18, cx, doorY - doorH * 1.18)
  ctx.quadraticCurveTo(cx + doorW * 0.66, doorY - doorH * 1.18, cx + doorW * 0.66, doorY - doorH * 0.6)
  ctx.lineTo(cx + doorW * 0.66, doorY)
  ctx.strokeStyle = alpha(palette.accent, 0.4)
  ctx.lineWidth = lw * 0.9
  ctx.stroke()

  // Base platform
  ctx.fillStyle = alpha(palette.deep, 0.95)
  ctx.fillRect(cx - baseW * 0.62, baseY, baseW * 1.24, R * 0.09)
  ctx.strokeStyle = alpha(palette.accent, 0.45)
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(cx - baseW * 0.62, baseY)
  ctx.lineTo(cx + baseW * 0.62, baseY)
  ctx.stroke()

  // Lamp glow at the gateway
  softDisc(ctx, cx, baseY - doorH * 0.45, R * 0.2, palette.accent, 0.04)

  // Ground haze
  const haze = ctx.createLinearGradient(cx, baseY, cx, baseY + R * 0.5)
  haze.addColorStop(0, alpha(palette.accent, 0.14))
  haze.addColorStop(1, alpha(palette.accent, 0))
  ctx.fillStyle = haze
  ctx.fillRect(cx - R * 1.4, baseY, R * 2.8, R * 0.5)
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Temple arch — pillars, layered arch bands and a hanging lamp
   ──────────────────────────────────────────────────────────────────────────── */
export function drawTempleArch(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.72)
  const halfW = R * 0.78
  const top = cy - R * 0.85
  const bottom = cy + R * 0.8
  const springY = cy - R * 0.1

  ctx.save()
  const back = ctx.createLinearGradient(cx, top, cx, bottom)
  back.addColorStop(0, alpha(palette.accentAlt, 0.18))
  back.addColorStop(0.6, alpha(palette.deep, 0.5))
  back.addColorStop(1, alpha(palette.deep, 0.8))
  ctx.fillStyle = back
  ctx.beginPath()
  ctx.moveTo(cx - halfW, bottom)
  ctx.lineTo(cx - halfW, springY)
  ctx.quadraticCurveTo(cx - halfW, top, cx, top)
  ctx.quadraticCurveTo(cx + halfW, top, cx + halfW, springY)
  ctx.lineTo(cx + halfW, bottom)
  ctx.closePath()
  ctx.fill()

  // Nested arch bands
  for (let i = 0; i < 4; i++) {
    const k = 1 - i * 0.11
    ctx.beginPath()
    ctx.moveTo(cx - halfW * k, bottom)
    ctx.lineTo(cx - halfW * k, springY + R * 0.1 * i)
    ctx.quadraticCurveTo(cx - halfW * k, top + R * 0.16 * i, cx, top + R * 0.16 * i)
    ctx.quadraticCurveTo(cx + halfW * k, top + R * 0.16 * i, cx + halfW * k, springY + R * 0.1 * i)
    ctx.lineTo(cx + halfW * k, bottom)
    ctx.strokeStyle = i === 0 ? gold : alpha(palette.accent, 0.32 - i * 0.06)
    ctx.lineWidth = i === 0 ? lw * 1.5 : lw * 0.8
    ctx.stroke()
  }

  // Pillars
  for (const dir of [-1, 1]) {
    const px = cx + dir * halfW
    ctx.fillStyle = alpha(palette.deep, 0.85)
    ctx.fillRect(px - R * 0.06, springY, R * 0.12, bottom - springY)
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw
    ctx.strokeRect(px - R * 0.06, springY, R * 0.12, bottom - springY)
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = alpha(palette.accent, 0.3)
      ctx.beginPath()
      ctx.moveTo(px - R * 0.05, springY + ((bottom - springY) / 4) * (i + 0.5))
      ctx.lineTo(px + R * 0.05, springY + ((bottom - springY) / 4) * (i + 0.5))
      ctx.stroke()
    }
    // Capital and base
    ctx.fillStyle = alpha(palette.accent, 0.45)
    ctx.fillRect(px - R * 0.09, springY - R * 0.05, R * 0.18, R * 0.05)
    ctx.fillRect(px - R * 0.09, bottom - R * 0.03, R * 0.18, R * 0.06)
  }

  // Hanging chain and lamp
  const lampY = cy + R * 0.05
  ctx.strokeStyle = alpha(palette.accent, 0.45)
  ctx.lineWidth = lw * 0.8
  ctx.beginPath()
  ctx.moveTo(cx, top + R * 0.12)
  ctx.lineTo(cx, lampY - R * 0.14)
  ctx.stroke()
  for (let i = 0; i < 7; i++) {
    ctx.beginPath()
    ctx.arc(cx, top + R * 0.16 + i * R * 0.075, R * 0.012, 0, Math.PI * 2)
    ctx.stroke()
  }
  softDisc(ctx, cx, lampY - R * 0.02, R * 0.26, palette.accent, 0.06)
  flame(ctx, cx, lampY, R * 0.14, R * 0.03, [alpha(palette.ink, 0.95), alpha(palette.accent, 0.85)])
  ctx.fillStyle = alpha(palette.accent, 0.6)
  ctx.beginPath()
  ctx.ellipse(cx, lampY, R * 0.07, R * 0.022, 0, 0, Math.PI * 2)
  ctx.fill()

  // Arch ornament at apex
  kalasam(ctx, cx, top + R * 0.02, R * 0.12, gold, true)
  ornamentDots(ctx, cx, top + R * 0.26, R * 0.3, 9, alpha(palette.accent, 0.35), Math.max(0.7, R * 0.008))

  // Floor
  ctx.strokeStyle = alpha(palette.accent, 0.35)
  ctx.beginPath()
  ctx.moveTo(cx - halfW * 1.2, bottom)
  ctx.lineTo(cx + halfW * 1.2, bottom)
  ctx.stroke()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Vel & peacock — Murugan's spear, feather fan and six-pointed star
   ──────────────────────────────────────────────────────────────────────────── */
export function drawVelPeacock(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.85)

  ctx.save()
  softDisc(ctx, cx, cy - R * 0.15, R * 0.92, palette.accent, 0.1)

  // Feather fan behind the spear
  radialRepeat(ctx, cx, cy + R * 0.25, 9, (i) => {
    const spread = (i - 4) * 0.16
    ctx.save()
    ctx.rotate(spread + Math.PI)
    const g = ctx.createLinearGradient(0, 0, 0, -R * 0.95)
    g.addColorStop(0, alpha(palette.accentAlt, 0.05))
    g.addColorStop(0.55, alpha(palette.accentAlt, 0.3))
    g.addColorStop(1, alpha(palette.accentAlt, 0.06))
    ctx.fillStyle = g
    ctx.strokeStyle = alpha(palette.accentAlt, 0.35)
    ctx.lineWidth = lw * 0.7
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(-R * 0.18, -R * 0.55, 0, -R * 0.92)
    ctx.quadraticCurveTo(R * 0.18, -R * 0.55, 0, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // Feather eye
    ctx.fillStyle = alpha(palette.accent, 0.3)
    ctx.beginPath()
    ctx.ellipse(0, -R * 0.72, R * 0.055, R * 0.085, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(palette.accent, 0.6)
    ctx.stroke()
    ctx.restore()
  })

  // Halo ring
  ring(ctx, cx, cy - R * 0.15, R * 0.56, alpha(palette.accent, 0.35), lw * 0.9, [R * 0.015, R * 0.02])
  ring(ctx, cx, cy - R * 0.15, R * 0.63, alpha(palette.accent, 0.2), lw * 0.7)

  // Spear: leaf-shaped blade with a central ridge, shaft and base
  const bladeTop = cy - R * 0.82
  const bladeBottom = cy + R * 0.02
  const bladeHalf = R * 0.15
  const bladeG = ctx.createLinearGradient(cx - bladeHalf, 0, cx + bladeHalf, 0)
  bladeG.addColorStop(0, alpha(palette.ink, 0.35))
  bladeG.addColorStop(0.42, alpha(palette.accent, 0.95))
  bladeG.addColorStop(0.62, alpha(palette.ink, 0.6))
  bladeG.addColorStop(1, alpha(palette.accent, 0.5))
  ctx.fillStyle = bladeG
  ctx.beginPath()
  ctx.moveTo(cx, bladeTop)
  ctx.quadraticCurveTo(cx + bladeHalf * 0.9, cy - R * 0.5, cx + bladeHalf, bladeBottom)
  ctx.quadraticCurveTo(cx, bladeBottom + R * 0.06, cx - bladeHalf, bladeBottom)
  ctx.quadraticCurveTo(cx - bladeHalf * 0.9, cy - R * 0.5, cx, bladeTop)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 1.1
  ctx.stroke()
  ctx.strokeStyle = alpha(palette.deep, 0.35)
  ctx.lineWidth = lw * 0.8
  ctx.beginPath()
  ctx.moveTo(cx, bladeTop + R * 0.04)
  ctx.lineTo(cx, bladeBottom)
  ctx.stroke()

  // Socket and shaft
  ctx.fillStyle = alpha(palette.accent, 0.75)
  ctx.beginPath()
  ctx.moveTo(cx - R * 0.05, bladeBottom)
  ctx.lineTo(cx + R * 0.05, bladeBottom)
  ctx.lineTo(cx + R * 0.035, bladeBottom + R * 0.07)
  ctx.lineTo(cx - R * 0.035, bladeBottom + R * 0.07)
  ctx.closePath()
  ctx.fill()
  const shaftG = ctx.createLinearGradient(cx - R * 0.02, 0, cx + R * 0.02, 0)
  shaftG.addColorStop(0, alpha(palette.deep, 0.9))
  shaftG.addColorStop(0.5, alpha(palette.accent, 0.9))
  shaftG.addColorStop(1, alpha(palette.deep, 0.9))
  ctx.fillStyle = shaftG
  ctx.fillRect(cx - R * 0.022, bladeBottom + R * 0.07, R * 0.044, R * 0.62)

  // Six-pointed star (Shanmukha) above
  const starY = bladeTop - R * 0.06
  ctx.fillStyle = alpha(palette.accent, 0.95)
  starPath(ctx, cx, starY, R * 0.1, R * 0.045, 6, 0)
  ctx.fill()
  ctx.strokeStyle = alpha(palette.ink, 0.4)
  ctx.lineWidth = lw * 0.7
  ctx.stroke()
  ctx.fillStyle = alpha(palette.deep, 0.9)
  ctx.beginPath()
  ctx.arc(cx, starY, R * 0.018, 0, Math.PI * 2)
  ctx.fill()

  // Peacock feather accents either side of the shaft
  for (const dir of [-1, 1]) {
    ctx.save()
    ctx.translate(cx + dir * R * 0.5, cy + R * 0.36)
    ctx.rotate(dir * 0.5)
    ctx.strokeStyle = alpha(palette.accentAlt, 0.55)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.moveTo(0, R * 0.2)
    ctx.quadraticCurveTo(dir * R * 0.12, -R * 0.05, 0, -R * 0.22)
    ctx.stroke()
    ctx.fillStyle = alpha(palette.accent, 0.32)
    ctx.beginPath()
    ctx.ellipse(0, -R * 0.22, R * 0.035, R * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(palette.accent, 0.55)
    ctx.stroke()
    ctx.restore()
  }

  // Base lotus
  ctx.save()
  ctx.translate(cx, bladeBottom + R * 0.76)
  for (let i = 0; i < 7; i++) {
    ctx.save()
    ctx.rotate((i - 3) * 0.24 + Math.PI)
    ctx.fillStyle = alpha(palette.accent, 0.18)
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw * 0.8
    petalPath(ctx, R * 0.06, R * 0.2, R * 0.055, 0.6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Trishul & crescent — Shaiyite symbolism
   ──────────────────────────────────────────────────────────────────────────── */
export function drawTrishulCrescent(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.85)

  ctx.save()
  softDisc(ctx, cx, cy - R * 0.2, R * 0.95, palette.accent, 0.09)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.16)
  for (let i = 0; i < 3; i++) {
    arcStroke(
      ctx,
      0,
      0,
      R * (0.74 + i * 0.07),
      Math.PI * 0.62,
      Math.PI * 1.38,
      alpha(palette.accent, 0.22 - i * 0.05),
      lw * (1.4 - i * 0.3),
    )
  }
  ctx.restore()

  // Crescent behind the trident
  const mx = cx + R * 0.1
  const my = cy - R * 0.52
  const mr = R * 0.3
  const cg = ctx.createLinearGradient(mx - mr, my - mr, mx + mr, my + mr)
  cg.addColorStop(0, alpha(palette.ink, 0.85))
  cg.addColorStop(1, alpha(palette.accent, 0.7))
  ctx.fillStyle = cg
  const startAngle = Math.PI * 0.6
  const endAngle = Math.PI * 1.4
  ctx.beginPath()
  ctx.arc(mx, my, mr, startAngle, endAngle, false)
  const sx = mx + Math.cos(startAngle) * mr
  const sy = my + Math.sin(startAngle) * mr
  ctx.quadraticCurveTo(mx + mr * 0.02, my, sx, sy)
  ctx.closePath()
  ctx.fill()

  // Trident
  const shaftTop = cy - R * 0.5
  const shaftBottom = cy + R * 0.9
  const shaftG = ctx.createLinearGradient(cx - R * 0.03, 0, cx + R * 0.03, 0)
  shaftG.addColorStop(0, alpha(palette.deep, 0.95))
  shaftG.addColorStop(0.5, alpha(palette.accent, 0.9))
  shaftG.addColorStop(1, alpha(palette.deep, 0.95))
  ctx.fillStyle = shaftG
  ctx.fillRect(cx - R * 0.026, shaftTop, R * 0.052, shaftBottom - shaftTop)
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 0.8
  ctx.strokeRect(cx - R * 0.026, shaftTop, R * 0.052, shaftBottom - shaftTop)

  // Prongs
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 2.2
  ctx.lineCap = 'round'
  const prongBase = shaftTop
  ctx.beginPath()
  ctx.moveTo(cx, prongBase + R * 0.06)
  ctx.lineTo(cx, prongBase - R * 0.26)
  ctx.stroke()
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx, prongBase + R * 0.06)
    ctx.quadraticCurveTo(cx + dir * R * 0.2, prongBase - R * 0.02, cx + dir * R * 0.24, prongBase - R * 0.2)
    ctx.stroke()
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.moveTo(cx + dir * R * 0.245, prongBase - R * 0.34)
    ctx.lineTo(cx + dir * R * 0.195, prongBase - R * 0.15)
    ctx.lineTo(cx + dir * R * 0.295, prongBase - R * 0.15)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = gold
  ctx.beginPath()
  ctx.moveTo(cx, prongBase - R * 0.34)
  ctx.lineTo(cx - R * 0.035, prongBase - R * 0.22)
  ctx.lineTo(cx + R * 0.035, prongBase - R * 0.22)
  ctx.closePath()
  ctx.fill()

  // Three tilak lines on the shaft
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = alpha(palette.ink, 0.55 - i * 0.1)
    ctx.lineWidth = lw * (2.4 - i * 0.6)
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.075, cy + R * 0.12 + i * R * 0.055)
    ctx.lineTo(cx + R * 0.075, cy + R * 0.12 + i * R * 0.055)
    ctx.stroke()
  }

  // Damaru at the shaft
  const damaruY = cy - R * 0.06
  ctx.save()
  ctx.translate(cx, damaruY)
  ctx.fillStyle = alpha(palette.accent, 0.55)
  ctx.strokeStyle = gold
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(-R * 0.11, -R * 0.05)
  ctx.lineTo(R * 0.11, -R * 0.05)
  ctx.lineTo(R * 0.035, 0)
  ctx.lineTo(R * 0.11, R * 0.05)
  ctx.lineTo(-R * 0.11, R * 0.05)
  ctx.lineTo(-R * 0.035, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // Snake coil
  ctx.strokeStyle = alpha(palette.accentAlt, 0.5)
  ctx.lineWidth = lw * 1.3
  ctx.beginPath()
  ctx.arc(cx + R * 0.35, cy + R * 0.08, R * 0.2, Math.PI * 0.2, Math.PI * 1.7)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + R * 0.53, cy - R * 0.16, R * 0.05, 0, Math.PI * 2)
  ctx.stroke()

  ornamentDots(ctx, cx, cy, R * 0.78, 18, alpha(palette.accent, 0.24), Math.max(0.6, R * 0.006))
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Ganesha motif — respectful abstract silhouette: crown, ears, trunk, modak
   ──────────────────────────────────────────────────────────────────────────── */
export function drawGaneshaMotif(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a, 1.3)
  const gold = alpha(palette.accent, 0.8)

  ctx.save()
  softDisc(ctx, cx, cy, R * 1.02, palette.accent, 0.08)
  lotusBloom(ctx, cx, cy + R * 0.62, R * 0.34, 9, alpha(palette.accent, 0.4), false, lw * 0.8)

  const headY = cy - R * 0.06
  const headW = R * 0.46
  const headH = R * 0.52
  const silhouette = alpha(palette.deep, 0.72)

  // Ears
  for (const dir of [-1, 1]) {
    ctx.fillStyle = silhouette
    ctx.strokeStyle = gold
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(cx + dir * headW * 0.55, headY - headH * 0.32)
    ctx.quadraticCurveTo(cx + dir * headW * 1.55, headY - headH * 0.5, cx + dir * headW * 1.62, headY + headH * 0.12)
    ctx.quadraticCurveTo(cx + dir * headW * 1.62, headY + headH * 0.62, cx + dir * headW * 0.7, headY + headH * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // Engraved ear curves
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = alpha(palette.accent, 0.28 - i * 0.06)
      ctx.lineWidth = lw * 0.7
      ctx.beginPath()
      ctx.moveTo(cx + dir * headW * 0.78, headY - headH * 0.18 + i * headH * 0.14)
      ctx.quadraticCurveTo(
        cx + dir * headW * (1.18 + i * 0.08),
        headY + headH * (0.02 + i * 0.1),
        cx + dir * headW * 0.9,
        headY + headH * (0.26 + i * 0.06),
      )
      ctx.stroke()
    }
  }

  // Head dome
  const headG = ctx.createLinearGradient(cx - headW, headY - headH, cx + headW, headY + headH)
  headG.addColorStop(0, alpha(palette.surface, 0.95))
  headG.addColorStop(0.6, alpha(palette.deep, 0.9))
  headG.addColorStop(1, alpha(palette.deep, 0.98))
  ctx.fillStyle = headG
  ctx.strokeStyle = gold
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.ellipse(cx, headY - headH * 0.08, headW, headH * 0.72, 0, Math.PI * 0.92, Math.PI * 2.08)
  ctx.quadraticCurveTo(cx + headW * 0.92, headY + headH * 0.42, cx + headW * 0.36, headY + headH * 0.52)
  ctx.quadraticCurveTo(cx, headY + headH * 0.6, cx - headW * 0.36, headY + headH * 0.52)
  ctx.quadraticCurveTo(cx - headW * 0.92, headY + headH * 0.42, cx - headW * 0.92, headY - headH * 0.02)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Crown
  ctx.fillStyle = alpha(palette.accent, 0.6)
  ctx.strokeStyle = gold
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(cx - headW * 0.72, headY - headH * 0.62)
  ctx.lineTo(cx - headW * 0.5, headY - headH * 0.96)
  ctx.lineTo(cx - headW * 0.2, headY - headH * 0.7)
  ctx.lineTo(cx, headY - headH * 1.1)
  ctx.lineTo(cx + headW * 0.2, headY - headH * 0.7)
  ctx.lineTo(cx + headW * 0.5, headY - headH * 0.96)
  ctx.lineTo(cx + headW * 0.72, headY - headH * 0.62)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Trunk — tapering spiral
  ctx.save()
  ctx.strokeStyle = alpha(palette.accent, 0.9)
  ctx.lineWidth = lw * 2.4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, headY + headH * 0.2)
  ctx.bezierCurveTo(cx + headW * 0.18, headY + headH * 0.55, cx - headW * 0.22, headY + headH * 0.72, cx - headW * 0.04, headY + headH * 0.98)
  ctx.bezierCurveTo(cx + headW * 0.12, headY + headH * 1.16, cx + headW * 0.3, headY + headH * 0.98, cx + headW * 0.14, headY + headH * 0.86)
  ctx.stroke()
  ctx.restore()

  // Tusks
  ctx.strokeStyle = alpha(palette.ink, 0.7)
  ctx.lineWidth = lw * 1.2
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx + dir * headW * 0.26, headY + headH * 0.34)
    ctx.quadraticCurveTo(cx + dir * headW * 0.44, headY + headH * 0.52, cx + dir * headW * 0.3, headY + headH * 0.6)
    ctx.stroke()
  }

  // Peaceful closed eyes
  ctx.strokeStyle = alpha(palette.ink, 0.55)
  ctx.lineWidth = lw
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx + dir * headW * 0.12, headY + headH * 0.02)
    ctx.quadraticCurveTo(cx + dir * headW * 0.26, headY + headH * 0.08, cx + dir * headW * 0.38, headY + headH * 0.01)
    ctx.stroke()
  }
  // Forehead tilak
  ctx.fillStyle = alpha(palette.accent, 0.85)
  ctx.beginPath()
  ctx.ellipse(cx, headY - headH * 0.34, headW * 0.04, headH * 0.065, 0, 0, Math.PI * 2)
  ctx.fill()

  // Modak sweets either side
  for (const dir of [-1, 1]) {
    const mx = cx + dir * R * 0.62
    const my = cy + R * 0.72
    ctx.fillStyle = alpha(palette.accent, 0.35)
    ctx.strokeStyle = alpha(palette.accent, 0.6)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.moveTo(mx, my - R * 0.08)
    ctx.quadraticCurveTo(mx + R * 0.09, my, mx + R * 0.06, my + R * 0.07)
    ctx.lineTo(mx - R * 0.06, my + R * 0.07)
    ctx.quadraticCurveTo(mx - R * 0.09, my, mx, my - R * 0.08)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  ornamentDots(ctx, cx, cy, R * 0.92, 24, alpha(palette.accent, 0.22), Math.max(0.6, R * 0.005))
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Shakti — chakra, trishul, yantra triangles, lotus for Durga compositions
   ──────────────────────────────────────────────────────────────────────────── */
export function drawDurgaShakti(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.8)

  ctx.save()
  softDisc(ctx, cx, cy, R, palette.accent, 0.09)

  // Spoked chakra
  const spokeR = R * 0.72
  ring(ctx, cx, cy, spokeR, alpha(palette.accent, 0.5), lw * 1.4)
  ring(ctx, cx, cy, spokeR * 0.92, alpha(palette.accent, 0.28), lw * 0.8)
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2
    ctx.strokeStyle = alpha(palette.accent, i % 3 === 0 ? 0.5 : 0.22)
    ctx.lineWidth = i % 3 === 0 ? lw * 1.1 : lw * 0.7
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(ang) * spokeR * 0.2, cy + Math.sin(ang) * spokeR * 0.2)
    ctx.lineTo(cx + Math.cos(ang) * spokeR * 0.9, cy + Math.sin(ang) * spokeR * 0.9)
    ctx.stroke()
  }
  tickRing(ctx, cx, cy, spokeR * 1.06, 96, R * 0.025, alpha(palette.accent, 0.3), lw * 0.7)

  // Yantra triangles
  ctx.strokeStyle = alpha(palette.accent, 0.45)
  ctx.lineWidth = lw
  for (let i = 0; i < 2; i++) {
    const rr = R * (0.4 - i * 0.13)
    ctx.beginPath()
    ctx.moveTo(cx, cy - rr)
    ctx.lineTo(cx + rr * 0.87, cy + rr * 0.5)
    ctx.lineTo(cx - rr * 0.87, cy + rr * 0.5)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy + rr)
    ctx.lineTo(cx + rr * 0.87, cy - rr * 0.5)
    ctx.lineTo(cx - rr * 0.87, cy - rr * 0.5)
    ctx.closePath()
    ctx.stroke()
  }

  // Central trishul
  const top = cy - R * 0.96
  const bottom = cy + R * 0.86
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, top + R * 0.2)
  ctx.lineTo(cx, bottom)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, top + R * 0.2)
  ctx.lineTo(cx, top)
  ctx.stroke()
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx, top + R * 0.28)
    ctx.quadraticCurveTo(cx + dir * R * 0.22, top + R * 0.18, cx + dir * R * 0.26, top + R * 0.02)
    ctx.stroke()
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.moveTo(cx + dir * R * 0.26, top - R * 0.08)
    ctx.lineTo(cx + dir * R * 0.22, top + R * 0.04)
    ctx.lineTo(cx + dir * R * 0.3, top + R * 0.04)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = gold
  ctx.beginPath()
  ctx.moveTo(cx, top - R * 0.12)
  ctx.lineTo(cx - R * 0.04, top + R * 0.02)
  ctx.lineTo(cx + R * 0.04, top + R * 0.02)
  ctx.closePath()
  ctx.fill()

  // Lotus base
  ctx.save()
  ctx.translate(cx, cy + R * 0.8)
  for (let i = 0; i < 9; i++) {
    ctx.save()
    ctx.rotate((i - 4) * 0.22 + Math.PI)
    ctx.fillStyle = alpha(palette.accentAlt, 0.16)
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw * 0.8
    petalPath(ctx, R * 0.06, R * 0.26, R * 0.07, 0.6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  // Lion paw / mane abstract arcs at base sides
  for (const dir of [-1, 1]) {
    ctx.strokeStyle = alpha(palette.accentAlt, 0.35)
    ctx.lineWidth = lw * 1.1
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(cx + dir * R * 0.52, cy + R * 0.74, R * (0.14 + i * 0.05), dir > 0 ? Math.PI * 1.1 : Math.PI * 1.6, dir > 0 ? Math.PI * 1.9 : Math.PI * 0.4)
      ctx.stroke()
    }
  }

  // Ash sparks
  const rand = rng(a.seed + 31)
  for (let i = 0; i < 26; i++) {
    const ang = rand() * Math.PI * 2
    const d = rand() * R * 0.95
    ctx.fillStyle = alpha(palette.ink, 0.15 + rand() * 0.3)
    ctx.beginPath()
    ctx.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, Math.max(0.5, rand() * R * 0.006), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Deepam — oil lamp with flame, glow and kolam arcs
   ──────────────────────────────────────────────────────────────────────────── */
export function drawDeepamLamp(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a)
  const gold = alpha(palette.accent, 0.8)

  ctx.save()
  softDisc(ctx, cx, cy - R * 0.18, R * 0.9, palette.accent, 0.12)

  // Kolam arcs behind
  for (let i = 0; i < 4; i++) {
    arcStroke(ctx, cx, cy + R * 0.6, R * (0.36 + i * 0.16), Math.PI * 1.06, Math.PI * 1.94, alpha(palette.accent, 0.16 - i * 0.03), lw * 0.8)
  }
  dotRing(ctx, cx, cy + R * 0.6, R * 0.34, 16, Math.max(0.8, R * 0.008), alpha(palette.accent, 0.3), Math.PI * 1.1, Math.PI * 0.8)

  // Lamp body
  const baseY = cy + R * 0.5
  const lampTop = cy - R * 0.02
  const bodyW = R * 0.9

  // Stand
  ctx.fillStyle = alpha(palette.deep, 0.9)
  ctx.strokeStyle = gold
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(cx - bodyW * 0.42, baseY)
  ctx.quadraticCurveTo(cx - bodyW * 0.18, baseY - R * 0.1, cx - bodyW * 0.1, baseY - R * 0.3)
  ctx.lineTo(cx + bodyW * 0.1, baseY - R * 0.3)
  ctx.quadraticCurveTo(cx + bodyW * 0.18, baseY - R * 0.1, cx + bodyW * 0.42, baseY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Oil bowl
  const bowlG = ctx.createLinearGradient(cx, lampTop, cx, lampTop + R * 0.3)
  bowlG.addColorStop(0, alpha(palette.accent, 0.75))
  bowlG.addColorStop(0.5, alpha(palette.accent, 0.35))
  bowlG.addColorStop(1, alpha(palette.deep, 0.95))
  ctx.fillStyle = bowlG
  ctx.beginPath()
  ctx.moveTo(cx - bodyW * 0.5, lampTop)
  ctx.quadraticCurveTo(cx, lampTop + R * 0.34, cx + bodyW * 0.5, lampTop)
  ctx.quadraticCurveTo(cx, lampTop - R * 0.06, cx - bodyW * 0.5, lampTop)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.stroke()

  // Spout
  ctx.fillStyle = alpha(palette.accent, 0.5)
  ctx.beginPath()
  ctx.moveTo(cx + bodyW * 0.36, lampTop - R * 0.01)
  ctx.quadraticCurveTo(cx + bodyW * 0.64, lampTop - R * 0.06, cx + bodyW * 0.6, lampTop - R * 0.14)
  ctx.quadraticCurveTo(cx + bodyW * 0.5, lampTop - R * 0.08, cx + bodyW * 0.28, lampTop + R * 0.02)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 0.8
  ctx.stroke()

  // Wick + flame
  ctx.strokeStyle = alpha(palette.ink, 0.5)
  ctx.lineWidth = lw * 2
  ctx.beginPath()
  ctx.moveTo(cx + bodyW * 0.52, lampTop - R * 0.1)
  ctx.lineTo(cx + bodyW * 0.55, lampTop - R * 0.18)
  ctx.stroke()
  flame(ctx, cx + bodyW * 0.55, lampTop - R * 0.17, R * 0.3, R * 0.055, [alpha(palette.ink, 0.98), alpha(palette.accent, 0.92)])
  flame(ctx, cx + bodyW * 0.55, lampTop - R * 0.19, R * 0.17, R * 0.025, [alpha(palette.surface, 0.95), alpha(palette.accent, 0.7)])
  softDisc(ctx, cx + bodyW * 0.55, lampTop - R * 0.26, R * 0.24, palette.accent, 0.12)

  // Engraved bowl bands
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = alpha(palette.accent, 0.35)
    ctx.lineWidth = lw * 0.7
    ctx.beginPath()
    ctx.moveTo(cx - bodyW * (0.42 - i * 0.12), lampTop + R * 0.06 + i * R * 0.04)
    ctx.quadraticCurveTo(cx, lampTop + R * (0.2 + i * 0.06), cx + bodyW * (0.42 - i * 0.12), lampTop + R * 0.06 + i * R * 0.04)
    ctx.stroke()
  }

  // Base plate + kolam dots
  ctx.fillStyle = alpha(palette.accent, 0.3)
  ctx.beginPath()
  ctx.ellipse(cx, baseY + R * 0.03, bodyW * 0.52, R * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = alpha(palette.accent, 0.5)
  ctx.stroke()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Kolam grid — symmetrical dot lattice with looping curves
   ──────────────────────────────────────────────────────────────────────────── */
export function drawKolamGrid(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const cols = 5
  const gap = (R * 1.55) / (cols - 1)
  const start = -((cols - 1) / 2) * gap
  const lw = lwOf(a, 1.1)
  const color = alpha(palette.accent, 0.55)

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.lineCap = 'round'

  // Dot lattice
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cx + start + c * gap
      const y = cy + start + r * gap * 0.98
      ctx.fillStyle = alpha(palette.accent, 0.5)
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1.1, gap * 0.035), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Looping curves woven between the dots
  const half = gap / 2
  for (let r = 0; r < cols - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const x = cx + start + c * gap + half
      const y = cy + start + r * gap * 0.98 + half * 0.98
      const k = half * 0.92
      ctx.strokeStyle = alpha(palette.accent, 0.32)
      ctx.lineWidth = lw * 0.9
      ctx.beginPath()
      ctx.moveTo(x - k, y)
      ctx.bezierCurveTo(x - k, y - k * 1.4, x + k, y - k * 1.4, x + k, y)
      ctx.bezierCurveTo(x + k, y + k * 1.4, x - k, y + k * 1.4, x - k, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y - k)
      ctx.bezierCurveTo(x + k * 1.4, y - k, x + k * 1.4, y + k, x, y + k)
      ctx.bezierCurveTo(x - k * 1.4, y + k, x - k * 1.4, y - k, x, y - k)
      ctx.stroke()
    }
  }

  // Outer frame with corner loops
  const size = gap * (cols - 1)
  ctx.strokeStyle = alpha(palette.accent, 0.42)
  ctx.lineWidth = lw * 1.2
  ctx.strokeRect(cx - size / 2 - half * 0.9, cy - size / 2 - half * 0.9, size + half * 1.8, size + half * 1.8)
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    ctx.strokeStyle = alpha(palette.accent, 0.3)
    ctx.beginPath()
    ctx.arc(cx + sx * (size / 2 + half * 0.9), cy + sy * (size / 2 + half * 0.9), half * 1.3, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Central lotus medallion
  lotusBloom(ctx, cx, cy, gap * 1.05, 8, alpha(palette.accent, 0.6), false, lw * 0.9)
  ring(ctx, cx, cy, gap * 1.25, alpha(palette.accent, 0.28), lw * 0.8, [gap * 0.05, gap * 0.05])
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Peacock feather — single elegant plume
   ──────────────────────────────────────────────────────────────────────────── */
export function drawPeacockFeather(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a, 1.1)
  const H = a.rect.h
  const topY = cy - H * 0.42
  const bottomY = cy + H * 0.46

  ctx.save()
  const quillG = ctx.createLinearGradient(cx, topY, cx + R * 0.3, bottomY)
  quillG.addColorStop(0, alpha(palette.ink, 0.55))
  quillG.addColorStop(1, alpha(palette.accentAlt, 0.5))
  ctx.strokeStyle = quillG
  ctx.lineWidth = lw * 2
  ctx.beginPath()
  ctx.moveTo(cx - R * 0.18, topY)
  ctx.bezierCurveTo(cx + R * 0.36, topY + H * 0.24, cx - R * 0.1, bottomY - H * 0.2, cx + R * 0.3, bottomY)
  ctx.stroke()

  // Barbs
  const N = Math.round(46 + a.detail * 30)
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const y = topY + H * 0.2 + t * H * 0.72
    const px = cx - R * 0.18 + Math.sin(t * 2.2) * R * 0.22 + t * R * 0.16
    const spread = R * 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + R * 0.08
    for (const dir of [-1, 1]) {
      ctx.strokeStyle = alpha(dir > 0 ? palette.accent : palette.accentAlt, 0.3 + 0.2 * Math.sin(t * Math.PI))
      ctx.lineWidth = lw * 0.65
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.quadraticCurveTo(px + dir * spread * 0.7, y - H * 0.02, px + dir * spread, y - H * 0.035)
      ctx.stroke()
    }
  }

  // Feather eye
  const eyeY = topY + H * 0.2
  const eyeH = H * 0.17
  const eyeW = R * 0.3
  const eyeG = ctx.createLinearGradient(cx - eyeW, eyeY - eyeH, cx + eyeW, eyeY + eyeH)
  eyeG.addColorStop(0, alpha(palette.accentAlt, 0.55))
  eyeG.addColorStop(0.5, alpha(palette.accent, 0.5))
  eyeG.addColorStop(1, alpha(palette.accentAlt, 0.3))
  ctx.fillStyle = eyeG
  ctx.beginPath()
  ctx.ellipse(cx, eyeY, eyeW, eyeH, 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = alpha(palette.accent, 0.75)
  ctx.lineWidth = lw
  ctx.stroke()
  ctx.fillStyle = alpha(palette.deep, 0.8)
  ctx.beginPath()
  ctx.ellipse(cx, eyeY, eyeW * 0.5, eyeH * 0.5, 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = alpha(palette.accent, 0.9)
  ctx.beginPath()
  ctx.ellipse(cx, eyeY, eyeW * 0.28, eyeH * 0.3, 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = alpha(palette.accent, 0.3)
  ctx.lineWidth = lw * 0.7
  for (let i = 1; i < 3; i++) {
    ctx.beginPath()
    ctx.ellipse(cx, eyeY, eyeW * (1 + i * 0.28), eyeH * (1 + i * 0.3), 0.05, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   Lotus crest — brand emblem with a monogram ring
   ──────────────────────────────────────────────────────────────────────────── */
export function drawLotusCrest(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = lwOf(a, 1.1)
  const gold = alpha(palette.accent, 0.7)

  ctx.save()
  ring(ctx, cx, cy, R * 0.98, alpha(palette.accent, 0.35), lw)
  ring(ctx, cx, cy, R * 0.9, alpha(palette.accent, 0.6), lw * 1.2)
  tickRing(ctx, cx, cy, R * 0.9, 72, R * 0.02, alpha(palette.accent, 0.25), lw * 0.6, 0, 6, R * 0.035)
  dotRing(ctx, cx, cy, R * 0.76, 40, Math.max(0.7, R * 0.006), alpha(palette.accent, 0.3))

  // Petal crown
  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI / 2 + (i - 3) * 0.36
    ctx.save()
    ctx.translate(cx, cy + R * 0.2)
    ctx.rotate(angle)
    const grad = ctx.createLinearGradient(0, 0, 0, -R * 0.78)
    grad.addColorStop(0, alpha(palette.accent, 0.08))
    grad.addColorStop(1, alpha(palette.accent, 0.38))
    ctx.fillStyle = grad
    ctx.strokeStyle = alpha(palette.accent, 0.65)
    ctx.lineWidth = lw
    petalPath(ctx, R * 0.12, R * (0.56 + (3 - Math.abs(i - 3)) * 0.09), R * 0.13, 0.6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  // Base petals
  ctx.save()
  ctx.translate(cx, cy + R * 0.2)
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate(Math.PI + (i - 2) * 0.5)
    ctx.fillStyle = alpha(palette.accentAlt, 0.1)
    ctx.strokeStyle = alpha(palette.accent, 0.35)
    ctx.lineWidth = lw * 0.8
    petalPath(ctx, R * 0.1, R * 0.34, R * 0.1, 0.6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  // Monogram ring
  ring(ctx, cx, cy + R * 0.16, R * 0.2, alpha(palette.accent, 0.7), lw * 1.1)
  ring(ctx, cx, cy + R * 0.16, R * 0.16, alpha(palette.accent, 0.35), lw * 0.7, [R * 0.008, R * 0.012])
  ctx.fillStyle = alpha(palette.accent, 0.9)
  starPath(ctx, cx, cy + R * 0.16, R * 0.055, R * 0.016, 4, 0)
  ctx.fill()

  // Side flourishes
  for (const dir of [-1, 1]) {
    ctx.strokeStyle = gold
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.moveTo(cx + dir * R * 0.12, cy + R * 0.62)
    ctx.quadraticCurveTo(cx + dir * R * 0.55, cy + R * 0.7, cx + dir * R * 0.72, cy + R * 0.5)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + dir * R * 0.72, cy + R * 0.44, R * 0.05, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

/** Blend helper re-exported for compositions that tint motifs. */
export function tintPalette(a: ArtContext) {
  return mix(a.palette.accent, a.palette.ink, 0.2)
}
