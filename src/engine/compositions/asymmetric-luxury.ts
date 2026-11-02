import type { Composition } from './types'
import { alpha, mix } from '../color'
import { arcStroke, fillRect, glow, linearGradient, strokeLine } from '../draw'
import { ring } from '../artwork/common'
import { drawLine, measure } from '../text'
import { eyebrow, ctaPill } from './shared'

/**
 * 03 · Asymmetric luxury
 * A dominant off-centre panel carries all copy while artwork bleeds from the
 * opposite edge. A large hairline ring, an oversized ghost initial and a
 * rotated edge label create tension without extra decoration.
 */
export const asymmetricLuxury: Composition = {
  meta: {
    id: 'asymmetric-luxury',
    name: 'Asymmetric Luxury',
    family: 'Luxury',
    index: 3,
    summary: 'Off-centre copy panel, bleeding artwork, ghost initial, hairline ring.',
    structure: 'A 46–52% colour panel is pushed to one side and holds every text block with generous internal padding. Artwork bleeds off the opposite edge behind a hairline ring; a rotated label runs down the page edge and a faint brand initial sits behind the panel copy.',
    focalPoint: 'The artwork bleeding off the left (or top) edge',
    bestFor: ['astrology-services', 'birth-jathagam', 'navagraha', 'wedding-matching', 'shiva'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['celestial-orb', 'lotus-crest', 'zodiac-wheel', 'temple-arch'],
    motion: ['Panel slide-in', 'Ring rotation', 'Headline rise', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const rtl = !landscape && (spec.layout.focalX < 0.5 ? false : true)

    const base = mix(palette.bg, palette.deep, 0.35)
    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, base)

    // Panel geometry
    const panelW = landscape ? W * 0.5 : W * (story ? 1 : 0.47)
    const panel: { x: number; y: number; w: number; h: number } = story
      ? { x: 0, y: H * 0.52, w: W, h: H * 0.48 }
      : landscape
        ? { x: 0, y: 0, w: panelW, h: H }
        : rtl
          ? { x: W - panelW, y: 0, w: panelW, h: H }
          : { x: W - panelW, y: 0, w: panelW, h: H }

    // Artwork on the open side
    const artRect = story
      ? { x: -W * 0.1, y: -H * 0.05, w: W * 1.2, h: H * 0.62 }
      : landscape
        ? { x: W * 0.44, y: -H * 0.05, w: W * 0.66, h: H * 1.1 }
        : { x: -W * 0.24, y: -H * 0.04, w: W * 0.86, h: H * 0.6 }

    f.revealDraw(0.04, 0.6, () => {
      f.art(artRect, { opacity: 0.92 })
    }, { scaleFrom: 1.04 })
    glow(ctx, artRect.x + artRect.w * 0.55, artRect.y + artRect.h * 0.5, Math.max(artRect.w, artRect.h) * 0.7, palette.accent, 0.16)

    // Hairline ring motif
    const ringCx = story ? W * 0.78 : landscape ? W * 0.8 : W * 0.3
    const ringCy = story ? H * 0.28 : H * 0.26
    const ringR = Math.min(W, H) * 0.31
    ctx.save()
    ctx.globalAlpha = 0.5
    ring(ctx, ringCx, ringCy, ringR, alpha(palette.accent, 0.5), Math.max(0.8, u))
    ring(ctx, ringCx, ringCy, ringR * 1.18, alpha(palette.accent, 0.18), Math.max(0.7, u * 0.8))
    arcStroke(ctx, ringCx, ringCy, ringR * 1.09, Math.PI * 0.1, Math.PI * 0.55, alpha(palette.accent, 0.7), Math.max(1, u * 1.6))
    ctx.restore()

    // Panel with gradient + texture
    const panelG = linearGradient(ctx, panel, landscape ? 20 : 100, [
      { at: 0, color: mix(palette.surface, palette.deep, 0.15) },
      { at: 1, color: mix(palette.deep, palette.bg, 0.3) },
    ])
    f.revealDraw(0.12, 0.55, () => {
      ctx.fillStyle = panelG
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h)
      strokeLine(ctx, panel.x, panel.y, panel.x, panel.y + panel.h, alpha(palette.accent, 0.35), Math.max(0.8, u))
    }, { distance: u * 40 })

    // Ghost initial
    const initial = (f.brand.name || 'Astrosivam').trim().charAt(0).toUpperCase()
    // Fully contained so it reads as a watermark rather than a clipped glyph.
    const ghostSize = Math.min(panel.w * 0.6, panel.h * 0.26)
    ctx.save()
    ctx.globalAlpha = 0.045
    ctx.fillStyle = palette.accent
    ctx.font = `600 ${Math.round(ghostSize)}px ${f.displayStack}`
    ctx.textAlign = 'center'
    ctx.fillText(initial, panel.x + panel.w * 0.5, panel.y + panel.h * 0.9)
    ctx.textAlign = 'left'
    ctx.restore()

    // Text block inside panel
    const pad = landscape ? u * 60 : u * 46
    const tx = panel.x + pad
    const tw = panel.w - pad * 2
    const contentTop = panel.y + panel.h * (story ? 0.12 : 0.16)

    eyebrow(f, c.eyebrow, tx, contentTop, { size: u * 15, color: palette.accent, width: tw * 0.55 })

    const head = f.text({
      text: c.headline,
      x: tx,
      y: contentTop + u * 32,
      w: tw,
      h: panel.h * (story ? 0.36 : 0.4),
      size: Math.min(u * 76, tw * 0.155),
      minSize: u * 30,
      maxLines: story ? 2 : 4,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.06,
      tracking: -0.005,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.3, span: 0.5, distance: u * 24 },
    })

    let cursor = head.box.y + head.box.h + u * 22
    strokeLine(ctx, tx, cursor, tx + u * 54, cursor, alpha(palette.accent, 0.75), Math.max(1, u * 1.4))
    cursor += u * 26

    if (c.subheadline.trim()) {
      const sub = f.text({
        text: c.subheadline,
        x: tx,
        y: cursor,
        w: tw * 0.96,
        size: u * 18,
        maxLines: 2,
        role: 'body',
        weight: 500,
        uppercase: true,
        tracking: 0.18,
        lineHeight: 1.5,
        color: palette.accent,
        id: 'subheadline',
        label: 'Subheadline',
        anim: { start: 0.44, span: 0.4 },
      })
      cursor = sub.box.y + sub.box.h + u * 16
    }

    if (c.body.trim()) {
      const body = f.text({
        text: c.body,
        x: tx,
        y: cursor,
        w: tw * 0.94,
        size: u * 18,
        maxLines: story ? 2 : 5,
        role: 'body',
        lineHeight: 1.62,
        color: alpha(palette.ink, 0.68),
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.5, span: 0.4 },
      })
      cursor = body.box.y + body.box.h + u * 20
    }

    const points = c.points.filter((p) => p.trim())
    if (points.length && spec.layout.showPoints && !story) {
      const rows = points.slice(0, 3)
      rows.forEach((point, index) => {
        const rowY = cursor + index * u * 27
        ctx.fillStyle = alpha(palette.accent, 0.8)
        ctx.beginPath()
        ctx.arc(tx + u * 3, rowY - u * 4, Math.max(1, u * 1.6), 0, Math.PI * 2)
        ctx.fill()
        f.label(point, tx + u * 14, rowY, u * 12.5, {
          color: alpha(palette.ink, 0.55),
          tracking: 0.1,
          weight: 500,
          w: tw - u * 16,
        })
      })
      cursor += u * (27 * rows.length + 18)
    }

    if ((c.cta || f.brand.cta).trim()) {
      const ctaY = Math.min(cursor + u * 6, panel.y + panel.h - u * 116)
      ctaPill(f, c.cta || f.brand.cta, tx, ctaY, {
        fill: 'transparent',
        color: palette.ink,
        border: alpha(palette.ink, 0.45),
        size: u * 15,
        height: u * 46,
        padX: u * 24,
      })
    }

    // Panel footer: logo + contact
    const footY = panel.y + panel.h - u * 58
    f.logo({ x: tx, y: footY, size: u * 24, showName: true, nameSize: u * 20, color: palette.ink })
    const contact = [c.contact, c.website].filter(Boolean).join('  ·  ')
    if (contact) {
      f.label(contact, tx + tw, footY + u * 22, u * 12, {
        align: 'right',
        color: alpha(palette.ink, 0.5),
        tracking: 0.12,
        w: tw * 0.65,
      })
    }

    // Rotated edge label on the open side
    ctx.save()
    const edgeX = landscape ? W - u * 34 : story ? u * 30 : panel.x - u * 30
    const edgeY = story ? H * 0.42 : H * 0.66
    ctx.translate(edgeX, edgeY)
    ctx.rotate(-Math.PI / 2)
    const edgeStyle = f.style(u * 13, {
      role: 'body',
      weight: 500,
      tracking: 0.34,
      uppercase: true,
      color: alpha(palette.ink, 0.45),
    })
    const edgeText = `${(f.brand.tagline || 'VEDIC ASTROLOGY').toUpperCase()}  ·  ${(c.website || '').toUpperCase()}`
    drawLine(ctx, edgeText, 0, 0, measure(ctx, edgeText, edgeStyle), edgeStyle)
    ctx.restore()

    // Inset frame
    void safe
  },
}
