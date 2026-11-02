import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, glow, linearGradient, starField, strokeLine, vignette, withClip } from '../draw'
import { contactFooter } from './shared'

/**
 * 12 · Cinematic devotional
 * A dark, wide-screen grade: the devotional motif rises from the lower edge into
 * a pool of light, tracked capitals sit dead centre with a rule above and below,
 * and event details run along the base like end credits.
 */
export const cinematicDevotional: Composition = {
  meta: {
    id: 'cinematic-devotional',
    name: 'Cinematic Devotional',
    family: 'Cinematic',
    index: 12,
    summary: 'Dark grade, rising artwork, centred tracked title, credit row.',
    structure: 'A single wide spotlight rises behind the devotional motif at the lower centre. The title is centred in tracked capitals between two rules; the subhead and event times form a credit row at the base. Heavy vignette and grain complete the film grade.',
    focalPoint: 'The lit motif and the centred title',
    bestFor: ['murugan', 'shiva', 'durga', 'ganesha', 'festival'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['temple-gopuram', 'trishul-crescent', 'vel-peacock', 'durga-shakti', 'deepam-lamp'],
    motion: ['Spotlight bloom', 'Motif rise', 'Title letterspace reveal', 'Embers', 'Light sweep'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const story = f.aspect === 'story'
    const landscape = f.aspect === 'landscape'
    const points = c.points.filter((p) => p.trim())

    const bg = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 100, [
      { at: 0, color: mix(palette.deep, '#000000', 0.45) },
      { at: 0.55, color: palette.deep },
      { at: 1, color: mix(palette.bg, '#000000', 0.3) },
    ])
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    starField(ctx, { x: 0, y: 0, w: W, h: H * 0.7 }, 90, palette.ink, 43, {
      maxRadius: Math.max(0.6, u * 1.3),
      opacity: 0.32,
    })

    // Spotlight
    const lightX = W * (landscape ? 0.62 : 0.5)
    const lightY = H * 0.52
    glow(ctx, lightX, lightY, Math.max(W, H) * (story ? 0.62 : 0.55), palette.accent, 0.3)
    const beam = ctx.createLinearGradient(lightX, 0, lightX, H)
    beam.addColorStop(0, alpha(palette.accent, 0))
    beam.addColorStop(0.5, alpha(palette.accent, 0.1))
    beam.addColorStop(1, alpha(palette.accent, 0))
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(lightX - W * 0.06, 0)
    ctx.lineTo(lightX + W * 0.06, 0)
    ctx.lineTo(lightX + W * 0.32, H)
    ctx.lineTo(lightX - W * 0.32, H)
    ctx.closePath()
    ctx.fill()

    // Artwork rises from the base
    const artSize = Math.min(W, H) * (story ? 1.02 : landscape ? 0.82 : 0.9)
    const artRect = landscape
      ? { x: W * 0.46, y: H - artSize * 0.82, w: artSize, h: artSize }
      : { x: W * 0.5 - artSize / 2, y: H - artSize * 0.76, w: artSize, h: artSize }
    const rise = f.timeline.at(0.06, 0.8)
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.translate(0, (1 - rise) * u * 40)
    f.art(artRect, { opacity: 0.96 })
    ctx.restore()

    // Light pool at the base
    const pool = ctx.createLinearGradient(0, H * 0.7, 0, H)
    pool.addColorStop(0, alpha(palette.accent, 0))
    pool.addColorStop(0.7, alpha(palette.accent, 0.22))
    pool.addColorStop(1, alpha(palette.accent, 0.05))
    ctx.fillStyle = pool
    ctx.fillRect(0, H * 0.7, W, H * 0.3)

    // Vignette
    vignette(ctx, W, H, '#000000', 0.72, 1.05)

    // Top mark
    f.label((f.brand.name || 'ASTROSIVAM').toUpperCase(), W / 2, safe.y + u * 18, u * 12, {
      align: 'center',
      color: alpha(palette.ink, 0.65),
      tracking: 0.42,
      w: W * 0.9,
    })
    f.label((f.spec.categoryId || '').replace(/-/g, ' '), W / 2, safe.y + u * 40, u * 9.5, {
      align: 'center',
      color: alpha(palette.accent, 0.7),
      tracking: 0.3,
      w: W * 0.9,
    })

    // Title block
    const titleTop = landscape ? safe.y + safe.h * 0.2 : H * (story ? 0.42 : 0.4)
    const titleW = landscape ? safe.w * 0.5 : safe.w * (story ? 0.9 : 0.86)
    const titleX = landscape ? safe.x : W / 2 - titleW / 2
    const ruleW = u * 66

    strokeLine(ctx, W / 2 - ruleW, titleTop - u * 26, W / 2 + ruleW, titleTop - u * 26, alpha(palette.accent, 0.6), Math.max(0.7, u * 0.9))
    ctx.save()
    ctx.fillStyle = alpha(palette.accent, 0.9)
    for (const [x, y] of [
      [W / 2 - ruleW, titleTop - u * 26],
      [W / 2 + ruleW, titleTop - u * 26],
    ]) {
      ctx.beginPath()
      ctx.moveTo(x, y - u * 3)
      ctx.lineTo(x + u * 3, y)
      ctx.lineTo(x, y + u * 3)
      ctx.lineTo(x - u * 3, y)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    const head = f.text({
      text: c.headline,
      x: titleX,
      y: titleTop,
      w: titleW,
      h: H * (story ? 0.16 : 0.14),
      size: Math.min(u * 74, titleW * 0.115),
      minSize: u * 26,
      maxLines: 3,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      uppercase: true,
      tracking: 0.09,
      lineHeight: 1.24,
      color: palette.ink,
      align: 'center',
      id: 'headline',
      label: 'Headline',
      required: true,
      shadow: { color: alpha('#000000', 0.5), blur: u * 30, offsetY: u * 4 },
      anim: { start: 0.26, span: 0.55, distance: u * 18 },
    })

    const subY = head.box.y + head.box.h + u * 22
    if (c.subheadline.trim()) {
      strokeLine(ctx, W / 2 - ruleW * 0.6, subY + u * 6, W / 2 + ruleW * 0.6, subY + u * 6, alpha(palette.ink, 0.2), Math.max(0.6, u * 0.7))
      f.text({
        text: c.subheadline,
        x: titleX,
        y: subY + u * 18,
        w: titleW,
        size: u * 13.5,
        maxLines: 2,
        role: 'body',
        weight: 500,
        uppercase: true,
        tracking: 0.26,
        lineHeight: 1.7,
        color: alpha(palette.ink, 0.75),
        align: 'center',
        id: 'subheadline',
        label: 'Subheadline',
        anim: { start: 0.44, span: 0.45 },
      })
    }

    // Credit row: event details
    if (points.length) {
      const rowY = safe.y + safe.h - u * 96
      const joined = points.slice(0, 3).join('   ·   ')
      f.text({
        text: joined,
        x: safe.x,
        y: rowY,
        w: safe.w,
        size: u * 12.5,
        maxLines: 2,
        role: 'body',
        weight: 500,
        uppercase: true,
        tracking: 0.2,
        lineHeight: 1.8,
        color: alpha(palette.ink, 0.62),
        align: 'center',
        id: 'details',
        label: 'Event details',
      })
    }

    if (c.body.trim() && !story) {
      f.text({
        text: c.body,
        x: W / 2 - safe.w * 0.34,
        y: safe.y + safe.h - u * 62,
        w: safe.w * 0.68,
        size: u * 13,
        maxLines: 2,
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.45),
        align: 'center',
        id: 'body',
        label: 'Body copy',
      })
    }

    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 11,
      align: 'center',
      x: safe.x,
      w: safe.w,
      rule: false,
      showBrand: false,
      items: [c.website],
    })

    // Letterbox for landscape
    if (landscape) {
      const bar = H * 0.05
      ctx.save()
      ctx.fillStyle = alpha('#000000', 0.55)
      ctx.fillRect(0, 0, W, bar)
      ctx.fillRect(0, H - bar, W, bar)
      ctx.restore()
    }
    void fillRect
    void withClip
  },
}
