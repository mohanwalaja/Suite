import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, linearGradient, roundRectPath, strokeLine, withClip } from '../draw'
import { measure } from '../text'
import { contactFooter } from './shared'

/**
 * 15 · Bold campaign
 * Advertising energy: colour blocks, a rotated sticker, an oversized phone
 * number, a marquee strip and a heavy uppercase headline. Artwork is cropped
 * into a circular window that collides with the type.
 */
export const boldCampaign: Composition = {
  meta: {
    id: 'bold-campaign',
    name: 'Bold Advertising Campaign',
    family: 'Campaign',
    index: 15,
    summary: 'Colour blocks, rotated sticker, marquee strip, oversized contact.',
    structure: 'A campaign layout: solid colour block across the top, heavyweight uppercase headline, a circular artwork window that cuts into the type, a rotated sticker badge, a marquee strip of the brand name and an oversized contact line at the base.',
    focalPoint: 'The comment-worthy sticker + circular art window',
    bestFor: ['astrology-services', 'subha-muhurtham', 'festival', 'durga'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['geometric-strata', 'durga-shakti', 'celestial-orb', 'painted-hills', 'mandala-sun'],
    motion: ['Block wipe', 'Sticker spin-in', 'Marquee scroll', 'Headline snap'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const story = f.aspect === 'story'
    const landscape = f.aspect === 'landscape'
    const points = c.points.filter((p) => p.trim())

    const base = mix(palette.deep, '#000000', 0.2)
    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, base)

    // Top colour block
    const blockH = H * (story ? 0.26 : 0.24)
    const blockG = linearGradient(ctx, { x: 0, y: 0, w: W, h: blockH }, 100, [
      { at: 0, color: palette.accent },
      { at: 1, color: mix(palette.accent, palette.accentAlt, 0.55) },
    ])
    ctx.fillStyle = blockG
    ctx.fillRect(0, 0, W, blockH)
    // Block hatch
    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.strokeStyle = palette.deep
    ctx.lineWidth = u * 2
    for (let x = -H; x < W + H; x += u * 22) {
      ctx.beginPath()
      ctx.moveTo(x, blockH)
      ctx.lineTo(x + blockH, 0)
      ctx.stroke()
    }
    ctx.restore()

    // Brand row inside the block
    const onAccent = palette.mode === 'dark' ? palette.deep : palette.surface
    f.logo({ x: safe.x, y: safe.y + u * 4, size: u * 26, showName: true, nameSize: u * 22, color: onAccent })
    const badgeW = u * 132
    const badge = { x: safe.x + safe.w - badgeW, y: safe.y + u * 2, w: badgeW, h: u * 34 }
    roundRectPath(ctx, badge.x, badge.y, badge.w, badge.h, badge.h / 2)
    ctx.fillStyle = onAccent
    ctx.fill()
    f.label(c.eyebrow || 'ASTROLOGY', badge.x + badge.w / 2, badge.y + u * 24, u * 10.5, {
      align: 'center',
      color: palette.accent,
      tracking: 0.14,
      weight: 700,
      w: badge.w - u * 10,
    })

    // Artwork circle crashing into the headline zone
    const circleR = Math.min(W * 0.34, H * (story ? 0.2 : 0.17))
    const circle = { cx: W - circleR - u * 10, cy: blockH + circleR * 0.72, r: circleR }
    f.revealDraw(0.1, 0.55, () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
      ctx.clip()
      fillRect(ctx, { x: circle.cx - circle.r, y: circle.cy - circle.r, w: circle.r * 2, h: circle.r * 2 }, mix(palette.surface, palette.deep, 0.35))
      f.art({ x: circle.cx - circle.r * 1.2, y: circle.cy - circle.r * 1.2, w: circle.r * 2.4, h: circle.r * 2.4 }, { opacity: 0.98 })
      ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
      ctx.strokeStyle = palette.accent
      ctx.lineWidth = Math.max(2, u * 4)
      ctx.stroke()
      ctx.restore()
      // secondary dashed orbit
      ctx.save()
      ctx.beginPath()
      ctx.arc(circle.cx, circle.cy, circle.r + u * 16, 0, Math.PI * 2)
      ctx.setLineDash([u * 5, u * 8])
      ctx.strokeStyle = alpha(palette.accent, 0.45)
      ctx.lineWidth = Math.max(0.8, u)
      ctx.stroke()
      ctx.restore()
    }, { scaleFrom: 0.9 })

    // Headline
    const headTop = blockH + u * 46
    const headW = landscape ? safe.w * 0.6 : safe.w * 0.82
    const head = f.text({
      text: c.headline,
      x: safe.x,
      y: headTop,
      w: headW,
      h: H * (story ? 0.2 : 0.18),
      size: Math.min(u * 84, headW * 0.14),
      minSize: u * 30,
      maxLines: 4,
      fit: true,
      role: 'display',
      weight: 800,
      uppercase: true,
      tracking: -0.025,
      lineHeight: 0.94,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.2, span: 0.45, distance: u * 30 },
    })

    // Sticker
    const stickerR = u * 62
    const sticker = { x: safe.x + stickerR * 0.2, y: head.box.y + head.box.h + u * 26 + stickerR }
    ctx.save()
    ctx.translate(sticker.x, sticker.y)
    ctx.rotate(-0.16)
    ctx.beginPath()
    ctx.arc(0, 0, stickerR, 0, Math.PI * 2)
    ctx.fillStyle = palette.accentAlt
    ctx.fill()
    ctx.strokeStyle = onAccent
    ctx.lineWidth = Math.max(1, u * 1.5)
    ctx.stroke()
    // Fit the CTA inside the disc: measure, shrink to the chord, then split on
    // word boundaries instead of truncating ("ORDER A REPO" was a real bug).
    const stickerWords = (c.cta || 'BOOK NOW').toUpperCase().split(/\s+/)
    const maxW = stickerR * 1.42
    let stickerSize = u * 15
    let lines = [stickerWords.join(' ')]
    const stickerStyle = (size: number) => `800 ${Math.round(size)}px ${f.bodyStack}`
    const widthAt = (size: number, text: string) => {
      ctx.font = stickerStyle(size)
      return ctx.measureText(text).width
    }
    if (widthAt(stickerSize, lines[0]) > maxW) {
      const mid = Math.ceil(stickerWords.length / 2)
      lines = [stickerWords.slice(0, mid).join(' '), stickerWords.slice(mid).join(' ')].filter(Boolean)
      while (stickerSize > u * 9 && lines.some((l) => widthAt(stickerSize, l) > maxW)) stickerSize -= u * 0.5
    }
    ctx.fillStyle = onAccent
    ctx.font = stickerStyle(stickerSize)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lineH = stickerSize * 1.05
    lines.forEach((line, i) => ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineH - u * 4))
    ctx.font = `600 ${Math.round(u * 9)}px ${f.bodyStack}`
    ctx.fillStyle = alpha(onAccent, 0.75)
    ctx.fillText('ASTRO SIVAM', 0, stickerR * 0.62)
    ctx.textBaseline = 'alphabetic'
    ctx.restore()

    // Supporting copy right of the sticker
    const subX = sticker.x + stickerR + u * 28
    // Only pull the copy in when it actually runs into the circular window.
    const copyTop = sticker.y - stickerR * 0.55
    const circleOverlaps = copyTop < circle.cy + circle.r
    const subW = circleOverlaps
      ? Math.min(safe.x + safe.w - subX, Math.max(u * 220, circle.cx - circle.r - u * 26 - subX))
      : safe.x + safe.w - subX
    // A narrow column beside the circular window needs more lines, not smaller
    // copy — the preflight check caught clipped body text on story formats.
    const narrow = subW < u * 300
    if (c.subheadline.trim() && subW > u * 150) {
      f.text({
        text: c.subheadline,
        x: subX,
        y: sticker.y - stickerR * 0.55,
        w: subW,
        size: u * 13,
        maxLines: narrow ? 4 : 2,
        role: 'body',
        weight: 600,
        uppercase: true,
        tracking: 0.18,
        lineHeight: 1.55,
        color: alpha(palette.ink, 0.85),
        id: 'subheadline',
        label: 'Subheadline',
      })
    }
    if (c.body.trim()) {
      f.text({
        text: c.body,
        x: subX,
        y: sticker.y - stickerR * 0.1,
        w: Math.max(u * 160, subW),
        size: u * 13.5,
        maxLines: narrow ? 8 : 3,
        role: 'body',
        lineHeight: 1.55,
        color: alpha(palette.ink, 0.55),
        id: 'body',
        label: 'Body copy',
      })
    }

    // Marquee baseline (declared early: the chips stack sits above it)
    const stripY = safe.y + safe.h - u * 138

    // Points as bold chips
    if (points.length && spec.layout.showPoints) {
      const chipY = Math.min(sticker.y + stickerR + u * 34, stripY - u * 112)
      let cx = safe.x
      const maxY = safe.y + safe.h - u * 210
      points.slice(0, 3).forEach((point, i) => {
        if (chipY > maxY) return
        const style = f.style(u * 11, {
          role: 'body',
          weight: 600,
          tracking: 0.08,
          uppercase: true,
          color: alpha(palette.ink, 0.85),
          align: 'left',
        })
        const text = point.toUpperCase()
        const w = Math.min(safe.w, measure(ctx, text, style) + u * 34)
        if (cx + w > safe.x + safe.w) {
          cx = safe.x
        }
        const y = chipY + Math.floor(i / 2) * u * 46
        roundRectPath(ctx, cx, y, w, u * 36, u * 18)
        ctx.fillStyle = alpha(palette.ink, 0.08)
        ctx.fill()
        strokeLine(ctx, cx + u * 14, y + u * 18, cx + u * 20, y + u * 18, palette.accent, Math.max(1, u * 1.5))
        f.label(text, cx + u * 26, y + u * 23, u * 11, {
          color: alpha(palette.ink, 0.85),
          tracking: 0.08,
          weight: 600,
          w: w - u * 36,
        })
        cx += w + u * 10
      })
    }

    // Oversized ghost wordmark fills the lower void in campaign style
    ctx.save()
    withClip(ctx, { x: 0, y: sticker.y + stickerR, w: W, h: Math.max(0, stripY - (sticker.y + stickerR) - u * 20) }, () => {
      const ghost = (f.brand.name || 'ASTRO SIVAM').toUpperCase()
      let ghostSize = u * 120
      ctx.font = `800 ${Math.round(ghostSize)}px ${f.bodyStack}`
      const gw = ctx.measureText(ghost).width
      if (gw > safe.w) {
        ghostSize *= safe.w / gw
        ctx.font = `800 ${Math.round(ghostSize)}px ${f.bodyStack}`
      }
      ctx.fillStyle = alpha(palette.ink, 0.055)
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(ghost, safe.x, stripY - u * 58)
    })
    ctx.restore()

    // Marquee strip
    const stripH = u * 46
    ctx.save()
    ctx.translate(0, stripY)
    ctx.rotate(-0.025)
    ctx.fillStyle = palette.accent
    ctx.fillRect(-W * 0.1, 0, W * 1.2, stripH)
    const marquee = `${(f.brand.name || 'ASTROSIVAM').toUpperCase()}  ·  ${(c.website || '').toUpperCase()}  ·  `
    const mStyle = f.style(u * 20, {
      role: 'body',
      weight: 800,
      tracking: 0.14,
      uppercase: true,
      color: onAccent,
      align: 'left',
    })
    const mw = measure(ctx, marquee, mStyle)
    let mx = -((f.timeline.enabled ? f.timeline.time : 0) * u * 60) % mw
    while (mx < W) {
      ctx.font = `800 ${Math.round(u * 20)}px ${f.bodyStack}`
      ctx.fillStyle = onAccent
      let chx = mx
      for (const ch of marquee) {
        ctx.fillText(ch, chx, stripH * 0.68)
        chx += ctx.measureText(ch).width + u * 20 * 0.14
      }
      mx += mw
    }
    ctx.restore()

    // Oversized contact line
    const contact = c.contact || c.website
    if (contact) {
      f.label(contact, safe.x, safe.y + safe.h - u * 56, u * 22, {
        color: palette.ink,
        tracking: 0.02,
        weight: 700,
        w: safe.w * 0.8,
      })
    }
    if (c.website && c.contact) {
      f.label(c.website, safe.x + safe.w, safe.y + safe.h - u * 56, u * 12, {
        align: 'right',
        color: alpha(palette.ink, 0.55),
        tracking: 0.14,
        w: safe.w * 0.5,
      })
    }

    contactFooter(f, safe.y + safe.h, {
      color: palette.ink,
      size: u * 10,
      rule: false,
      showBrand: false,
      items: [],
    })

    // Corner crop marks
    ctx.save()
    ctx.strokeStyle = alpha(palette.ink, 0.18)
    ctx.lineWidth = Math.max(0.7, u)
    for (const [x, y, dx, dy] of [
      [u * 18, u * 18, 1, 1],
      [W - u * 18, u * 18, -1, 1],
      [u * 18, H - u * 18, 1, -1],
      [W - u * 18, H - u * 18, -1, -1],
    ] as const) {
      ctx.beginPath()
      ctx.moveTo(x, y + dy * u * 22)
      ctx.lineTo(x, y)
      ctx.lineTo(x + dx * u * 22, y)
      ctx.stroke()
    }
    ctx.restore()
    void withClip
    void contact
  },
}
