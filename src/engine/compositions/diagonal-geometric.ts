import type { Composition } from './types'
import { alpha, mix } from '../color'
import { dotRing, fillRect, glow, hatch, linearGradient, strokeLine, withClip } from '../draw'
import { eyebrow, contactFooter } from './shared'
import { measure } from '../text'

/**
 * 05 · Diagonal geometric
 * A hard diagonal slices the canvas into a bright field and a dark field.
 * Headline type is flush-left at the top, artwork sits in a clipped diagonal
 * window, and copy runs along the diagonal at the foot of the page.
 */
export const diagonalGeometric: Composition = {
  meta: {
    id: 'diagonal-geometric',
    name: 'Diagonal Geometric',
    family: 'Geometric',
    index: 5,
    summary: 'Hard diagonal split, clipped art window, flush-left display type.',
    structure: 'One diagonal edge divides the canvas into a light and a dark field. Copy is flush-left in the upper field, artwork sits inside a clipped diagonal window with a hatched band, and supporting copy + CTA sit below the diagonal.',
    focalPoint: 'The diagonal edge and clipped artwork window',
    bestFor: ['astrology-services', 'durga', 'subha-muhurtham', 'festival'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['geometric-strata', 'durga-shakti', 'mandala-sun', 'topographic'],
    motion: ['Diagonal wipe', 'Artwork parallax', 'Headline slide', 'Dot pulse'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'

    const bg = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 125, [
      { at: 0, color: mix(palette.deep, palette.bg, 0.3) },
      { at: 1, color: mix(palette.deep, '#000000', 0.25) },
    ])
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Diagonal geometry
    const topX = W * (story ? 0.1 : landscape ? 0.34 : 0.22)
    const bottomX = W * (story ? 0.52 : landscape ? 0.5 : 0.02)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(topX, 0)
    ctx.lineTo(W, 0)
    ctx.lineTo(W, H)
    ctx.lineTo(bottomX, H)
    ctx.closePath()
    const field = ctx.createLinearGradient(topX, 0, W, H)
    field.addColorStop(0, alpha(palette.surface, 0.95))
    field.addColorStop(0.6, alpha(palette.bg, 0.9))
    field.addColorStop(1, alpha(mix(palette.accentAlt, palette.deep, 0.8), 0.85))
    ctx.fillStyle = field
    ctx.fill()

    // Hatched band inside the field
    withClip(ctx, { x: 0, y: 0, w: W, h: H }, () => {
      hatch(ctx, { x: W * 0.2, y: 0, w: W * 0.8, h: H }, alpha(palette.ink, 0.05), u * 16, Math.max(0.6, u * 0.7), 62)
    })
    ctx.restore()

    // Edge lines
    strokeLine(ctx, topX, 0, bottomX, H, alpha(palette.accent, 0.7), Math.max(1, u * 1.6))
    for (let i = 1; i <= 3; i++) {
      const off = i * u * 13
      strokeLine(ctx, topX - off, 0, bottomX - off, H, alpha(palette.accent, 0.16 - i * 0.03), Math.max(0.6, u * 0.7))
    }

    // Artwork window — a rotated rectangle clipped by the page
    const artW = landscape ? W * 0.34 : W * 0.44
    const artH = landscape ? H * 0.72 : H * 0.38
    const artRect = {
      x: landscape ? W * 0.56 : W * 0.5,
      y: landscape ? H * 0.12 : H * 0.06,
      w: artW,
      h: artH,
    }
    f.revealDraw(0.1, 0.6, () => {
      ctx.save()
      ctx.translate(artRect.x + artRect.w / 2, artRect.y + artRect.h / 2)
      ctx.rotate(-0.14)
      ctx.translate(-(artRect.x + artRect.w / 2), -(artRect.y + artRect.h / 2))
      withClip(ctx, artRect, () => {
        fillRect(ctx, artRect, alpha(palette.deep, 0.55))
        f.art(artRect, { opacity: 0.95 })
      })
      ctx.strokeStyle = alpha(palette.accent, 0.4)
      ctx.lineWidth = Math.max(0.8, u)
      ctx.strokeRect(artRect.x, artRect.y, artRect.w, artRect.h)
      ctx.restore()
    }, { distance: u * 30 })

    glow(ctx, artRect.x + artRect.w * 0.5, artRect.y + artRect.h * 0.4, artRect.w * 0.9, palette.accent, 0.12)

    // Copy — upper left
    const headX = safe.x
    const headW = landscape ? safe.w * 0.46 : safe.w * 0.66
    if (c.eyebrow.trim()) {
      eyebrow(f, c.eyebrow, headX, safe.y + u * 22, {
        size: u * 14,
        color: palette.accent,
        width: u * 200,
      })
    }
    const head = f.text({
      text: c.headline,
      x: headX,
      y: safe.y + u * (story ? 92 : 74),
      w: headW,
      h: H * (story ? 0.26 : 0.24),
      size: Math.min(u * 82, headW * 0.16),
      minSize: u * 30,
      maxLines: 5,
      fit: true,
      role: 'display',
      weight: 700,
      uppercase: true,
      tracking: -0.025,
      lineHeight: 0.96,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.18, span: 0.5, distance: u * 26 },
    })

    // Supporting copy — lower left, stepped into the diagonal
    const bodyY = head.box.y + head.box.h + u * 34
    const bodyW = landscape ? safe.w * 0.4 : safe.w * 0.52
    let cursor = bodyY
    if (c.subheadline.trim()) {
      const sub = f.text({
        text: c.subheadline,
        x: headX,
        y: cursor,
        w: bodyW,
        size: u * 16,
        maxLines: 2,
        role: 'body',
        weight: 600,
        uppercase: true,
        tracking: 0.16,
        lineHeight: 1.55,
        color: alpha(palette.ink, 0.8),
        id: 'subheadline',
        label: 'Subheadline',
      })
      cursor = sub.box.y + sub.box.h + u * 14
    }
    if (c.body.trim() && !story) {
      f.text({
        text: c.body,
        x: headX,
        y: cursor,
        w: bodyW,
        size: u * 16,
        maxLines: 3,
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.58),
        id: 'body',
        label: 'Body copy',
      })
    }

    // Service points fill the field beneath the copy
    const points = c.points.filter((p) => p.trim())
    const listTop = cursor + u * 30
    if (points.length && spec.layout.showPoints && !story) {
      const rowH = u * 46
      const rows = Math.max(0, Math.min(points.length, Math.floor((safe.y + safe.h - u * 190 - listTop) / rowH)))
      points.slice(0, rows).forEach((point, i) => {
        const y = listTop + i * rowH
        strokeLine(ctx, headX, y, headX + bodyW, y, alpha(palette.ink, 0.18), Math.max(0.6, u * 0.7))
        f.label(String(i + 1).padStart(2, '0'), headX, y + u * 28, u * 12, {
          color: palette.accent,
          tracking: 0.16,
          w: u * 44,
        })
        f.text({
          text: point,
          x: headX + u * 44,
          y: y + u * 9,
          w: bodyW - u * 44,
          size: u * 15,
          maxLines: 1,
          role: 'body',
          color: alpha(palette.ink, 0.78),
          id: `point-${i}`,
          label: `Point ${i + 1}`,
        })
      })
    }

    // Index numeral, rotated, inside the lower-right field
    const idxText = String(new Date().getFullYear()).slice(0, 4)
    ctx.save()
    ctx.translate(W - u * 54, H * (story ? 0.6 : 0.82))
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = alpha(palette.accent, 0.13)
    ctx.font = `300 ${Math.round(u * 130)}px ${f.displayStack}`
    ctx.fillText(idxText, 0, 0)
    ctx.restore()

    // Square CTA (deliberately not a pill)
    if (c.cta.trim()) {
      const label = c.cta.toUpperCase()
      const style = f.style(u * 15, {
        role: 'body',
        weight: 700,
        tracking: 0.16,
        uppercase: true,
        color: palette.deep,
        align: 'left',
      })
      const w = measure(ctx, label, style) + u * 56
      const h = u * 48
      const y = Math.min(safe.y + safe.h - u * 96, H * (story ? 0.78 : 0.72))
      fillRect(ctx, { x: safe.x, y, w, h }, palette.accent)
      ctx.fillStyle = palette.deep
      ctx.font = `700 ${Math.round(u * 15)}px ${f.bodyStack}`
      ctx.fillText(label, safe.x + u * 20, y + h / 2 + u * 5.5)
      // Arrow
      strokeLine(ctx, safe.x + w - u * 26, y + h / 2, safe.x + w - u * 14, y + h / 2, palette.deep, Math.max(1, u * 1.4))
      strokeLine(ctx, safe.x + w - u * 18, y + h / 2 - u * 4, safe.x + w - u * 14, y + h / 2, palette.deep, Math.max(1, u * 1.4))
      strokeLine(ctx, safe.x + w - u * 18, y + h / 2 + u * 4, safe.x + w - u * 14, y + h / 2, palette.deep, Math.max(1, u * 1.4))
    }

    // Dots + footer
    dotRing(ctx, W - u * 64, safe.y + u * 40, u * 12, 3, u * 1.6, alpha(palette.accent, 0.6))
    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 14,
      items: [c.website],
    })
  },
}
