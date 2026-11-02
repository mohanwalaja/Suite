import type { Composition } from './types'
import { alpha, mix, rng } from '../color'
import { fillRect, hatch, linearGradient, strokeLine, withClip } from '../draw'
import { measure } from '../text'
import { eyebrow, plate } from './shared'

/**
 * 11 · Layered collage
 * Physical paper: three plates at slight angles, tape strips, a postmark and a
 * texture wash. Copy lives on the main plate; the motif is taped on as a
 * separate photograph-like card.
 */
export const layeredCollage: Composition = {
  meta: {
    id: 'layered-collage',
    name: 'Artistic Layered Collage',
    family: 'Collage',
    index: 11,
    summary: 'Rotated paper plates, tape strips, postmark, motif card.',
    structure: 'Three paper plates are stacked at slight angles with shadows and tape. The main plate carries the headline and body, a second carries the CTA, and a third holds the artwork like a pinned print. A circular postmark anchors the lower corner.',
    focalPoint: 'The stacked, rotated plates',
    bestFor: ['festival', 'baby-naming', 'astrology-services', 'ganesha'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['deepam-lamp', 'painted-hills', 'kolam-grid', 'lotus-crest', 'peacock-feather'],
    motion: ['Plate drop-in', 'Tape slide', 'Postmark rotate', 'Grain drift'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const story = f.aspect === 'story'
    const landscape = f.aspect === 'landscape'
    const rand = rng((spec.id.length * 71 + 13) % 997)

    // Paper ground
    const ground = linearGradient(ctx, { x: 0, y: 0, w: W, h: H }, 128, [
      { at: 0, color: mix(palette.deep, palette.bg, 0.5) },
      { at: 1, color: mix(palette.bg, palette.surface, 0.5) },
    ])
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = palette.ink
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(rand() * W, rand() * H, u * 1.8, u * 1.8)
    }
    ctx.restore()

    // Optional wash circles
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.fillStyle = palette.accentAlt
    ctx.beginPath()
    ctx.arc(W * 0.15, H * 0.14, W * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    const plateFill = mix(palette.surface, palette.ink, palette.mode === 'dark' ? 0.03 : 0.02)
    const plateInk = palette.mode === 'dark' ? palette.ink : mix(palette.ink, palette.surface, 0.05)

    // Artwork card (upper right)
    const artSize = Math.min(W * 0.4, H * 0.28)
    const artRect = { x: W - artSize - u * 46, y: safe.y + u * 10, w: artSize, h: artSize * 1.12 }
    const artRot = -0.055
    f.revealDraw(0.1, 0.55, () => {
      plate(f, artRect, { fill: plateFill, rotate: artRot, shadow: 16, radius: u * 2 })
      ctx.save()
      const cx = artRect.x + artRect.w / 2
      const cy = artRect.y + artRect.h / 2
      ctx.translate(cx, cy)
      ctx.rotate(artRot)
      ctx.translate(-cx, -cy)
      withClip(ctx, { x: artRect.x + u * 12, y: artRect.y + u * 12, w: artRect.w - u * 24, h: artRect.h - u * 24 }, () => {
        fillRect(ctx, artRect, mix(palette.deep, palette.surface, 0.35))
        f.art({ x: artRect.x, y: artRect.y, w: artRect.w, h: artRect.h }, { opacity: 0.95 })
      })
      ctx.restore()
      // tape
      ctx.save()
      ctx.translate(artRect.x + artRect.w * 0.2, artRect.y + u * 4)
      ctx.rotate(-0.32)
      ctx.fillStyle = alpha(palette.accent, 0.32)
      ctx.fillRect(-u * 46, -u * 12, u * 92, u * 24)
      ctx.restore()
      f.text({
        text: 'archive plate',
        x: artRect.x,
        y: artRect.y + artRect.h + u * 10,
        w: artRect.w,
        size: u * 10,
        maxLines: 1,
        role: 'body',
        uppercase: true,
        tracking: 0.12,
        color: alpha(palette.ink, 0.4),
        id: 'art-caption',
        label: 'Art caption',
      })
    }, { distance: u * 30 })

    // Main plate
    const main = landscape
      ? { x: safe.x, y: safe.y + H * 0.18, w: W * 0.5, h: Math.min(H * 0.66, u * 760) }
      : { x: safe.x - u * 6, y: safe.y + H * (story ? 0.3 : 0.24), w: Math.min(W - u * 96, u * 760), h: Math.min(H * (story ? 0.34 : 0.4), u * 600) }
    const mainRot = 0.022
    f.revealDraw(0.2, 0.55, () => {
      plate(f, main, { fill: plateFill, rotate: mainRot, shadow: 26, radius: u * 3, texture: true })
      strokeLine(ctx, main.x, main.y + main.h - u * 54, main.x + main.w, main.y + main.h - u * 54, alpha(plateInk, 0.15), Math.max(0.6, u * 0.7))
    }, { distance: u * 40 })

    ctx.save()
    const mcx = main.x + main.w / 2
    const mcy = main.y + main.h / 2
    ctx.translate(mcx, mcy)
    ctx.rotate(mainRot)
    ctx.translate(-mcx, -mcy)

    const innerX = main.x + u * 48
    const innerW = main.w - u * 96
    eyebrow(f, c.eyebrow, innerX, main.y + u * 62, { size: u * 12.5, color: palette.accent, width: innerW * 0.6 })
    const head = f.text({
      text: c.headline,
      x: innerX,
      y: main.y + u * 96,
      w: innerW,
      h: main.h * 0.46,
      size: Math.min(u * 62, innerW * 0.145),
      minSize: u * 26,
      maxLines: 4,
      fit: true,
      role: 'display',
      weight: 600,
      lineHeight: 1.06,
      tracking: -0.01,
      color: plateInk,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.3, span: 0.5, distance: u * 18 },
    })
    if (c.body.trim()) {
      f.text({
        text: c.body,
        x: innerX,
        y: head.box.y + head.box.h + u * 22,
        w: innerW * 0.92,
        size: u * 15,
        maxLines: 3,
        role: 'body',
        lineHeight: 1.65,
        color: alpha(plateInk, 0.7),
        id: 'body',
        label: 'Body copy',
      })
    }
    ctx.restore()

    // Secondary CTA plate
    const ctaPlate = landscape
      ? { x: W * 0.56, y: safe.y + safe.h - u * 240, w: u * 360, h: u * 150 }
      : { x: safe.x + safe.w - u * 360, y: main.y + main.h + u * 42, w: u * 340, h: u * 150 }
    const ctaRot = -0.03
    f.revealDraw(0.42, 0.45, () => {
      plate(f, ctaPlate, { fill: palette.accent, rotate: ctaRot, shadow: 18, radius: u * 2 })
      ctx.save()
      const ccx = ctaPlate.x + ctaPlate.w / 2
      const ccy = ctaPlate.y + ctaPlate.h / 2
      ctx.translate(ccx, ccy)
      ctx.rotate(ctaRot)
      ctx.translate(-ccx, -ccy)
      f.text({
        text: (c.cta || f.brand.cta || 'Enquire now').toUpperCase(),
        x: ctaPlate.x + u * 24,
        y: ctaPlate.y + u * 34,
        w: ctaPlate.w - u * 48,
        size: u * 17,
        maxLines: 2,
        role: 'body',
        weight: 700,
        tracking: 0.1,
        lineHeight: 1.25,
        color: palette.mode === 'dark' ? palette.deep : palette.surface,
        id: 'cta',
        label: 'Call to action',
      })
      f.label(c.website || 'astrosivam.com', ctaPlate.x + u * 24, ctaPlate.y + ctaPlate.h - u * 26, u * 11, {
        color: alpha(palette.deep, 0.7),
        tracking: 0.14,
        w: ctaPlate.w - u * 48,
      })
      ctx.restore()
    }, { distance: u * 30 })

    // Postmark
    const stampX = landscape ? safe.x + u * 60 : safe.x + u * 58
    const stampY = landscape ? safe.y + safe.h - u * 90 : safe.y + safe.h - u * 92
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = alpha(palette.accent, 0.7)
    ctx.lineWidth = Math.max(0.8, u * 1.2)
    for (const r of [u * 46, u * 40]) {
      ctx.beginPath()
      ctx.arc(stampX, stampY, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.setLineDash([u * 3, u * 4])
    ctx.beginPath()
    ctx.arc(stampX, stampY, u * 34, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = alpha(palette.accent, 0.8)
    ctx.font = `600 ${Math.round(u * 11)}px ${f.bodyStack}`
    ctx.textAlign = 'center'
    ctx.fillText('ASTROSIVAM', stampX, stampY - u * 2)
    ctx.font = `400 ${Math.round(u * 9)}px ${f.bodyStack}`
    ctx.fillText('EST. CHENNAI', stampX, stampY + u * 14)
    ctx.restore()

    // Bottom details
    f.logo({
      x: safe.x + safe.w,
      y: safe.y + safe.h - u * 46,
      size: u * 22,
      align: 'right',
      showName: true,
      nameSize: u * 18,
      color: palette.ink,
    })
    if (c.subheadline.trim()) {
      f.text({
        text: c.subheadline,
        x: landscape ? safe.x : ctaPlate.x - u * 20 - u * 220,
        y: safe.y + safe.h - u * 44,
        w: u * 220,
        size: u * 11,
        maxLines: 2,
        role: 'body',
        uppercase: true,
        tracking: 0.16,
        color: alpha(palette.ink, 0.45),
        id: 'subheadline',
        label: 'Subheadline',
      })
    }

    // Grain hatch in one corner
    ctx.save()
    ctx.globalAlpha = 0.12
    hatch(ctx, { x: 0, y: H * 0.7, w: W * 0.3, h: H * 0.3 }, palette.accent, u * 12, Math.max(0.6, u * 0.7), 45)
    ctx.restore()
    void measure
  },
}
