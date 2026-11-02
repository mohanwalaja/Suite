import type { Composition } from './types'
import { alpha, mix } from '../color'
import { decoCorner, glow, linearGradient, strokeLine } from '../draw'
import { eyebrow, ctaPill, contactFooter } from './shared'

/**
 * 14 · Decorative frame
 * A ruled frame with art-deco corner fans, a crest at the top and a cartouche at
 * the base. Everything inside is centred, including the headline and its
 * diamond rule; the motif is set behind the copy at low contrast.
 */
export const decorativeFrame: Composition = {
  meta: {
    id: 'decorative-frame',
    name: 'Decorative Frame',
    family: 'Ornamental',
    index: 14,
    summary: 'Art-deco corner fans, crest, cartouche and a centred stack.',
    structure: 'A double rule frame with geometric corner fans encloses the page. A lotus crest sits at the top centre, a stepped cartouche at the base, and every text block is centred on the axis. The motif appears behind the copy as a low-contrast watermark.',
    focalPoint: 'The framed centre and top crest',
    bestFor: ['wedding-matching', 'baby-naming', 'ganesha', 'festival', 'subha-muhurtham'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['mandala-lotus', 'lotus-crest', 'kolam-grid', 'temple-arch', 'mandala-sun'],
    motion: ['Frame draw-on', 'Crest fade', 'Headline rise', 'Gold sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const story = f.aspect === 'story'
    const landscape = f.aspect === 'landscape'
    const cx = W / 2

    const bg = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 115, [
      { at: 0, color: mix(palette.bg, palette.deep, 0.3) },
      { at: 0.6, color: palette.bg },
      { at: 1, color: mix(palette.bg, palette.surface, 0.55) },
    ])
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    glow(ctx, cx, H * 0.42, Math.max(W, H) * 0.55, palette.accent, 0.13)

    // Motif watermark
    const artSize = Math.min(W, H) * 0.86
    f.revealDraw(0.05, 0.7, () => {
      f.art({ x: cx - artSize / 2, y: H * 0.5 - artSize / 2, w: artSize, h: artSize }, { opacity: 0.2 })
    })

    // Frame
    const frameInset = Math.min(W, H) * 0.045
    const frame = { x: frameInset, y: frameInset, w: W - frameInset * 2, h: H - frameInset * 2 }
    const accent = alpha(palette.accent, 0.65)
    ctx.save()
    ctx.strokeStyle = accent
    ctx.lineWidth = Math.max(1, u * 1.4)
    ctx.strokeRect(frame.x, frame.y, frame.w, frame.h)
    ctx.strokeStyle = alpha(palette.accent, 0.28)
    ctx.lineWidth = Math.max(0.6, u * 0.7)
    ctx.strokeRect(frame.x + u * 10, frame.y + u * 10, frame.w - u * 20, frame.h - u * 20)
    ctx.restore()

    // Deco corners on the inner rule
    const cornerSize = Math.min(W, H) * 0.1
    decoCorner(ctx, frame.x + u * 12, frame.y + u * 12, cornerSize, accent, { x: 1, y: 1 }, Math.max(0.7, u))
    decoCorner(ctx, frame.x + frame.w - u * 12, frame.y + u * 12, cornerSize, accent, { x: -1, y: 1 }, Math.max(0.7, u))
    decoCorner(ctx, frame.x + u * 12, frame.y + frame.h - u * 12, cornerSize, accent, { x: 1, y: -1 }, Math.max(0.7, u))
    decoCorner(ctx, frame.x + frame.w - u * 12, frame.y + frame.h - u * 12, cornerSize, accent, { x: -1, y: -1 }, Math.max(0.7, u))

    // Top crest
    const crestSize = u * 70
    const crestY = frame.y - crestSize * 0.25
    ctx.save()
    ctx.fillStyle = palette.bg
    ctx.fillRect(cx - crestSize * 0.75, crestY - u * 6, crestSize * 1.5, crestSize * 1.1)
    ctx.restore()
    f.art({ x: cx - crestSize / 2, y: crestY, w: crestSize, h: crestSize }, { opacity: 0.9 })

    // Content column
    const colW = Math.min(safe.w * (landscape ? 0.56 : story ? 0.84 : 0.78), u * 680)
    const colX = cx - colW / 2
    let cursor = frame.y + u * (story ? 130 : 118)

    if (c.eyebrow.trim()) {
      eyebrow(f, c.eyebrow, cx, cursor, { size: u * 12, color: palette.accent, align: 'center', rule: false })
      cursor += u * 26
    }

    const head = f.text({
      text: c.headline,
      x: colX,
      y: cursor,
      w: colW,
      h: H * (story ? 0.2 : 0.17),
      size: Math.min(u * 66, colW * 0.12),
      minSize: u * 24,
      maxLines: 4,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.14,
      tracking: 0.03,
      color: palette.ink,
      align: 'center',
      id: 'headline',
      label: 'Headline',
      required: true,
      shadow: { color: alpha(palette.deep, 0.3), blur: u * 18, offsetY: u * 2 },
      anim: { start: 0.24, span: 0.55, distance: u * 18 },
    })

    // Ornamental rule
    const ruleY = head.box.y + head.box.h + u * 26
    ornamentRule(f, cx, ruleY, Math.min(colW * 0.6, u * 300))
    cursor = ruleY + u * 30

    if (c.subheadline.trim()) {
      const sub = f.text({
        text: c.subheadline,
        x: colX,
        y: cursor,
        w: colW,
        size: u * 13,
        maxLines: 2,
        role: 'body',
        weight: 500,
        uppercase: true,
        tracking: 0.24,
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.72),
        align: 'center',
        id: 'subheadline',
        label: 'Subheadline',
      })
      cursor = sub.box.y + sub.box.h + u * 20
    }

    if (c.body.trim()) {
      const body = f.text({
        text: c.body,
        x: colX + colW * 0.1,
        y: cursor,
        w: colW * 0.8,
        size: u * 15.5,
        maxLines: 3,
        role: 'body',
        lineHeight: 1.7,
        color: alpha(palette.ink, 0.66),
        align: 'center',
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.44, span: 0.4 },
      })
      cursor = body.box.y + body.box.h + u * 24
    }

    const ctaY = Math.min(cursor, frame.y + frame.h - u * 190)
    if (c.cta.trim()) {
      ctaPill(f, c.cta, cx, ctaY, {
        fill: 'transparent',
        color: palette.ink,
        border: alpha(palette.accent, 0.7),
        size: u * 12,
        height: u * 42,
        padX: u * 26,
        align: 'center',
      })
    }

    // Base cartouche with the brand and contact
    const cartY = frame.y + frame.h - u * 92
    ctx.save()
    ctx.fillStyle = palette.bg
    const cartW = Math.min(frame.w * 0.74, u * 640)
    ctx.fillRect(cx - cartW / 2, cartY, cartW, u * 54)
    ctx.restore()
    strokeLine(ctx, cx - cartW / 2 + u * 16, cartY, cx - cartW / 2 + u * 74, cartY, alpha(palette.accent, 0.5), Math.max(0.7, u))
    strokeLine(ctx, cx + cartW / 2 - u * 74, cartY, cx + cartW / 2 - u * 16, cartY, alpha(palette.accent, 0.5), Math.max(0.7, u))
    f.label((f.brand.name || 'ASTROSIVAM').toUpperCase(), cx, cartY + u * 24, u * 13, {
      align: 'center',
      color: palette.ink,
      tracking: 0.36,
      weight: 600,
      w: cartW,
    })
    const contact = [c.contact, c.website].filter(Boolean).join('   ·   ')
    if (contact) {
      f.label(contact, cx, cartY + u * 44, u * 10.5, {
        align: 'center',
        color: alpha(palette.ink, 0.5),
        tracking: 0.18,
        w: cartW,
      })
    }
    strokeLine(ctx, cx - cartW / 2 + u * 36, cartY + u * 58, cx + cartW / 2 - u * 36, cartY + u * 58, alpha(palette.accent, 0.3), Math.max(0.6, u * 0.7))
    strokeLine(ctx, cx - cartW / 2 + u * 16, cartY + u * 58, cx - cartW / 2 + u * 74, cartY + u * 58, alpha(palette.accent, 0.5), Math.max(0.7, u))
    strokeLine(ctx, cx + cartW / 2 - u * 74, cartY + u * 58, cx + cartW / 2 - u * 16, cartY + u * 58, alpha(palette.accent, 0.5), Math.max(0.7, u))

    // Footer fallback (outside the cartouche) for very short formats
    if (f.aspect === 'landscape') {
      contactFooter(f, H - u * 22, {
        color: palette.ink,
        size: u * 10,
        align: 'center',
        x: safe.x,
        w: safe.w,
        rule: false,
        showBrand: false,
        items: [c.website],
      })
    }
  },
}

function ornamentRule(f: import('../frame').Frame, cx: number, y: number, halfW: number) {
  const { ctx, u, palette } = f
  ctx.save()
  ctx.strokeStyle = alpha(palette.accent, 0.6)
  ctx.lineWidth = Math.max(0.7, u * 0.9)
  ctx.beginPath()
  ctx.moveTo(cx - halfW, y)
  ctx.lineTo(cx + halfW, y)
  ctx.stroke()
  ctx.fillStyle = alpha(palette.accent, 0.95)
  ctx.beginPath()
  ctx.moveTo(cx, y - u * 5)
  ctx.lineTo(cx + u * 5, y)
  ctx.lineTo(cx, y + u * 5)
  ctx.lineTo(cx - u * 5, y)
  ctx.closePath()
  ctx.fill()
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(cx + dir * halfW, y, u * 3.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(palette.accent, 0.35)
    ctx.beginPath()
    ctx.moveTo(cx + dir * halfW, y)
    ctx.lineTo(cx + dir * (halfW - u * 36), y)
    ctx.stroke()
  }
  ctx.restore()
}
