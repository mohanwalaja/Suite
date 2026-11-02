import type { Composition } from './types'
import { alpha, mix } from '../color'
import { glow, linearGradient, starField, strokeLine } from '../draw'
import { measure } from '../text'
import { eyebrow, ctaPill, contactFooter, scrim } from './shared'

/**
 * 01 · Full-screen illustrated hero
 * The illustration is the entire canvas and bleeds past every edge. A single
 * graded scrim carries a bottom-left copy stack: eyebrow → headline → subhead →
 * body → CTA, closed by a full-width contact rule.
 */
export const heroIllustration: Composition = {
  meta: {
    id: 'hero-illustration',
    name: 'Full-Screen Illustrated Hero',
    family: 'Hero',
    index: 1,
    summary: 'Bleed illustration, graded scrim, bottom-left copy stack.',
    structure: 'Artwork fills the whole canvas and bleeds off all four edges. One continuous graded scrim anchors a left-aligned copy stack to the bottom third, with the brand mark pinned top-left and the contact rule on the baseline.',
    focalPoint: 'Illustration mass in the upper half',
    bestFor: ['murugan', 'shiva', 'festival', 'astrology-services', 'durga', 'ganesha'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['painted-hills', 'temple-gopuram', 'celestial-orb', 'mandala-lotus', 'deepam-lamp'],
    motion: ['Illustration scale-in', 'Scrim rise', 'Headline mask reveal', 'Particles', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'

    // ── Base sky (visible where the motif is line art) ──────────────────────
    const sky = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 100, [
      { at: 0, color: mix(palette.deep, palette.bg, 0.2) },
      { at: 0.55, color: palette.bg },
      { at: 1, color: mix(palette.bg, palette.surface, 0.55) },
    ])
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)
    glow(ctx, W * (landscape ? 0.68 : 0.55), H * 0.26, Math.max(W, H) * 0.6, palette.accent, 0.18)
    if (palette.mode === 'dark') {
      starField(ctx, { x: 0, y: 0, w: W, h: H }, 130, palette.ink, 21, {
        maxRadius: Math.max(0.7, u * 1.5),
        opacity: 0.36,
      })
    }

    // ── Full-bleed artwork ──────────────────────────────────────────────────
    const artRect = { x: -W * 0.035, y: -H * 0.025, w: W * 1.07, h: H * 1.05 }
    const artProgress = f.timeline.at(0.02, 0.7)
    ctx.save()
    ctx.globalAlpha = 0.95 * (spec.animation.enabled ? 0.35 + artProgress * 0.65 : 1)
    const scale = 1.055 - artProgress * 0.055
    ctx.translate(W / 2, H / 2)
    ctx.scale(scale, scale)
    ctx.translate(-W / 2, -H / 2)
    f.art(artRect, { opacity: 0.98 })
    ctx.restore()

    // ── Scrim ───────────────────────────────────────────────────────────────
    if (landscape) {
      const g = ctx.createLinearGradient(0, 0, W * 0.74, 0)
      g.addColorStop(0, alpha(palette.bg, 0.97))
      g.addColorStop(0.5, alpha(palette.bg, 0.86))
      g.addColorStop(1, alpha(palette.bg, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    } else {
      const startY = H * (story ? 0.4 : 0.36)
      const g = ctx.createLinearGradient(0, startY, 0, H)
      g.addColorStop(0, alpha(palette.bg, 0))
      g.addColorStop(0.34, alpha(palette.bg, 0.28))
      g.addColorStop(0.62, alpha(palette.bg, 0.74))
      g.addColorStop(0.84, alpha(palette.bg, 0.95))
      g.addColorStop(1, alpha(palette.bg, 0.99))
      ctx.fillStyle = g
      ctx.fillRect(0, startY, W, H - startY)
      // Radial wash behind the copy keeps type legible without a hard edge.
      const cx = W * 0.22
      const cy = H * 0.92
      const wash = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.04, cx, cy, Math.max(W, H) * 0.62)
      wash.addColorStop(0, alpha(palette.bg, 0.82))
      wash.addColorStop(0.45, alpha(palette.bg, 0.5))
      wash.addColorStop(1, alpha(palette.bg, 0))
      ctx.fillStyle = wash
      ctx.fillRect(0, 0, W, H)
    }

    // ── Brand row ───────────────────────────────────────────────────────────
    f.logo({ x: safe.x, y: safe.y, size: u * 30, showName: true, nameSize: u * 25 })
    const tag = (spec.brand.tagline || '').toUpperCase()
    if (tag) {
      f.label(tag, safe.x + safe.w, safe.y + u * 26, u * 14, {
        align: 'right',
        color: alpha(palette.ink, 0.55),
        tracking: 0.24,
        w: safe.w * 0.52,
      })
    }

    // ── Copy stack (laid out from the bottom anchor upward) ─────────────────
    const copyX = safe.x
    const copyW = landscape ? W * 0.42 : safe.w * 0.94
    const bottomY = safe.y + safe.h
    const ctaY = bottomY - u * 108
    let cursor = landscape ? safe.y + safe.h * 0.36 : H * (story ? 0.54 : 0.55)

    if (c.eyebrow.trim()) {
      eyebrow(f, c.eyebrow, copyX, cursor, {
        size: u * 16,
        color: palette.accent,
        width: Math.min(copyW * 0.8, u * 320),
      })
      cursor += u * 32
    }

    const head = f.text({
      text: c.headline,
      x: copyX,
      y: cursor,
      w: copyW,
      h: H * (story ? 0.15 : 0.14),
      size: Math.min(u * 92, copyW * 0.145),
      minSize: u * 38,
      maxLines: landscape ? 4 : 3,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.02,
      tracking: spec.typography.tracking,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      reportSafe: true,
      shadow: { color: alpha(palette.deep, 0.35), blur: u * 26, offsetY: u * 4 },
      anim: { start: 0.22, span: 0.5, distance: u * 26 },
    })
    cursor = head.box.y + head.box.h + u * 18

    if (c.subheadline.trim()) {
      const sub = f.text({
        text: c.subheadline,
        x: copyX,
        y: cursor,
        w: copyW * 0.92,
        size: u * 21,
        maxLines: 2,
        role: 'body',
        weight: 500,
        uppercase: true,
        tracking: 0.16,
        lineHeight: 1.5,
        color: alpha(palette.ink, 0.82),
        id: 'subheadline',
        label: 'Subheadline',
        anim: { start: 0.38, span: 0.45, distance: u * 16 },
      })
      cursor = sub.box.y + sub.box.h + u * 16
    }

    const bodySpace = ctaY - cursor - u * 10
    if (c.body.trim() && bodySpace > u * 38) {
      f.text({
        text: c.body,
        x: copyX,
        y: cursor,
        w: Math.min(copyW, u * 640),
        h: bodySpace,
        size: u * 16,
        maxLines: Math.max(1, Math.floor(bodySpace / (u * 16 * 1.55))),
        role: 'body',
        lineHeight: 1.55,
        color: alpha(palette.ink, 0.62),
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.48, span: 0.4 },
      })
    }

    if ((c.cta || f.brand.cta).trim()) {
      f.revealDraw(0.46, 0.4, () => {
        ctaPill(f, c.cta || f.brand.cta, copyX, ctaY, {
          fill: palette.accent,
          color: palette.mode === 'dark' ? palette.deep : palette.surface,
          size: u * 16,
          height: u * 46,
          padX: u * 26,
        })
        const note = c.contact
        if (note) {
          const pillWidth =
            measure(ctx, (c.cta || f.brand.cta).toUpperCase(), f.style(u * 16, {
              role: 'body',
              weight: 600,
              tracking: 0.14,
              color: palette.deep,
              uppercase: true,
            })) + u * 52
          f.label(note, copyX + pillWidth + u * 26, ctaY + u * 30, u * 14, {
            color: alpha(palette.ink, 0.6),
            tracking: 0.1,
            w: Math.max(u * 120, copyW - pillWidth - u * 30),
          })
        }
      })
    }

    // ── Footer ──────────────────────────────────────────────────────────────
    contactFooter(f, bottomY, {
      color: palette.ink,
      size: u * 15,
      items: [c.website],
      showBrand: true,
    })

    // ── Structural detail ───────────────────────────────────────────────────
    strokeLine(ctx, copyX, bottomY - u * 34, copyX + u * 56, bottomY - u * 34, alpha(palette.accent, 0.55), Math.max(0.8, u * 1.2))
    void scrim
  },
}
