import type { Composition } from './types'
import { alpha, mix } from '../color'
import { arcStroke, dotRing, fillRect, linearGradient, strokeLine, strokeRect, withClip } from '../draw'
import { eyebrow, ctaPill } from './shared'
import { getCategory } from '../categories'
import { SITE_INFO } from '../services'

/**
 * 10 · Premium infographic
 * A process diagram is the hero: numbered discs on a connector line, each with
 * its own label column. Data rows and a hairline table below, artwork cropped
 * to a narrow vertical strip at the right edge.
 */
export const premiumInfographic: Composition = {
  meta: {
    id: 'premium-infographic',
    name: 'Premium Infographic',
    family: 'Information',
    index: 10,
    summary: 'Numbered process diagram over a hairline data table.',
    structure: 'A technical sheet: header row, headline in a wide sans, a three-step diagram built from numbered discs and a connector line, then hairline data rows. Artwork is cropped into a slim vertical strip at the outer edge instead of taking a hero block.',
    focalPoint: 'The numbered process discs',
    bestFor: ['navagraha', 'subha-muhurtham', 'astrology-services', 'temple-event', 'birth-jathagam'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['navagraha', 'astrolabe', 'topographic', 'orbit-network', 'temple-gopuram'],
    motion: ['Disc draw-on', 'Connector line draw', 'Row stagger', 'Data dots pulse'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const points = c.points.filter((p) => p.trim())

    const paper = mix(palette.bg, palette.surface, palette.mode === 'dark' ? 0.3 : 0.45)
    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, paper)

    // Dot matrix background
    ctx.save()
    ctx.globalAlpha = 0.3
    for (let x = safe.x; x < safe.x + safe.w; x += u * 26) {
      for (let y = safe.y; y < safe.y + safe.h; y += u * 26) {
        ctx.fillStyle = alpha(palette.ink, 0.13)
        ctx.fillRect(x, y, Math.max(1, u * 1.4), Math.max(1, u * 1.4))
      }
    }
    ctx.restore()

    // Art strip on the outer edge
    const stripW = W * (landscape ? 0.16 : 0.2)
    const strip = { x: W - stripW, y: 0, w: stripW, h: H }
    f.revealDraw(0.05, 0.6, () => {
      withClip(ctx, strip, () => {
        if (palette.mode === 'light') {
          // Light sheets get a measured rail instead of illustration: the
          // engraving motifs are built from the palette's darkest tones and go
          // muddy on pale paper.
          fillRect(ctx, strip, mix(palette.bg, palette.accent, 0.1))
          strokeLine(ctx, strip.x + stripW * 0.18, 0, strip.x + stripW * 0.18, H, alpha(palette.ink, 0.18), Math.max(0.7, u * 0.8))
          for (let y = safe.y; y < safe.y + safe.h; y += u * 34) {
            const long = Math.round((y - safe.y) / (u * 34)) % 5 === 0
            strokeLine(
              ctx,
              strip.x + stripW * 0.18,
              y,
              strip.x + stripW * 0.18 + stripW * (long ? 0.45 : 0.16),
              y,
              alpha(palette.ink, long ? 0.4 : 0.2),
              Math.max(0.6, u * 0.8),
            )
          }
          ctx.save()
          ctx.translate(strip.x + stripW * 0.78, safe.y + safe.h)
          ctx.rotate(-Math.PI / 2)
          ctx.font = `600 ${Math.round(u * 12)}px ${f.bodyStack}`
          ctx.fillStyle = alpha(palette.ink, 0.5)
          ctx.textAlign = 'left'
          ctx.fillText(`${(c.eyebrow || 'ASTRO SIVAM').toUpperCase()}  ·  INFORMATION SHEET`, 0, 0)
          ctx.restore()
          ctx.fillStyle = palette.accent
          ctx.fillRect(strip.x + stripW * 0.52, safe.y + safe.h - u * 62, u * 26, u * 2)
        } else {
          fillRect(ctx, strip, mix(palette.deep, palette.bg, 0.4))
          // Sized to the band: `min(w,h)` drives every motif's scale, so a very
          // tall rect would blow the artwork up beyond the strip.
          f.art(
            { x: strip.x + stripW * 0.12, y: H * 0.36, w: stripW * 0.76, h: Math.max(stripW * 0.9, H * 0.42) },
            { opacity: 1 },
          )
          const veil = linearGradient(ctx, strip, 90, [
            { at: 0, color: alpha(palette.deep, 0.25) },
            { at: 0.55, color: alpha(palette.deep, 0.05) },
            { at: 1, color: alpha(palette.deep, 0.85) },
          ])
          ctx.fillStyle = veil
          ctx.fillRect(strip.x, 0, stripW, H)
        }
      })
      strokeLine(ctx, strip.x, 0, strip.x, H, alpha(palette.accent, 0.45), Math.max(0.8, u))
    })

    const contentW = safe.w - stripW - u * 20

    // Header
    const headerY = safe.y + u * 18
    eyebrow(f, c.eyebrow || 'SERVICE INDEX', safe.x, headerY, { size: u * 12, color: palette.accent, rule: false })
    f.label('ASTROSIVAM · INFORMATION SHEET', safe.x + contentW, headerY, u * 11, {
      align: 'right',
      color: alpha(palette.ink, 0.45),
      tracking: 0.2,
      w: contentW * 0.6,
    })
    strokeLine(ctx, safe.x, headerY + u * 16, safe.x + contentW, headerY + u * 16, alpha(palette.ink, 0.3), Math.max(0.8, u))

    // Headline
    const head = f.text({
      text: c.headline,
      x: safe.x,
      y: headerY + u * 46,
      w: contentW,
      h: H * (story ? 0.16 : 0.14),
      size: Math.min(u * 62, contentW * 0.115),
      minSize: u * 26,
      maxLines: 3,
      fit: true,
      role: 'display',
      weight: 600,
      tracking: -0.02,
      lineHeight: 1.02,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.16, span: 0.5, distance: u * 18 },
    })

    f.text({
      text: c.subheadline,
      x: safe.x,
      y: head.box.y + head.box.h + u * 16,
      w: contentW * 0.86,
      size: u * 14,
      maxLines: 2,
      role: 'body',
      weight: 500,
      uppercase: true,
      tracking: 0.16,
      lineHeight: 1.55,
      color: alpha(palette.ink, 0.6),
      id: 'subheadline',
      label: 'Subheadline',
    })

    // Process diagram
    const steps = points.slice(0, landscape ? 3 : 3)
    const diagramTop = head.box.y + head.box.h + u * (story ? 88 : 96)
    if (steps.length > 0) {
      const cols = steps.length
      const cellW = contentW / cols
      const discR = Math.min(u * 38, cellW * 0.15)
      const lineY = diagramTop + discR
      strokeLine(ctx, safe.x + discR, lineY, safe.x + contentW - discR, lineY, alpha(palette.ink, 0.18), Math.max(0.8, u))
      steps.forEach((step, i) => {
        const cx = safe.x + cellW * i + cellW / 2
        const p = f.timeline.at(0.34 + i * 0.1, 0.45)
        ctx.save()
        ctx.globalAlpha *= spec.animation.enabled ? 0.3 + p * 0.7 : 1
        // Disc
        ctx.fillStyle = i === 0 ? palette.accent : alpha(palette.surface, 0.9)
        ctx.beginPath()
        ctx.arc(cx, lineY, discR, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = i === 0 ? palette.accent : alpha(palette.accent, 0.5)
        ctx.lineWidth = Math.max(1, u * 1.3)
        ctx.stroke()
        arcStroke(ctx, cx, lineY, discR + u * 7, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * p, alpha(palette.accent, 0.6), Math.max(0.9, u))
        ctx.fillStyle = i === 0 ? (palette.mode === 'dark' ? palette.deep : palette.surface) : palette.ink
        ctx.font = `600 ${Math.round(u * 22)}px ${f.bodyStack}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(i + 1).padStart(2, '0'), cx, lineY + u * 1)
        ctx.restore()
        // Label
        const labelW = cellW - u * 24
        f.text({
          text: step,
          x: cx - labelW / 2,
          y: lineY + discR + u * 26,
          w: labelW,
          size: u * 14.5,
          maxLines: 3,
          role: 'body',
          weight: 500,
          lineHeight: 1.45,
          color: alpha(palette.ink, 0.82),
          align: 'center',
          id: `step-${i}`,
          label: `Step ${i + 1}`,
        })
      })
      // small tick marks on the connector
      for (let i = 0; i <= 12; i++) {
        const x = safe.x + discR + ((contentW - discR * 2) / 12) * i
        strokeLine(ctx, x, lineY + u * 4, x, lineY + u * 10, alpha(palette.ink, 0.2), Math.max(0.5, u * 0.6))
      }
    }

    // Body copy in the open middle of the sheet
    if (c.body.trim()) {
      f.text({
        text: c.body,
        x: safe.x,
        y: diagramTop + u * (landscape ? 190 : 250),
        w: contentW * (landscape ? 0.58 : 0.72),
        h: u * (landscape ? 120 : 220),
        size: u * (landscape ? 14 : 15.5),
        minSize: u * 12,
        maxLines: landscape ? 3 : 4,
        fit: true,
        role: 'body',
        lineHeight: 1.7,
        color: alpha(palette.ink, 0.62),
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.58, span: 0.4 },
      })
      strokeLine(
        ctx,
        safe.x,
        diagramTop + u * (landscape ? 170 : 220),
        safe.x + contentW * 0.12,
        diagramTop + u * (landscape ? 170 : 220),
        alpha(palette.accent, 0.6),
        Math.max(0.8, u * 1.2),
      )
    }

    // Data rows
    const tableTop = Math.max(diagramTop + u * 210, safe.y + safe.h - u * 260)
    const rowH = u * 38
    // Real values only: category naming, delivery and languages come from the
    // verified astrosivam.com data, never from placeholder marketing copy.
    const rows = [
      { k: 'Service', v: getCategory(f.spec.categoryId).name },
      { k: 'Delivery', v: SITE_INFO.deliveryShort },
      { k: 'Language', v: SITE_INFO.languages.join(' · ') },
    ]
    const tableW = contentW * (landscape ? 0.62 : 0.9)
    rows.forEach((row, i) => {
      const y = tableTop + i * rowH
      strokeLine(ctx, safe.x, y, safe.x + tableW, y, alpha(palette.ink, 0.14), Math.max(0.6, u * 0.7))
      f.label(row.k, safe.x, y + u * 24, u * 10.5, {
        color: alpha(palette.ink, 0.45),
        tracking: 0.16,
        w: tableW * 0.28,
      })
      f.text({
        text: row.v,
        x: safe.x + tableW * 0.3,
        y: y + u * 8,
        w: tableW * 0.7,
        size: u * 13.5,
        maxLines: 1,
        role: 'body',
        color: alpha(palette.ink, 0.8),
        id: `row-${i}`,
        label: `Row ${i + 1}`,
      })
      f.label(String(i + 1).padStart(2, '0'), safe.x + tableW, y + u * 24, u * 10, {
        align: 'right',
        color: alpha(palette.accent, 0.7),
        tracking: 0.1,
        w: u * 40,
      })
    })

    // CTA
    if (c.cta.trim()) {
      ctaPill(f, c.cta, safe.x, safe.y + safe.h - u * 58, {
        fill: palette.accent,
        color: palette.mode === 'dark' ? palette.deep : palette.surface,
        size: u * 13,
        height: u * 42,
        padX: u * 22,
      })
    }
    f.logo({
      x: safe.x + safe.w - stripW - u * 20,
      y: safe.y + safe.h - u * 44,
      size: u * 20,
      align: 'right',
      showName: false,
      color: palette.ink,
    })
    dotRing(ctx, safe.x + safe.w - stripW - u * 26, safe.y + u * 34, u * 12, 12, u * 1.2, alpha(palette.accent, 0.5))
    strokeRect(ctx, { x: safe.x, y: safe.y, w: contentW, h: safe.h }, alpha(palette.ink, 0.1), Math.max(0.6, u * 0.7))
    void dotRing
  },
}
