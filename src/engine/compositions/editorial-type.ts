import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, glow, hairline, strokeLine, strokeRect } from '../draw'
import { drawSingleLine } from '../text'
import { eyebrow, contactFooter, numberedList, scrim } from './shared'

/**
 * 02 · Editorial typography
 * The headline itself is the illustration: stacked display type at the top,
 * a slim masthead, a framed art plate inset at the lower right, and copy set
 * in measured columns beneath a hairline.
 */
export const editorialType: Composition = {
  meta: {
    id: 'editorial-type',
    name: 'Editorial Typography',
    family: 'Editorial',
    index: 2,
    summary: 'Oversized stacked headline, masthead rule, framed inset art plate.',
    structure: 'A magazine page: masthead + rule at the top, a 3–5 line display headline filling the upper half at full measure, a bordered square art plate inset at the lower right, and body copy in narrow columns under a hairline.',
    focalPoint: 'The headline typography',
    bestFor: ['birth-jathagam', 'astrology-services', 'navagraha', 'temple-event', 'wedding-matching'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['astrolabe', 'topographic', 'zodiac-wheel', 'lotus-crest'],
    motion: ['Line-by-line headline mask', 'Plate wipe-in', 'Rule draw', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const paper = mix(palette.bg, palette.surface, 0.35)

    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, paper)
    glow(ctx, W * 0.82, H * 0.16, Math.max(W, H) * 0.55, palette.accent, 0.1)
    // Paper tooth
    ctx.save()
    ctx.globalAlpha = 0.035
    ctx.fillStyle = palette.ink
    for (let i = 0; i < 260; i++) {
      const x = ((i * 92041) % 1009) / 1009 * W
      const y = ((i * 3779) % 1013) / 1013 * H
      ctx.fillRect(x, y, u * 1.6, u * 1.6)
    }
    ctx.restore()

    // ── Masthead ────────────────────────────────────────────────────────────
    const mastY = safe.y + u * 20
    const brand = (f.brand.name || 'ASTROSIVAM').toUpperCase()
    const brandStyle = f.style(u * 16, {
      role: 'body',
      weight: 600,
      tracking: 0.28,
      uppercase: true,
      color: palette.ink,
    })
    drawSingleLine(ctx, brand, safe.x, mastY, safe.w * 0.4, brandStyle)
    const issue = 'JOURNAL  ·  02 / 15'
    f.label(issue, safe.x + safe.w, mastY, u * 14, {
      align: 'right',
      color: alpha(palette.ink, 0.55),
      tracking: 0.2,
      w: safe.w * 0.5,
    })
    strokeLine(ctx, safe.x, mastY + u * 20, safe.x + safe.w, mastY + u * 20, alpha(palette.ink, 0.5), Math.max(0.8, u * 1.3))
    strokeLine(ctx, safe.x, mastY + u * 24, safe.x + safe.w, mastY + u * 24, alpha(palette.ink, 0.18), Math.max(0.6, u * 0.7))

    // ── Headline ────────────────────────────────────────────────────────────
    const headTop = mastY + u * (landscape ? 46 : 64)
    const headW = landscape ? safe.w * 0.62 : safe.w
    const headMaxSize = landscape ? H * 0.24 : Math.min(u * 128, (story ? H : W) * 0.14)
    const headH = landscape ? H * 0.42 : H * (story ? 0.34 : 0.3)

    if (c.eyebrow.trim()) {
      eyebrow(f, c.eyebrow, safe.x, headTop + u * 12, { size: u * 16, color: palette.accent, width: u * 260 })
    }
    const head = f.text({
      text: c.headline,
      x: safe.x,
      y: headTop + (c.eyebrow.trim() ? u * 38 : 0),
      w: headW,
      h: headH,
      size: headMaxSize,
      minSize: u * 38,
      maxLines: landscape ? 4 : 4,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 0.98,
      tracking: -0.02,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      reportSafe: true,
      anim: { start: 0.16, span: 0.55, distance: u * 22, mask: 'up' },
    })

    // ── Art plate ───────────────────────────────────────────────────────────
    // Portrait/square: a larger plate closes the band between the body block and
    // the footer CTA, which otherwise reads as an unfinished page.
    const plateSize = landscape
      ? safe.h * 0.46
      : Math.min(safe.w * (story ? 0.5 : 0.46), H * (story ? 0.26 : 0.3))
    const plateX = landscape ? safe.x + safe.w - plateSize : safe.x + safe.w - plateSize
    const plateY = landscape ? safe.y + safe.h - plateSize - u * 10 : head.box.y + head.box.h + u * 22
    const plate = { x: plateX, y: plateY, w: plateSize, h: plateSize }

    f.revealDraw(0.36, 0.5, () => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(plate.x, plate.y, plate.w, plate.h)
      ctx.clip()
      fillRect(ctx, plate, alpha(palette.surface, 0.7))
      // Inset the motif so its outer ring is not sliced by the plate edge.
      const inset = Math.max(2, u * 9)
      f.art(
        { x: plate.x + inset, y: plate.y + inset, w: plate.w - inset * 2, h: plate.h - inset * 2 },
        { opacity: 0.95 },
      )
      ctx.restore()
      ctx.save()
      strokeRect(ctx, plate, alpha(palette.ink, 0.3), Math.max(0.8, u))
      strokeRect(ctx, { x: plate.x + u * 8, y: plate.y + u * 8, w: plate.w - u * 16, h: plate.h - u * 16 }, alpha(palette.ink, 0.12), Math.max(0.6, u * 0.7))
      ctx.restore()
      if (c.subheadline.trim()) {
        f.text({
          text: c.subheadline,
          x: plate.x,
          y: plate.y + plate.h + u * 8,
          w: plate.w,
          size: u * 13,
          maxLines: 2,
          role: 'body',
          color: alpha(palette.ink, 0.55),
          tracking: 0.04,
          uppercase: true,
          id: 'plate-caption',
          label: 'Art caption',
        })
      }
    })

    // ── Body columns ────────────────────────────────────────────────────────
    const bodyTop = landscape ? safe.y + safe.h * 0.6 : head.box.y + head.box.h + u * 34
    const bodyW = landscape ? safe.w * 0.5 : Math.min(safe.w * 0.46, u * 420)
    if (c.body.trim()) {
      f.text({
        text: c.body,
        x: safe.x,
        y: bodyTop,
        w: bodyW,
        size: u * 19,
        maxLines: landscape ? 4 : 5,
        role: 'body',
        lineHeight: 1.62,
        color: alpha(palette.ink, 0.78),
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.5, span: 0.4 },
      })
    }

    const points = c.points.filter((p) => p.trim())
    if (points.length && spec.layout.showPoints) {
      const listX = landscape ? safe.x + safe.w * 0.56 : safe.x
      const listW = landscape ? safe.w * 0.42 : bodyW
      const listTop = landscape ? bodyTop : bodyTop + u * 132
      eyebrow(f, 'Inside this reading', listX, listTop + u * 6, { size: u * 13, color: palette.accent, rule: false })
      numberedList(f, points.slice(0, 4), { x: listX, y: listTop + u * 22, w: listW, h: u * 150 }, {
        size: u * 16,
        gap: u * 38,
        color: palette.ink,
        accent: palette.accent,
      })
    }

    // ── CTA ─────────────────────────────────────────────────────────────────
    if (c.cta.trim()) {
      const ctaY = safe.y + safe.h - u * 54
      ctx.save()
      strokeLine(ctx, safe.x, ctaY, safe.x + u * 20, ctaY, alpha(palette.ink, 0.7), Math.max(1, u * 1.4))
      ctx.restore()
      f.label(c.cta, safe.x + u * 30, ctaY + u * 4, u * 14, {
        color: palette.ink,
        tracking: 0.18,
        weight: 600,
        w: safe.w * 0.42,
      })
    }

    // ── Folio ───────────────────────────────────────────────────────────────
    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 14,
      rule: true,
      showBrand: true,
      items: [c.contact, c.website].filter(Boolean),
    })
    void hairline
    void scrim
  },
}
