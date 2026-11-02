import type { Composition } from './types'
import { alpha, mix } from '../color'
import { arcStroke, fillRect, glow, linearGradient, strokeLine } from '../draw'
import { drawArcText } from '../text'
import { eyebrow, ctaPill, contactFooter } from './shared'
import { ring } from '../artwork/common'

/**
 * 04 · Circular mandala
 * A perfect circle of artwork is the whole composition: concentric rings extend
 * past it, copy is centred beneath, and a line of tracked text curves along the
 * upper arc.
 */
export const circularMandala: Composition = {
  meta: {
    id: 'circular-mandala',
    name: 'Circular Mandala',
    family: 'Sacred geometry',
    index: 4,
    summary: 'Centred mandala with curved arc text and a centred copy block.',
    structure: 'A mandala is locked to a single circle in the upper half. Hairline rings extend past it to the canvas edges, tracked copy curves along the top arc, and a centred headline / body / CTA stack sits underneath.',
    focalPoint: 'The circle at the optical centre',
    bestFor: ['ganesha', 'baby-naming', 'durga', 'festival', 'murugan'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['mandala-lotus', 'mandala-sun', 'lotus-crest', 'kolam-grid', 'ganesha-motif'],
    motion: ['Mandala slow rotation', 'Ring draw-on', 'Arc text reveal', 'Particles'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const square = f.aspect === 'square'

    const base = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 120, [
      { at: 0, color: mix(palette.bg, palette.deep, 0.45) },
      { at: 0.55, color: palette.bg },
      { at: 1, color: mix(palette.bg, palette.surface, 0.45) },
    ])
    ctx.fillStyle = base
    ctx.fillRect(0, 0, W, H)

    const centerX = landscape ? W * 0.7 : W * 0.5
    const centerY = landscape ? H * 0.48 : H * (story ? 0.3 : square ? 0.31 : 0.33)
    const artSize = landscape ? Math.min(H * 0.92, W * 0.46) : Math.min(W * 0.9, H * 0.5)
    const radius = artSize / 2
    glow(ctx, centerX, centerY, radius * 1.45, palette.accent, 0.2)

    // Concentric guide rings beyond the art
    ctx.save()
    ctx.globalAlpha = 0.4
    ring(ctx, centerX, centerY, radius * 1.13, alpha(palette.accent, 0.4), Math.max(0.7, u * 0.9))
    ring(ctx, centerX, centerY, radius * 1.22, alpha(palette.accent, 0.16), Math.max(0.6, u * 0.7), [u * 4, u * 8])
    ring(ctx, centerX, centerY, radius * 1.42, alpha(palette.accent, 0.12), Math.max(0.6, u * 0.6))
    ctx.restore()

    // Slow rotation for animation, static identical pose at rest
    const t = f.timeline.enabled ? f.timeline.time : 0
    const rotation = spec.animation.parallax ? Math.sin(t * 0.18) * 0.045 : 0

    f.revealDraw(0.04, 0.65, () => {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.translate(-centerX, -centerY)
      f.art({ x: centerX - radius, y: centerY - radius, w: artSize, h: artSize }, { opacity: 0.98 })
      ctx.restore()
    }, { scaleFrom: 1.05 })

    // Arc text along the top of the mandala
    const arcValue = (c.subheadline || f.brand.tagline || '').toUpperCase()
    if (arcValue) {
      const maxArc = Math.max(radius * 0.8, centerY - safe.y - u * 34)
      drawArcText(ctx, arcValue, {
        cx: centerX,
        cy: centerY,
        radius: Math.min(radius * 1.17, maxArc),
        centerAngle: -Math.PI / 2,
        spread: Math.PI * (story ? 1.3 : 1.1),
        style: f.style(u * 13.5, {
          role: 'body',
          weight: 600,
          tracking: 0.28,
          uppercase: true,
          color: alpha(palette.accent, 0.85),
        }),
      })
    }

    // Copy block
    const copyTop = landscape ? safe.y + safe.h * 0.24 : centerY + radius * 1.18
    const copyW = landscape ? safe.w * 0.44 : Math.min(safe.w * 0.88, u * 760)
    const copyX = landscape ? safe.x : centerX - copyW / 2
    const align = landscape ? 'left' : 'center'

    if (c.eyebrow.trim()) {
      eyebrow(f, c.eyebrow, align === 'center' ? centerX : copyX, copyTop, {
        size: u * 15,
        color: palette.accent,
        align: align === 'center' ? 'center' : 'left',
        rule: false,
      })
    }

    const head = f.text({
      text: c.headline,
      x: copyX,
      y: copyTop + u * 30,
      w: copyW,
      h: landscape ? H * 0.26 : H * (story ? 0.11 : 0.1),
      size: Math.min(u * 74, copyW * 0.125),
      minSize: u * 28,
      maxLines: story ? 3 : 3,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.06,
      tracking: spec.typography.tracking,
      color: palette.ink,
      align,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.3, span: 0.5, distance: u * 20 },
    })

    const ruleY = head.box.y + head.box.h + u * 22
    if (align === 'center') {
      strokeLine(ctx, centerX - u * 40, ruleY, centerX + u * 40, ruleY, alpha(palette.accent, 0.6), Math.max(1, u * 1.2))
      ctx.save()
      ctx.fillStyle = alpha(palette.accent, 0.9)
      ctx.beginPath()
      ctx.arc(centerX, ruleY, u * 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else {
      strokeLine(ctx, copyX, ruleY, copyX + u * 54, ruleY, alpha(palette.accent, 0.7), Math.max(1, u * 1.2))
    }

    let cursor = ruleY + u * 24
    if (c.body.trim()) {
      const body = f.text({
        text: c.body,
        x: copyX,
        y: cursor,
        w: copyW * (align === 'center' ? 0.86 : 1),
        size: u * 17,
        maxLines: story ? 3 : 3,
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.66),
        align,
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.42, span: 0.4 },
      })
      cursor = body.box.y + body.box.h + u * 20
    }

    if ((c.cta || f.brand.cta).trim() && !story) {
      const ctaY = Math.min(cursor, safe.y + safe.h - u * 120)
      ctaPill(f, c.cta || f.brand.cta, align === 'center' ? centerX : copyX, ctaY, {
        fill: palette.accent,
        color: palette.mode === 'dark' ? palette.deep : palette.surface,
        size: u * 15,
        height: u * 44,
        align: align === 'center' ? 'center' : 'left',
      })
    }

    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 14,
      align: align === 'center' ? 'center' : 'left',
      x: align === 'center' ? safe.x : copyX,
      w: align === 'center' ? safe.w : Math.min(safe.w, u * 800),
      items: [c.website],
    })

    // Corner coordinates — a quiet technical detail
    ctx.save()
    ctx.globalAlpha = 0.35
    ;[
      [safe.x, safe.y],
      [safe.x + safe.w, safe.y],
      [safe.x, safe.y + safe.h],
      [safe.x + safe.w, safe.y + safe.h],
    ].forEach(([x, y]) => {
      strokeLine(ctx, x - u * 7, y, x + u * 7, y, alpha(palette.accent, 0.8), Math.max(0.6, u * 0.7))
      strokeLine(ctx, x, y - u * 7, x, y + u * 7, alpha(palette.accent, 0.8), Math.max(0.6, u * 0.7))
    })
    ctx.restore()
    void arcStroke
    void fillRect
    void square
  },
}
