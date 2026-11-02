import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, linearGradient, strokeLine, withClip } from '../draw'
import { drawLine, measure } from '../text'
import { eyebrow, ctaPill, numberedList } from './shared'

/**
 * 07 · Split panel
 * A hard 50/50 split between a flat typographic panel and full-height artwork.
 * The numeral, headline and service list live on the flat panel; the artwork
 * side is duotoned and signed with a rotated caption. A footer strip closes it.
 */
export const splitPanel: Composition = {
  meta: {
    id: 'split-panel',
    name: 'Split Panel',
    family: 'Modular',
    index: 7,
    summary: 'Hard 50/50 panel, duotone artwork, footer strip.',
    structure: 'The canvas is divided once: one flat panel holds a large numeral, category label, headline, numbered list and CTA; the other holds full-height artwork with a duotone wash and rotated caption. A shared footer strip runs across both panels.',
    focalPoint: 'Duotone artwork in its own panel',
    bestFor: ['wedding-matching', 'temple-event', 'navagraha', 'astrology-services'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['peacock-feather', 'mandala-lotus', 'lotus-crest', 'temple-arch', 'navagraha'],
    motion: ['Panel slide', 'Duotone art drift', 'List stagger', 'Footer wipe'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const points = c.points.filter((p) => p.trim())
    const footerH = u * 52

    const stacked = story
    const vertical = !stacked
    const panelRatio = landscape ? 0.46 : stacked ? 0.5 : 0.52
    const gap = Math.max(1, u * 1.5)

    // Panels
    const textPanel = stacked
      ? { x: 0, y: H * (1 - panelRatio) - footerH, w: W, h: H * panelRatio }
      : { x: 0, y: 0, w: W * panelRatio - gap / 2, h: H - footerH }
    const artPanel = stacked
      ? { x: 0, y: 0, w: W, h: H * (1 - panelRatio) - footerH }
      : { x: W * panelRatio + gap / 2, y: 0, w: W * (1 - panelRatio) - gap / 2, h: H - footerH }

    const panelFill = linearGradient(ctx, textPanel, 105, [
      { at: 0, color: mix(palette.surface, palette.bg, 0.35) },
      { at: 1, color: mix(palette.deep, palette.bg, 0.35) },
    ])
    ctx.fillStyle = panelFill
    ctx.fillRect(textPanel.x, textPanel.y, textPanel.w, textPanel.h)

    // Artwork with duotone treatment
    f.revealDraw(0.06, 0.6, () => {
      withClip(ctx, artPanel, () => {
        fillRect(ctx, artPanel, mix(palette.deep, palette.surface, 0.35))
        f.art(artPanel, { opacity: 1 })
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.3
        ctx.fillStyle = palette.accentAlt
        ctx.fillRect(artPanel.x, artPanel.y, artPanel.w, artPanel.h)
        ctx.restore()
        // bottom fade into the panel colour
        const fade = ctx.createLinearGradient(0, artPanel.y + artPanel.h * 0.7, 0, artPanel.y + artPanel.h)
        fade.addColorStop(0, alpha(palette.deep, 0))
        fade.addColorStop(1, alpha(palette.deep, 0.75))
        ctx.fillStyle = fade
        ctx.fillRect(artPanel.x, artPanel.y + artPanel.h * 0.7, artPanel.w, artPanel.h * 0.3)
      })
    }, { scaleFrom: 1.05 })

    // Panel edge
    if (vertical) {
      strokeLine(ctx, W * panelRatio, 0, W * panelRatio, H - footerH, alpha(palette.accent, 0.5), Math.max(1, u * 1.4))
    } else {
      strokeLine(ctx, 0, H * (1 - panelRatio) - footerH, W, H * (1 - panelRatio) - footerH, alpha(palette.accent, 0.4), Math.max(0.8, u))
    }

    // Copy panel contents
    const pad = u * 54
    const tx = textPanel.x + pad
    const tw = textPanel.w - pad * 2
    const contentTop = textPanel.y + pad + (story ? u * 10 : u * 24)

    // Oversized index numeral, set into the panel's outer corner
    ctx.save()
    ctx.fillStyle = alpha(palette.accent, 0.14)
    ctx.font = `300 ${Math.round(u * 150)}px ${f.displayStack}`
    const numeral = '07'
    const nw = ctx.measureText(numeral).width
    ctx.fillText(numeral, tx + tw - nw, textPanel.y + textPanel.h * 0.46)
    ctx.restore()

    eyebrow(f, c.eyebrow, tx, contentTop, { size: u * 14, color: palette.accent, width: tw * 0.6 })
    const head = f.text({
      text: c.headline,
      x: tx,
      y: contentTop + u * 34,
      w: tw,
      h: textPanel.h * (story ? 0.3 : 0.34),
      size: Math.min(u * 66, tw * 0.155),
      minSize: u * 28,
      maxLines: story ? 2 : 4,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      uppercase: spec.typography.uppercaseHeadline,
      lineHeight: 1.03,
      tracking: spec.typography.tracking,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.28, span: 0.5, distance: u * 22 },
    })

    let cursor = head.box.y + head.box.h + u * 20
    strokeLine(ctx, tx, cursor, tx + u * 40, cursor, alpha(palette.accent, 0.7), Math.max(1, u * 1.2))
    cursor += u * 22

    if (c.subheadline.trim()) {
      const sub = f.text({
        text: c.subheadline,
        x: tx,
        y: cursor,
        w: tw,
        size: u * 14,
        maxLines: 2,
        role: 'body',
        weight: 600,
        uppercase: true,
        tracking: 0.2,
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.75),
        id: 'subheadline',
        label: 'Subheadline',
      })
      cursor = sub.box.y + sub.box.h + u * 16
    }

    const pointsRoom = textPanel.y + textPanel.h - u * (stacked ? 150 : 190)
    if (points.length && spec.layout.showPoints) {
      const rowH = u * 34
      const rows = Math.max(0, Math.min(points.length, Math.floor((pointsRoom - cursor) / rowH), stacked ? 2 : 4))
      if (rows > 0) {
        numberedList(f, points.slice(0, rows), { x: tx, y: cursor, w: tw, h: rows * rowH }, {
          size: u * 14.5,
          gap: rowH,
          color: alpha(palette.ink, 0.8),
          accent: palette.accent,
        })
        cursor += rows * rowH + u * 18
      }
    }

    const bodyRoom = textPanel.y + textPanel.h - u * 112 - cursor
    if (c.body.trim() && bodyRoom > u * 30) {
      f.text({
        text: c.body,
        x: tx,
        y: cursor,
        w: tw,
        size: u * 15,
        maxLines: Math.min(4, Math.max(1, Math.floor(bodyRoom / (u * 15 * 1.6)))),
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.55),
        id: 'body',
        label: 'Body copy',
      })
    }

    if (c.cta.trim()) {
      ctaPill(f, c.cta, tx, textPanel.y + textPanel.h - u * 96, {
        fill: palette.accent,
        color: palette.mode === 'dark' ? palette.deep : palette.surface,
        size: u * 14,
        height: u * 44,
        padX: u * 24,
      })
    }

    f.logo({
      x: tx,
      y: textPanel.y + textPanel.h - u * 36,
      size: u * 22,
      showName: true,
      nameSize: u * 18,
      color: palette.ink,
    })

    // Rotated caption on the artwork edge
    if (vertical) {
      ctx.save()
      ctx.translate(artPanel.x + artPanel.w - u * 26, artPanel.y + artPanel.h * 0.5)
      ctx.rotate(-Math.PI / 2)
      const s = f.style(u * 12, {
        role: 'body',
        weight: 500,
        tracking: 0.32,
        uppercase: true,
        color: alpha(palette.ink, 0.6),
      })
      const txt = (c.subheadline || spec.brand.tagline || 'astrosivam').toUpperCase()
      drawLine(ctx, txt, -measure(ctx, txt, s) / 2, 0, measure(ctx, txt, s), s)
      ctx.restore()
    }

    // Footer strip across both panels
    const footerY = H - footerH
    fillRect(ctx, { x: 0, y: footerY, w: W, h: footerH }, mix(palette.deep, palette.bg, 0.4))
    strokeLine(ctx, 0, footerY, W, footerY, alpha(palette.accent, 0.4), Math.max(0.8, u))
    f.label((f.brand.name || 'ASTROSIVAM').toUpperCase(), safe.x, footerY + footerH * 0.62, u * 12, {
      color: palette.ink,
      tracking: 0.22,
      weight: 600,
      w: safe.w * 0.3,
    })
    const right = [c.contact, c.website].filter(Boolean).join('   ·   ')
    if (right) {
      f.label(right, safe.x + safe.w, footerY + footerH * 0.62, u * 11.5, {
        align: 'right',
        color: alpha(palette.ink, 0.6),
        tracking: 0.12,
        w: safe.w * 0.6,
      })
    }
  },
}
