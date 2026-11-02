import type { Composition } from './types'
import { alpha, mix } from '../color'
import { arcStroke, fillRect, glow, linearGradient, starField, strokeLine } from '../draw'
import { eyebrow, contactFooter } from './shared'
import { ring } from '../artwork/common'

/**
 * 06 · Cosmic astrology
 * A night chart: the zodiac wheel is cropped by the right edge, star field
 * fills the sky, and an ephemeris-style table of service points runs down the
 * left under a serif headline. Hairline rules top and bottom frame the chart.
 */
export const cosmicAstrology: Composition = {
  meta: {
    id: 'cosmic-astrology',
    name: 'Cosmic Astrology',
    family: 'Celestial',
    index: 6,
    summary: 'Cropped zodiac wheel, star field, ephemeris table, serif headline.',
    structure: 'The zodiac artwork is oversized and cropped by two edges, creating a deep field on the right. A serif headline sits top-left with a numbered ephemeris table beneath it; hairline rules and a small technical label frame the page.',
    focalPoint: 'The cropped wheel on the right',
    bestFor: ['birth-jathagam', 'navagraha', 'astrology-services', 'subha-muhurtham'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['zodiac-wheel', 'navagraha', 'astrolabe', 'celestial-orb'],
    motion: ['Star twinkle', 'Wheel rotation', 'Table row reveals', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const points = c.points.filter((p) => p.trim())

    const sky = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 135, [
      { at: 0, color: mix(palette.deep, '#000000', 0.25) },
      { at: 0.5, color: palette.bg },
      { at: 1, color: mix(palette.surface, palette.bg, 0.45) },
    ])
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)
    starField(ctx, { x: 0, y: 0, w: W, h: H }, Math.round((W * H) / 9000), palette.ink, 31, {
      maxRadius: Math.max(0.6, u * 1.5),
      opacity: 0.45,
      time: f.timeline.enabled ? f.timeline.time : 0,
      drift: 6,
    })
    glow(ctx, W * 0.76, H * 0.3, Math.max(W, H) * 0.55, palette.accentAlt, 0.16)

    // Wheel — oversized, cropped right
    const artSize = Math.min(W, H) * (landscape ? 0.95 : 1.0)
    const artRect = {
      x: landscape ? W * 0.55 : W * 0.26,
      y: landscape ? H * 0.05 : story ? H * 0.28 : H * 0.3,
      w: artSize,
      h: artSize,
    }
    const t = f.timeline.enabled ? f.timeline.time : 0
    ctx.save()
    const rot = spec.animation.parallax ? t * 0.02 : 0
    ctx.translate(artRect.x + artSize / 2, artRect.y + artSize / 2)
    ctx.rotate(rot)
    ctx.translate(-(artRect.x + artSize / 2), -(artRect.y + artSize / 2))
    f.art(artRect, { opacity: 0.92 })
    ctx.restore()

    // Left scrim keeps the editorial column readable over the chart
    const scrim = ctx.createLinearGradient(0, 0, W * 0.78, 0)
    scrim.addColorStop(0, alpha(palette.bg, 0.94))
    scrim.addColorStop(0.55, alpha(palette.bg, 0.72))
    scrim.addColorStop(1, alpha(palette.bg, 0))
    ctx.fillStyle = scrim
    ctx.fillRect(0, 0, W, H)

    // Orbital arcs sweeping the full canvas
    ctx.save()
    ctx.globalAlpha = 0.5
    arcStroke(ctx, W * 0.1, H * 0.9, W * 0.72, Math.PI * 1.15, Math.PI * 1.72, alpha(palette.accent, 0.3), Math.max(0.7, u))
    arcStroke(ctx, W * 0.1, H * 0.9, W * 0.86, Math.PI * 1.1, Math.PI * 1.55, alpha(palette.accent, 0.16), Math.max(0.6, u * 0.8))
    ctx.restore()

    // Top rule + brand
    const topY = safe.y + u * 8
    strokeLine(ctx, safe.x, topY, safe.x + safe.w, topY, alpha(palette.accent, 0.45), Math.max(0.8, u))
    f.logo({ x: safe.x, y: topY + u * 16, size: u * 26, showName: true, nameSize: u * 22 })
    f.label(spec.brand.website || c.website, safe.x + safe.w, topY + u * 32, u * 13, {
      align: 'right',
      color: alpha(palette.ink, 0.55),
      tracking: 0.22,
      w: safe.w * 0.5,
    })

    // Headline
    const headY = topY + u * (story ? 110 : 92)
    const head = f.text({
      text: c.headline,
      x: safe.x,
      y: headY,
      w: landscape ? safe.w * 0.48 : safe.w * 0.78,
      h: H * (story ? 0.2 : 0.17),
      size: Math.min(u * 78, (landscape ? safe.w * 0.48 : safe.w * 0.78) * 0.15),
      minSize: u * 30,
      maxLines: 4,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.05,
      tracking: spec.typography.tracking,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      shadow: { color: alpha(palette.deep, 0.5), blur: u * 20, offsetY: u * 3 },
      anim: { start: 0.18, span: 0.55, distance: u * 22 },
    })

    let cursor = head.box.y + head.box.h + u * 22
    eyebrow(f, c.subheadline, safe.x, cursor, { size: u * 13.5, color: palette.accent, width: u * 250, rule: false })
    cursor += u * 34

    // Ephemeris-style table
    if (points.length && spec.layout.showPoints) {
      const tableW = landscape ? safe.w * 0.45 : Math.min(safe.w * 0.74, u * 640)
      const rowH = u * 44
      const tableBottom = safe.y + safe.h - u * 118
      const rows = Math.max(0, Math.min(points.length, Math.floor((tableBottom - cursor) / rowH)))
      points.slice(0, rows).forEach((point, i) => {
        const y = cursor + i * rowH
        strokeLine(ctx, safe.x, y, safe.x + tableW, y, alpha(palette.ink, 0.16), Math.max(0.6, u * 0.7))
        f.label(String(i + 1).padStart(2, '0'), safe.x, y + u * 27, u * 12, {
          color: palette.accent,
          tracking: 0.16,
          w: u * 50,
        })
        f.text({
          text: point,
          x: safe.x + u * 46,
          y: y + u * 9,
          w: tableW - u * 140,
          size: u * 16,
          maxLines: 1,
          role: 'body',
          color: alpha(palette.ink, 0.82),
          id: `point-${i}`,
          label: `Point ${i + 1}`,
        })
        strokeLine(ctx, safe.x + tableW - u * 34, y + u * 22, safe.x + tableW, y + u * 22, alpha(palette.accent, 0.4), Math.max(0.6, u * 0.8))
      })
      strokeLine(ctx, safe.x, cursor + rows * rowH, safe.x + tableW, cursor + rows * rowH, alpha(palette.ink, 0.16), Math.max(0.6, u * 0.7))
      cursor += rows * rowH + u * 26
    }

    // Body + CTA bottom-left
    if (c.body.trim() && !story) {
      f.text({
        text: c.body,
        x: safe.x,
        y: cursor,
        w: landscape ? safe.w * 0.44 : Math.min(safe.w * 0.72, u * 560),
        size: u * 16,
        maxLines: Math.max(1, Math.floor((safe.y + safe.h - u * 96 - cursor) / (u * 16 * 1.6))),
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.55),
        id: 'body',
        label: 'Body copy',
      })
    }

    if (c.cta.trim()) {
      const ctaY = safe.y + safe.h - u * 62
      strokeLine(ctx, safe.x, ctaY - u * 26, safe.x + u * 42, ctaY - u * 26, alpha(palette.accent, 0.7), Math.max(0.8, u))
      f.label(c.cta, safe.x, ctaY, u * 14, {
        color: palette.ink,
        tracking: 0.18,
        weight: 600,
        w: safe.w * 0.5,
      })
    }

    // Footer
    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 13,
      rule: false,
      showBrand: false,
      items: [c.contact, c.website].filter(Boolean),
    })

    // Technical marks
    ring(ctx, safe.x + safe.w - u * 16, safe.y + safe.h - u * 16, u * 4, alpha(palette.accent, 0.8), Math.max(0.7, u * 0.8))
    strokeLine(ctx, safe.x + safe.w - u * 22, safe.y + safe.h - u * 16, safe.x + safe.w - u * 10, safe.y + safe.h - u * 16, alpha(palette.accent, 0.5), Math.max(0.6, u * 0.7))
    void fillRect
  },
}
