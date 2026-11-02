import { alpha, rng } from '../color'
import { arcStroke, dotRing, sparkle, starField, starPath } from '../draw'
import {
  type ArtContext,
  center,
  constellation,
  kalasam,
  lotusBloom,
  petalPath,
  radialRepeat,
  ring,
  sigil,
  softDisc,
  tickRing,
} from './common'

/* ────────────────────────────────────────────────────────────────────────────
   1 · Lotus mandala — 16 engraved petals, 8 expanded petals, dot halo, star core
   ──────────────────────────────────────────────────────────────────────────── */
export function drawMandalaLotus(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.7, a.u * 1.3)
  const detail = Math.round(8 + a.detail * 8)

  ctx.save()
  ctx.globalAlpha *= 0.95

  ring(ctx, cx, cy, R * 0.985, alpha(palette.accent, 0.55), lw)
  ring(ctx, cx, cy, R * 0.94, alpha(palette.accent, 0.32), lw * 0.8)
  tickRing(ctx, cx, cy, R * 0.93, 144, R * 0.035, alpha(palette.accent, 0.4), lw * 0.7)

  radialRepeat(ctx, cx, cy, detail, () => {
    const g = ctx.createLinearGradient(0, -R, 0, -R * 0.3)
    g.addColorStop(0, alpha(palette.accent, 0.3))
    g.addColorStop(1, alpha(palette.accentAlt, 0.04))
    ctx.fillStyle = g
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw * 0.85
    petalPath(ctx, R * 0.42, R * 0.9, R * 0.115, 0.62)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -R * 0.45)
    ctx.lineTo(0, -R * 0.85)
    ctx.strokeStyle = alpha(palette.ink, 0.22)
    ctx.stroke()
  }, Math.PI / detail)

  radialRepeat(ctx, cx, cy, 8, () => {
    ctx.fillStyle = alpha(palette.accentAlt, 0.07)
    ctx.strokeStyle = alpha(palette.accent, 0.42)
    ctx.lineWidth = lw
    petalPath(ctx, R * 0.3, R * 0.86, R * 0.2, 0.5)
    ctx.fill()
    ctx.stroke()
  }, Math.PI / 8)

  ring(ctx, cx, cy, R * 0.43, alpha(palette.accent, 0.4), lw * 0.9)
  ring(ctx, cx, cy, R * 0.4, alpha(palette.accent, 0.22), lw * 0.7, [R * 0.02, R * 0.02])

  lotusBloom(ctx, cx, cy, R * 0.36, 8, alpha(palette.accent, 0.85), false, lw)
  lotusBloom(ctx, cx, cy, R * 0.24, 8, alpha(palette.accentAlt, 0.7), false, lw * 0.8)

  dotRing(ctx, cx, cy, R * 0.66, 48, Math.max(0.8, R * 0.006), alpha(palette.accent, 0.55))

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22)
  core.addColorStop(0, alpha(palette.accent, 0.9))
  core.addColorStop(0.5, alpha(palette.accent, 0.18))
  core.addColorStop(1, alpha(palette.accent, 0))
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = alpha(palette.accent, 0.95)
  starPath(ctx, cx, cy, R * 0.13, R * 0.028, 8, -Math.PI / 2)
  ctx.fill()
  ctx.fillStyle = alpha(palette.deep, 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.028, 0, Math.PI * 2)
  ctx.fill()

  sparkle(ctx, cx + R * 0.6, cy - R * 0.62, R * 0.045, alpha(palette.ink, 0.55))
  sparkle(ctx, cx - R * 0.72, cy + R * 0.42, R * 0.032, alpha(palette.ink, 0.4))
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   2 · Sun mandala — radiant engraved rays, layered discs
   ──────────────────────────────────────────────────────────────────────────── */
export function drawMandalaSun(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.7, a.u * 1.2)

  ctx.save()
  const halo = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R)
  halo.addColorStop(0, alpha(palette.accent, 0.3))
  halo.addColorStop(0.45, alpha(palette.accent, 0.1))
  halo.addColorStop(1, alpha(palette.accent, 0))
  ctx.fillStyle = halo
  ctx.fillRect(a.rect.x, a.rect.y, a.rect.w, a.rect.h)

  radialRepeat(ctx, cx, cy, 60, (i) => {
    const long = i % 5 === 0
    const start = R * 0.24
    const end = R * (long ? 0.98 : 0.82)
    ctx.strokeStyle = alpha(palette.accent, long ? 0.6 : 0.28)
    ctx.lineWidth = long ? lw * 1.4 : lw * 0.7
    ctx.beginPath()
    ctx.moveTo(0, -start)
    ctx.lineTo(0, -end)
    ctx.stroke()
  })

  const disc = ctx.createRadialGradient(cx - R * 0.1, cy - R * 0.12, R * 0.05, cx, cy, R * 0.46)
  disc.addColorStop(0, alpha(palette.ink, 0.14))
  disc.addColorStop(0.55, alpha(palette.accent, 0.2))
  disc.addColorStop(1, alpha(palette.deep, 0.5))
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2)
  ctx.fill()

  ring(ctx, cx, cy, R * 0.45, alpha(palette.accent, 0.9), lw * 1.3)
  ring(ctx, cx, cy, R * 0.4, alpha(palette.accent, 0.4), lw * 0.7)
  ring(ctx, cx, cy, R * 0.33, alpha(palette.accent, 0.22), lw * 0.7, [R * 0.012, R * 0.018])
  tickRing(ctx, cx, cy, R * 0.37, 48, R * 0.02, alpha(palette.accent, 0.55), lw * 0.8)

  // Engraved horizontal light bands across the disc.
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.44, 0, Math.PI * 2)
  ctx.clip()
  for (let i = 0; i < 5; i++) {
    const y = cy + R * (0.06 + i * 0.075)
    ctx.strokeStyle = alpha(palette.deep, 0.35)
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(cx - R, y)
    ctx.lineTo(cx + R, y)
    ctx.stroke()
  }
  ctx.restore()

  dotRing(ctx, cx, cy, R * 0.56, 24, Math.max(0.9, R * 0.009), alpha(palette.accent, 0.4))
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   3 · Zodiac wheel — 12 engraved sectors, constellation marks, pointer arms
   ──────────────────────────────────────────────────────────────────────────── */
export function drawZodiacWheel(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.6, a.u * 1.1)
  const gold = alpha(palette.accent, 0.75)
  const faint = alpha(palette.accent, 0.3)

  ctx.save()
  const bg = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R)
  bg.addColorStop(0, alpha(palette.accentAlt, 0.16))
  bg.addColorStop(0.7, alpha(palette.accentAlt, 0.04))
  bg.addColorStop(1, alpha(palette.accentAlt, 0))
  ctx.fillStyle = bg
  ctx.fillRect(a.rect.x, a.rect.y, a.rect.w, a.rect.h)

  ring(ctx, cx, cy, R, faint, lw * 1.4)
  ring(ctx, cx, cy, R * 0.955, gold, lw)
  ring(ctx, cx, cy, R * 0.78, faint, lw)
  ring(ctx, cx, cy, R * 0.74, faint, lw * 0.7)
  ring(ctx, cx, cy, R * 0.45, alpha(palette.accent, 0.5), lw)
  ring(ctx, cx, cy, R * 0.4, faint, lw * 0.7)
  ring(ctx, cx, cy, R * 0.16, alpha(palette.accent, 0.55), lw)

  // 12 sector division lines
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2
    ctx.strokeStyle = alpha(palette.accent, i % 3 === 0 ? 0.6 : 0.3)
    ctx.lineWidth = i % 3 === 0 ? lw * 1.4 : lw * 0.8
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(ang) * R * 0.74, cy + Math.sin(ang) * R * 0.74)
    ctx.lineTo(cx + Math.cos(ang) * R * 0.955, cy + Math.sin(ang) * R * 0.955)
    ctx.stroke()
  }

  // Sigils inside each sector
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2
    ctx.save()
    ctx.translate(cx + Math.cos(ang) * R * 0.85, cy + Math.sin(ang) * R * 0.85)
    ctx.rotate(ang)
    sigil(ctx, i, R * 0.1, alpha(palette.accent, 0.85), lw * 1.1)
    ctx.restore()
  }

  // Constellations in the inner field
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2
    const rand = rng(a.seed + i * 97)
    const pts: Array<[number, number]> = []
    for (let p = 0; p < 3; p++) {
      const rr = R * (0.48 + rand() * 0.2)
      const aa = ang + (rand() - 0.5) * 0.4
      pts.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr])
    }
    ctx.strokeStyle = alpha(palette.accent, 0.35)
    ctx.lineWidth = lw * 0.7
    ctx.beginPath()
    pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()
    ctx.fillStyle = alpha(palette.ink, 0.75)
    for (const [x, y] of pts) {
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0.8, R * 0.008), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Pointer arms + core
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4
    ctx.strokeStyle = alpha(palette.accent, 0.28)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(ang) * R * 0.17, cy + Math.sin(ang) * R * 0.17)
    ctx.lineTo(cx + Math.cos(ang) * R * 0.72, cy + Math.sin(ang) * R * 0.72)
    ctx.stroke()
    ctx.save()
    ctx.translate(cx + Math.cos(ang) * R * 0.72, cy + Math.sin(ang) * R * 0.72)
    ctx.rotate(ang + Math.PI / 4)
    ctx.fillStyle = alpha(palette.accent, 0.6)
    ctx.fillRect(-R * 0.012, -R * 0.012, R * 0.024, R * 0.024)
    ctx.restore()
  }
  dotRing(ctx, cx, cy, R * 0.6, 72, Math.max(0.5, R * 0.004), alpha(palette.accent, 0.35))

  ctx.fillStyle = alpha(palette.accent, 0.9)
  starPath(ctx, cx, cy, R * 0.075, R * 0.018, 6, 0)
  ctx.fill()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   4 · Navagraha — nine planetary bodies on engraved orbital rings
   ──────────────────────────────────────────────────────────────────────────── */
export function drawNavagraha(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.6, a.u * 1.1)
  const rand = rng(a.seed + 11)

  ctx.save()
  starField(ctx, a.rect, Math.round(40 + a.detail * 60), alpha(palette.ink, 0.8), a.seed, {
    maxRadius: Math.max(0.7, a.u * 1.4),
    opacity: 0.5,
  })

  for (let i = 0; i < 3; i++) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((i * Math.PI) / 3 + 0.3)
    ctx.strokeStyle = alpha(palette.accent, 0.22)
    ctx.lineWidth = lw * 0.8
    ctx.setLineDash([R * 0.012, R * 0.018])
    ctx.beginPath()
    ctx.ellipse(0, 0, R * 0.92, R * 0.34, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  ring(ctx, cx, cy, R * 0.48, alpha(palette.accent, 0.3), lw, [R * 0.01, R * 0.016])
  ring(ctx, cx, cy, R * 0.95, alpha(palette.accent, 0.25), lw * 0.8)

  const planets = [
    { r: 0.145, dist: 0, ang: 0 },
    { r: 0.062, dist: 0.36, ang: 0.2 },
    { r: 0.05, dist: 0.5, ang: 0.95 },
    { r: 0.044, dist: 0.62, ang: 1.7 },
    { r: 0.085, dist: 0.55, ang: 2.4 },
    { r: 0.072, dist: 0.7, ang: 3.1 },
    { r: 0.055, dist: 0.62, ang: 3.85 },
    { r: 0.068, dist: 0.78, ang: 4.6 },
    { r: 0.048, dist: 0.5, ang: 5.35 },
  ]

  planets.forEach((p, i) => {
    const px = cx + Math.cos(p.ang) * R * p.dist
    const py = cy + Math.sin(p.ang) * R * p.dist * 0.92
    const pr = R * p.r
    const g = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.35, pr * 0.1, px, py, pr)
    if (i === 0) {
      g.addColorStop(0, alpha(palette.ink, 0.95))
      g.addColorStop(0.5, alpha(palette.accent, 0.9))
      g.addColorStop(1, alpha(palette.accent, 0.18))
    } else {
      g.addColorStop(0, alpha(palette.ink, 0.55))
      g.addColorStop(0.4, alpha(i % 2 ? palette.accentAlt : palette.accent, 0.5))
      g.addColorStop(1, alpha(palette.deep, 0.75))
    }
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(palette.accent, 0.5)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.stroke()

    // Terminator: a shaded crescent on the dark side.
    ctx.save()
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = alpha(palette.deep, 0.4)
    ctx.beginPath()
    ctx.arc(px + pr * 0.55, py + pr * 0.45, pr * 0.95, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    for (let s = 0; s < 3; s++) {
      const ringR = pr * (1.25 + s * 0.28)
      ctx.strokeStyle = alpha(palette.accent, 0.16 - s * 0.04)
      ctx.lineWidth = lw * 0.6
      ctx.beginPath()
      ctx.arc(px, py, ringR, rand() * Math.PI, rand() * Math.PI + 1.6)
      ctx.stroke()
    }
  })

  // Connecting engraved arcs between neighbouring planets.
  ctx.strokeStyle = alpha(palette.accent, 0.14)
  ctx.lineWidth = lw * 0.7
  for (let i = 0; i < planets.length - 1; i++) {
    const p1 = planets[i]
    const p2 = planets[i + 1]
    ctx.beginPath()
    ctx.arc(
      cx,
      cy,
      R * (0.4 + i * 0.045),
      p1.ang,
      p2.ang > p1.ang ? p2.ang : p2.ang + Math.PI * 2,
    )
    ctx.stroke()
  }
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   5 · Celestial orb — painted planet with rings, craters and atmosphere
   ──────────────────────────────────────────────────────────────────────────── */
export function drawCelestialOrb(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const r = R * 0.62
  const lw = Math.max(0.7, a.u * 1.2)

  ctx.save()
  starField(ctx, a.rect, Math.round(50 + a.detail * 70), alpha(palette.ink, 0.85), a.seed + 3, {
    maxRadius: Math.max(0.6, a.u * 1.5),
    opacity: 0.55,
  })
  softDisc(ctx, cx, cy, r * 2.1, palette.accent, 0.14)

  const sphere = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.1, cx + r * 0.1, cy + r * 0.15, r * 1.15)
  sphere.addColorStop(0, alpha(palette.ink, 0.55))
  sphere.addColorStop(0.28, alpha(palette.accent, 0.62))
  sphere.addColorStop(0.62, alpha(palette.accentAlt, 0.34))
  sphere.addColorStop(1, alpha(palette.deep, 0.95))
  ctx.fillStyle = sphere
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Latitude/longitude engraving, clipped to the sphere.
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  for (let i = 1; i < 7; i++) {
    const yy = cy - r + (i / 7) * r * 2
    ctx.strokeStyle = alpha(palette.deep, 0.18)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    ctx.ellipse(cx, yy, Math.sqrt(Math.max(0, r * r - (yy - cy) ** 2)), r * 0.13, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  const rand = rng(a.seed + 19)
  for (let i = 0; i < 9; i++) {
    const a2 = rand() * Math.PI * 2
    const d = rand() * r * 0.82
    const px = cx + Math.cos(a2) * d
    const py = cy + Math.sin(a2) * d * 0.9
    const pr = r * (0.03 + rand() * 0.085)
    ctx.fillStyle = alpha(palette.deep, 0.28)
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(palette.ink, 0.14)
    ctx.lineWidth = lw * 0.7
    ctx.beginPath()
    ctx.arc(px - pr * 0.1, py - pr * 0.1, pr * 0.92, Math.PI * 1.1, Math.PI * 1.9)
    ctx.stroke()
  }
  // Rim light
  ctx.strokeStyle = alpha(palette.ink, 0.5)
  ctx.lineWidth = lw * 1.6
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.99, Math.PI * 1.05, Math.PI * 1.62)
  ctx.stroke()
  ctx.restore()

  // Rings behind and in front of the sphere
  const tilt = -0.28
  const drawRingBand = (front: boolean) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(tilt)
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 1.62, r * 0.36, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
    ctx.strokeStyle = alpha(palette.accent, 0.55)
    ctx.lineWidth = Math.max(1.2, r * 0.05)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 1.85, r * 0.44, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
    ctx.strokeStyle = alpha(palette.accent, 0.24)
    ctx.lineWidth = Math.max(0.8, r * 0.02)
    ctx.stroke()
    ctx.restore()
  }
  drawRingBand(false)
  // Redraw the lower part of the sphere over the back ring so it reads as 3D.
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI)
  ctx.clip()
  const innerShade = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r)
  innerShade.addColorStop(0, alpha(palette.deep, 0))
  innerShade.addColorStop(1, alpha(palette.deep, 0.9))
  ctx.fillStyle = innerShade
  ctx.globalAlpha = 0.35
  ctx.fillRect(cx - r, cy, r * 2, r)
  ctx.restore()
  drawRingBand(true)

  // Moon
  ctx.fillStyle = alpha(palette.ink, 0.7)
  ctx.beginPath()
  ctx.arc(cx + r * 1.5, cy - r * 1.25, r * 0.09, 0, Math.PI * 2)
  ctx.fill()

  sparkle(ctx, cx - R * 0.85, cy - R * 0.7, R * 0.05, alpha(palette.ink, 0.7))
  sparkle(ctx, cx + R * 0.8, cy + R * 0.62, R * 0.032, alpha(palette.ink, 0.5))
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   6 · Orbit network — constellation map with orbital rings
   ──────────────────────────────────────────────────────────────────────────── */
export function drawOrbitNetwork(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.6, a.u)
  ctx.save()
  constellation(ctx, a.rect, 22, palette.accent, a.seed, a.u, Math.min(a.rect.w, a.rect.h) * 0.34)
  ring(ctx, cx, cy, R * 0.9, alpha(palette.accent, 0.24), lw, [R * 0.01, R * 0.02])
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.4)
  ctx.strokeStyle = alpha(palette.accentAlt, 0.3)
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.ellipse(0, 0, R * 0.7, R * 0.26, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  arcStroke(ctx, cx, cy, R * 0.52, 0.4, 3.6, alpha(palette.accent, 0.4), lw * 1.6)
  softDisc(ctx, cx, cy, R * 0.12, palette.accent, 0.1)
  ctx.fillStyle = alpha(palette.accent, 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.035, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   7 · Astrolabe — engraved graduated instrument used for editorial layouts
   ──────────────────────────────────────────────────────────────────────────── */
export function drawAstrolabe(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.6, a.u * 1.05)
  const gold = alpha(palette.accent, 0.7)
  ctx.save()

  ring(ctx, cx, cy, R, gold, lw * 1.3)
  ring(ctx, cx, cy, R * 0.96, alpha(palette.accent, 0.35), lw * 0.8)
  tickRing(ctx, cx, cy, R * 0.96, 180, R * 0.03, alpha(palette.accent, 0.4), lw * 0.7, 0, 15, R * 0.055)
  ring(ctx, cx, cy, R * 0.86, alpha(palette.accent, 0.28), lw * 0.8)
  ring(ctx, cx, cy, R * 0.58, alpha(palette.accent, 0.4), lw)
  tickRing(ctx, cx, cy, R * 0.58, 96, R * 0.02, alpha(palette.accent, 0.3), lw * 0.7)

  // Offset ecliptic circle
  const ex = cx + R * 0.1
  const ey = cy - R * 0.12
  ring(ctx, ex, ey, R * 0.46, alpha(palette.accentAlt, 0.4), lw * 1.1)
  tickRing(ctx, ex, ey, R * 0.42, 60, R * 0.018, alpha(palette.accentAlt, 0.25), lw * 0.7)

  // Alidade (pointer)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.72)
  ctx.strokeStyle = alpha(palette.accent, 0.6)
  ctx.lineWidth = lw * 1.2
  ctx.beginPath()
  ctx.moveTo(-R * 0.92, 0)
  ctx.lineTo(R * 0.92, 0)
  ctx.stroke()
  ctx.fillStyle = alpha(palette.accent, 0.75)
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(dir * R * 0.92, 0)
    ctx.lineTo(dir * R * 0.82, -R * 0.035)
    ctx.lineTo(dir * R * 0.82, R * 0.035)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  // Ruler columns and centre jewel
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4
    ctx.strokeStyle = alpha(palette.accent, 0.16)
    ctx.lineWidth = lw * 0.7
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(ang) * R * 0.2, cy + Math.sin(ang) * R * 0.2)
    ctx.lineTo(cx + Math.cos(ang) * R * 0.95, cy + Math.sin(ang) * R * 0.95)
    ctx.stroke()
  }
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2
    ctx.save()
    ctx.translate(cx + Math.cos(ang) * R * 0.72, cy + Math.sin(ang) * R * 0.72)
    ctx.rotate(ang)
    sigil(ctx, i + 2, R * 0.055, alpha(palette.accent, 0.55), lw * 0.9)
    ctx.restore()
  }
  softDisc(ctx, cx, cy, R * 0.13, palette.accent, 0.05)
  ring(ctx, cx, cy, R * 0.05, alpha(palette.accent, 0.95), lw * 1.4)
  ctx.fillStyle = alpha(palette.accent, 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.016, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/* ────────────────────────────────────────────────────────────────────────────
   8 · Arc moon — arched temple window, crescent, hanging lamp
   ──────────────────────────────────────────────────────────────────────────── */
export function drawArcMoon(a: ArtContext) {
  const { ctx, palette } = a
  const { cx, cy, R } = center(a)
  const lw = Math.max(0.7, a.u * 1.2)
  const gold = alpha(palette.accent, 0.6)
  const top = cy - R
  const width = R * 1.5
  const bottom = cy + R * 0.95

  ctx.save()
  // Night sky inside the arch
  const sky = ctx.createLinearGradient(cx, top, cx, bottom)
  sky.addColorStop(0, alpha(palette.accentAlt, 0.22))
  sky.addColorStop(0.55, alpha(palette.surface, 0.5))
  sky.addColorStop(1, alpha(palette.deep, 0.85))
  ctx.fillStyle = sky
  ctx.beginPath()
  ctx.moveTo(cx - width / 2, bottom)
  ctx.lineTo(cx - width / 2, cy - R * 0.38)
  ctx.quadraticCurveTo(cx - width / 2, top, cx, top)
  ctx.quadraticCurveTo(cx + width / 2, top, cx + width / 2, cy - R * 0.38)
  ctx.lineTo(cx + width / 2, bottom)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = gold
  ctx.lineWidth = lw * 1.4
  ctx.stroke()

  // Arch band
  ctx.beginPath()
  ctx.moveTo(cx - width / 2 - R * 0.07, bottom)
  ctx.lineTo(cx - width / 2 - R * 0.07, cy - R * 0.36)
  ctx.quadraticCurveTo(cx - width / 2 - R * 0.07, top - R * 0.07, cx, top - R * 0.07)
  ctx.quadraticCurveTo(cx + width / 2 + R * 0.07, top - R * 0.07, cx + width / 2 + R * 0.07, cy - R * 0.36)
  ctx.lineTo(cx + width / 2 + R * 0.07, bottom)
  ctx.strokeStyle = alpha(palette.accent, 0.25)
  ctx.lineWidth = lw * 0.8
  ctx.stroke()

  // Stars inside the arch
  starField(
    ctx,
    { x: cx - width / 2, y: top, w: width, h: bottom - top },
    34,
    alpha(palette.ink, 0.9),
    a.seed + 5,
    { maxRadius: Math.max(0.7, R * 0.008), opacity: 0.65 },
  )

  // Crescent
  const mx = cx + R * 0.18
  const my = cy - R * 0.24
  const mr = R * 0.3
  const crescentGradient = ctx.createLinearGradient(mx - mr, my - mr, mx + mr, my + mr)
  crescentGradient.addColorStop(0, alpha(palette.ink, 0.95))
  crescentGradient.addColorStop(1, alpha(palette.accent, 0.8))
  ctx.fillStyle = crescentGradient
  const startAngle = Math.PI * 0.62
  const endAngle = Math.PI * 1.38
  ctx.beginPath()
  ctx.arc(mx, my, mr, startAngle, endAngle, false)
  const sx = mx + Math.cos(startAngle) * mr
  const sy = my + Math.sin(startAngle) * mr
  ctx.quadraticCurveTo(mx + mr * 0.04, my, sx, sy)
  ctx.closePath()
  ctx.fill()

  // Hanging lamp
  const lampY = cy + R * 0.34
  ctx.strokeStyle = alpha(palette.accent, 0.5)
  ctx.lineWidth = lw * 0.8
  ctx.beginPath()
  ctx.moveTo(cx, top + R * 0.02)
  ctx.lineTo(cx, lampY - R * 0.16)
  ctx.stroke()
  kalasam(ctx, cx, top + R * 0.06, R * 0.12, alpha(palette.accent, 0.7), false)
  const lampG = ctx.createLinearGradient(cx, lampY - R * 0.16, cx, lampY + R * 0.04)
  lampG.addColorStop(0, alpha(palette.accent, 0.85))
  lampG.addColorStop(1, alpha(palette.deep, 0.6))
  ctx.fillStyle = lampG
  ctx.beginPath()
  ctx.moveTo(cx - R * 0.08, lampY - R * 0.14)
  ctx.quadraticCurveTo(cx - R * 0.12, lampY + R * 0.04, cx, lampY + R * 0.05)
  ctx.quadraticCurveTo(cx + R * 0.12, lampY + R * 0.04, cx + R * 0.08, lampY - R * 0.14)
  ctx.closePath()
  ctx.fill()
  softDisc(ctx, cx, lampY - R * 0.18, R * 0.12, palette.accent, 0.1)

  // Pinnacle
  kalasam(ctx, cx, top - R * 0.06, R * 0.16, alpha(palette.accent, 0.85), true)

  // Base steps
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = alpha(palette.deep, 0.6 - i * 0.12)
    ctx.fillRect(cx - width / 2 - R * (0.1 + i * 0.06), bottom + i * R * 0.04, width + R * (0.2 + i * 0.12), R * 0.05)
  }
  ctx.restore()
}
