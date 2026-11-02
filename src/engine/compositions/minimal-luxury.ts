import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, glow, strokeRect } from '../draw'
import { measure } from '../text'
import { contactFooter } from './shared'

/**
 * 09 · Minimal luxury
 * Nearly empty. A small emblem, a centred three-line headline, one rule and a
 * single sentence. Every element is centred on the optical axis and surrounded
 * by deliberate negative space.
 */
export const minimalLuxury: Composition = {
  meta: {
    id: 'minimal-luxury',
    name: 'Minimal Luxury',
    family: 'Minimal',
    index: 9,
    summary: 'Centred axis, tiny emblem, enormous negative space.',
    structure: 'A centred vertical axis: small emblem near the top, a tight three-line headline at the optical centre, one hairline with a diamond, a single-sentence body, and a tracked CTA at the foot. A double hairline frame contains everything.',
    focalPoint: 'The empty space around the headline',
    bestFor: ['baby-naming', 'ganesha', 'shiva', 'wedding-matching', 'astrology-services'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['lotus-crest', 'mandala-lotus', 'orbit-network', 'peacock-feather'],
    motion: ['Emblem fade', 'Rule draw', 'Slow letter reveal', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const story = f.aspect === 'story'
    const landscape = f.aspect === 'landscape'
    const centerX = W / 2
    const paper = mix(palette.bg, palette.surface, 0.4)

    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, paper)
    glow(ctx, W * 0.5, H * 0.34, Math.max(W, H) * 0.5, palette.accent, palette.mode === 'dark' ? 0.14 : 0.08)

    // Paper tooth
    ctx.save()
    ctx.globalAlpha = 0.05
    ctx.fillStyle = palette.ink
    for (let i = 0; i < 220; i++) {
      const x = ((i * 8731) % 1009) / 1009 * W
      const y = ((i * 4513) % 1013) / 1013 * H
      ctx.fillRect(x, y, u * 1.5, u * 1.5)
    }
    ctx.restore()

    // Double frame
    strokeRect(ctx, { x: u * 34, y: u * 34, w: W - u * 68, h: H - u * 68 }, alpha(palette.ink, 0.22), Math.max(0.7, u))
    strokeRect(ctx, { x: u * 42, y: u * 42, w: W - u * 84, h: H - u * 84 }, alpha(palette.ink, 0.1), Math.max(0.6, u * 0.8))

    // Emblem
    const emblemSize = Math.min(W, H) * (landscape ? 0.18 : 0.2)
    const emblemY = safe.y + (landscape ? u * 26 : H * 0.02)
    f.revealDraw(0.06, 0.7, () => {
      f.art(
        { x: centerX - emblemSize / 2, y: emblemY, w: emblemSize, h: emblemSize },
        { opacity: 0.95 },
      )
    }, { distance: u * 14 })

    // Small tracked brand line above headline
    const brandLine = (f.brand.name || 'ASTROSIVAM').toUpperCase()
    f.label(brandLine, centerX, emblemY + emblemSize + u * 40, u * 12, {
      align: 'center',
      color: alpha(palette.ink, 0.6),
      tracking: 0.34,
      weight: 500,
      w: W * 0.6,
    })

    // Headline
    const headTop = emblemY + emblemSize + u * 78
    const head = f.text({
      text: c.headline,
      x: safe.x + safe.w * 0.06,
      y: headTop,
      w: safe.w * 0.88,
      h: H * (story ? 0.2 : 0.18),
      size: Math.min(u * 64, safe.w * 0.115),
      minSize: u * 24,
      maxLines: 3,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight === 500 ? 400 : spec.typography.headlineWeight,
      lineHeight: 1.18,
      tracking: 0.02,
      color: palette.ink,
      align: 'center',
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.24, span: 0.55, distance: u * 16 },
    })

    // Rule with diamond
    const ruleY = head.box.y + head.box.h + u * 32
    const ruleW = u * 110
    ctx.save()
    ctx.strokeStyle = alpha(palette.accent, 0.55)
    ctx.lineWidth = Math.max(0.7, u * 0.9)
    ctx.beginPath()
    ctx.moveTo(centerX - ruleW, ruleY)
    ctx.lineTo(centerX + ruleW, ruleY)
    ctx.stroke()
    ctx.fillStyle = alpha(palette.accent, 0.9)
    ctx.beginPath()
    ctx.moveTo(centerX, ruleY - u * 4)
    ctx.lineTo(centerX + u * 5, ruleY)
    ctx.lineTo(centerX, ruleY + u * 4)
    ctx.lineTo(centerX - u * 5, ruleY)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // One sentence body
    let cursor = ruleY + u * 30
    if (c.body.trim()) {
      const sentences = c.body.split(/(?<=\.)\s+/)
      const one = sentences.slice(0, story ? 2 : 1).join(' ')
      const body = f.text({
        text: one,
        x: safe.x + safe.w * 0.16,
        y: cursor,
        w: safe.w * 0.68,
        size: u * 16,
        maxLines: 3,
        role: 'body',
        lineHeight: 1.75,
        color: alpha(palette.ink, 0.6),
        align: 'center',
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.4, span: 0.45 },
      })
      cursor = body.box.y + body.box.h + u * 30
    }

    // CTA as tracked text with hairlines
    if (c.cta.trim()) {
      const label = c.cta.toUpperCase()
      const style = f.style(u * 12, {
        role: 'body',
        weight: 600,
        tracking: 0.28,
        uppercase: true,
        color: palette.ink,
        align: 'center',
      })
      const ctaY = Math.min(cursor + u * 10, safe.y + safe.h - u * 96)
      const ctaW = measure(ctx, label, style)
      ctx.save()
      ctx.font = `600 ${Math.round(u * 12)}px ${f.bodyStack}`
      ctx.fillStyle = palette.ink
      let cx = centerX - measure(ctx, label, style) / 2
      for (const ch of label) {
        ctx.fillText(ch, cx, ctaY)
        cx += ctx.measureText(ch).width + u * 12 * 0.28
      }
      ctx.restore()
      if (c.subheadline.trim()) {
        f.text({
          text: c.subheadline,
          x: safe.x + safe.w * 0.2,
          y: ctaY + u * 18,
          w: safe.w * 0.6,
          size: u * 11,
          maxLines: 2,
          role: 'body',
          uppercase: true,
          tracking: 0.18,
          color: alpha(palette.ink, 0.42),
          align: 'center',
          id: 'subheadline',
          label: 'Subheadline',
        })
      }
      void ctaW
    }

    // Foot
    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 11,
      align: 'center',
      x: safe.x,
      w: safe.w,
      rule: false,
      showBrand: false,
      items: [c.contact, c.website].filter(Boolean),
    })
    // Corner marks
    ctx.save()
    ctx.strokeStyle = alpha(palette.accent, 0.45)
    ctx.lineWidth = Math.max(0.6, u * 0.7)
    for (const [x, y, dx, dy] of [
      [u * 34, u * 34, 1, 1],
      [W - u * 34, u * 34, -1, 1],
      [u * 34, H - u * 34, 1, -1],
      [W - u * 34, H - u * 34, -1, -1],
    ] as const) {
      ctx.beginPath()
      ctx.moveTo(x, y + dy * u * 18)
      ctx.lineTo(x, y)
      ctx.lineTo(x + dx * u * 18, y)
      ctx.stroke()
    }
    ctx.restore()
    void palette
  },
}
