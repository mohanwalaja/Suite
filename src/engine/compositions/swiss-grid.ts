import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, linearGradient, strokeLine, strokeRect, withClip } from '../draw'
import { eyebrow, ctaPill } from './shared'

/**
 * 13 · Swiss grid
 * The grid is visible: twelve columns and a baseline system drawn as hairlines.
 * Type is flush left in a heavy sans; an artwork block occupies exact modules;
 * an accent square and a numbered index provide the only colour events.
 */
export const swissGrid: Composition = {
  meta: {
    id: 'swiss-grid',
    name: 'Swiss Grid',
    family: 'Grid',
    index: 13,
    summary: 'Visible 12-column grid, modular art block, flush-left sans type.',
    structure: 'A 12-column grid is drawn as hairlines and everything snaps to it. A heavy sans headline spans columns 1–8, an artwork block occupies modules 9–12, and the service list is set in two measured columns with an accent index square.',
    focalPoint: 'The modular art block inside the visible grid',
    bestFor: ['temple-event', 'navagraha', 'astrology-services', 'subha-muhurtham'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['astrolabe', 'topographic', 'temple-arch', 'navagraha', 'geometric-strata'],
    motion: ['Grid draw', 'Module reveal', 'Headline slide', 'Accent square scale'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const points = c.points.filter((p) => p.trim())
    const paper = mix(palette.bg, palette.surface, palette.mode === 'dark' ? 0.28 : 0.5)

    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, paper)
    const accent = palette.accent
    const cols = 12
    const gutter = u * 12
    const colW = (safe.w - gutter * (cols - 1)) / cols
    const colX = (i: number) => safe.x + i * (colW + gutter)
    const spanW = (n: number) => colW * n + gutter * (n - 1)

    // Visible grid
    ctx.save()
    ctx.strokeStyle = alpha(palette.ink, 0.1)
    ctx.lineWidth = Math.max(0.5, u * 0.6)
    for (let i = 0; i <= cols; i++) {
      const x = i === cols ? safe.x + safe.w : colX(i) - (i === 0 ? 0 : gutter / 2)
      ctx.beginPath()
      ctx.moveTo(x, safe.y)
      ctx.lineTo(x, safe.y + safe.h)
      ctx.stroke()
    }
    for (let i = 0; i <= 6; i++) {
      const y = safe.y + (safe.h / 6) * i
      ctx.beginPath()
      ctx.moveTo(safe.x, y)
      ctx.lineTo(safe.x + safe.w, y)
      ctx.stroke()
    }
    ctx.restore()

    // Top labels
    f.label('ASTROSIVAM', colX(0), safe.y + u * 20, u * 11, {
      color: palette.ink,
      tracking: 0.22,
      weight: 700,
      w: spanW(3),
    })
    f.label((f.spec.categoryId || '').replace(/-/g, ' '), colX(4), safe.y + u * 20, u * 10, {
      color: alpha(palette.ink, 0.55),
      tracking: 0.18,
      w: spanW(4),
    })
    f.label('13 / 15', colX(11), safe.y + u * 20, u * 10, {
      align: 'right',
      color: alpha(palette.ink, 0.55),
      tracking: 0.14,
      w: colW,
    })
    strokeLine(ctx, safe.x, safe.y + u * 30, safe.x + safe.w, safe.y + u * 30, alpha(palette.ink, 0.55), Math.max(1, u * 1.4))

    // Headline
    const headW = spanW(landscape ? 6 : 8)
    const head = f.text({
      text: c.headline,
      x: colX(0),
      y: safe.y + u * 82,
      w: headW,
      h: H * (story ? 0.2 : 0.22),
      size: Math.min(u * 86, headW * 0.14),
      minSize: u * 30,
      maxLines: 4,
      fit: true,
      role: 'display',
      weight: 800,
      uppercase: true,
      tracking: -0.03,
      lineHeight: 0.94,
      color: palette.ink,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.2, span: 0.5, distance: u * 22 },
    })

    // Accent square + kicker under headline
    const kickY = head.box.y + head.box.h + u * 26
    ctx.save()
    ctx.fillStyle = accent
    ctx.fillRect(colX(0), kickY - u * 12, u * 22, u * 22)
    ctx.restore()
    f.label(c.eyebrow, colX(0) + u * 32, kickY + u * 4, u * 10.5, {
      color: alpha(palette.ink, 0.7),
      tracking: 0.18,
      weight: 600,
      w: spanW(7) - u * 32,
    })

    // Artwork block — modules 9–12 by rows 3–5
    const artCol = landscape ? 8 : 8
    const artRow = story ? 2 : 2
    const artX = colX(artCol)
    const artY = safe.y + (safe.h / 6) * artRow + u * 44
    const artW = safe.x + safe.w - artX
    const artH = Math.min(safe.h * (story ? 0.34 : 0.4), artW * 1.28)
    f.revealDraw(0.12, 0.55, () => {
      withClip(ctx, { x: artX, y: artY, w: artW, h: artH }, () => {
        fillRect(ctx, { x: artX, y: artY, w: artW, h: artH }, mix(palette.deep, palette.accent, 0.14))
        f.art({ x: artX - artW * 0.1, y: artY - artH * 0.1, w: artW * 1.2, h: artH * 1.2 }, { opacity: 1 })
        const g = linearGradient(ctx, { x: artX, y: artY, w: artW, h: artH }, 90, [
          { at: 0, color: alpha(palette.deep, 0) },
          { at: 1, color: alpha(palette.deep, 0.18) },
        ])
        ctx.fillStyle = g
        ctx.fillRect(artX, artY, artW, artH)
      })
      strokeRect(ctx, { x: artX, y: artY, w: artW, h: artH }, alpha(palette.accent, 0.5), Math.max(0.7, u))
    }, { scaleFrom: 1.04 })

    f.label('Fig. 01', artX, artY + artH + u * 18, u * 9.5, {
      color: alpha(palette.ink, 0.5),
      tracking: 0.14,
      w: artW,
    })
    if (c.subheadline.trim()) {
      f.text({
        text: c.subheadline,
        x: artX,
        y: artY + artH + u * 34,
        w: artW,
        size: u * 10.5,
        maxLines: 2,
        role: 'body',
        uppercase: true,
        tracking: 0.1,
        lineHeight: 1.5,
        color: alpha(palette.ink, 0.5),
        id: 'subheadline',
        label: 'Subheadline',
      })
    }

    // Numbered service list, columns 1–5
    const listY = Math.max(kickY + u * 46, safe.y + safe.h * 0.56)
    if (points.length && spec.layout.showPoints) {
      const rowH = u * 40
      points.slice(0, 4).forEach((point, i) => {
        const y = listY + i * rowH
        strokeLine(ctx, colX(0), y, colX(0) + spanW(landscape ? 4 : 5), y, alpha(palette.ink, 0.2), Math.max(0.6, u * 0.7))
        f.label(String(i + 1).padStart(2, '0'), colX(0), y + u * 25, u * 10, {
          color: accent,
          tracking: 0.12,
          weight: 700,
          w: colW,
        })
        f.text({
          text: point,
          x: colX(0) + u * 32,
          y: y + u * 10,
          w: spanW(landscape ? 4 : 5) - u * 40,
          size: u * 13,
          maxLines: 1,
          role: 'body',
          color: alpha(palette.ink, 0.8),
          id: `point-${i}`,
          label: `Point ${i + 1}`,
        })
      })
    }

    // Body column 6–8
    if (c.body.trim()) {
      f.text({
        text: c.body,
        x: colX(landscape ? 5 : 6),
        y: listY,
        w: spanW(2),
        size: u * 12.5,
        maxLines: 8,
        role: 'body',
        lineHeight: 1.6,
        color: alpha(palette.ink, 0.6),
        id: 'body',
        label: 'Body copy',
      })
    }

    // CTA bottom left with rule
    const ctaY = safe.y + safe.h - u * 40
    if (c.cta.trim()) {
      ctaPill(f, c.cta, colX(0), ctaY - u * 34, {
        fill: accent,
        color: palette.mode === 'dark' ? palette.deep : palette.surface,
        size: u * 11.5,
        height: u * 38,
        padX: u * 20,
        radius: 0,
      })
    }
    f.label(c.website, colX(11), ctaY, u * 10, {
      align: 'right',
      color: alpha(palette.ink, 0.55),
      tracking: 0.12,
      w: spanW(4),
    })
    strokeLine(ctx, safe.x, ctaY + u * 16, safe.x + safe.w, ctaY + u * 16, alpha(palette.ink, 0.4), Math.max(0.8, u))

    // Corner registration marks outside the grid
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = accent
    for (const [x, y] of [
      [u * 22, u * 22],
      [W - u * 26, u * 22],
      [u * 22, H - u * 26],
      [W - u * 26, H - u * 26],
    ]) {
      ctx.fillRect(x, y, u * 4, u * 4)
    }
    ctx.restore()
    void eyebrow
  },
}
