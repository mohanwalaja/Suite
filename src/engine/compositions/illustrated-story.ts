import type { Composition } from './types'
import { alpha, mix } from '../color'
import { fillRect, strokeLine, withClip } from '../draw'
import { eyebrow, contactFooter, numberedList } from './shared'

/**
 * 08 · Illustrated storytelling
 * The page is a storyboard: an illustrated opening scene, a solid colour
 * "chapter" carrying the headline, and a closing page with body copy and
 * details. Landscape turns the same three chapters into columns.
 */
export const illustratedStory: Composition = {
  meta: {
    id: 'illustrated-story',
    name: 'Illustrated Storytelling',
    family: 'Narrative',
    index: 8,
    summary: 'Opening art scene, colour chapter with the headline, closing details page.',
    structure: 'Three chapters on one canvas. Chapter one is a full-bleed illustration with a scrim and chapter mark; chapter two is a solid colour page where the headline lives large; chapter three returns to the poster ground for body copy, a numbered details list and the CTA.',
    focalPoint: 'The colour chapter holding the headline',
    bestFor: ['festival', 'baby-naming', 'ganesha', 'murugan', 'temple-event'],
    formats: ['portrait', 'square', 'story', 'landscape'],
    motifs: ['painted-hills', 'deepam-lamp', 'kolam-grid', 'temple-gopuram', 'peacock-feather'],
    motion: ['Scene curtain reveal', 'Chapter colour wipe', 'Headline rise', 'Details stagger'],
  },
  render(f) {
    const { ctx, W, H, u, palette, safe, spec } = f
    const c = spec.content
    const landscape = f.aspect === 'landscape'
    const story = f.aspect === 'story'
    const square = f.aspect === 'square'
    const points = c.points.filter((p) => p.trim())
    const pad = u * 34

    // Chapter boxes
    const ratios = landscape ? [0.38, 0.35, 0.27] : story ? [0.4, 0.19, 0.41] : square ? [0.42, 0.23, 0.35] : [0.43, 0.21, 0.36]
    const chapters: Array<{ x: number; y: number; w: number; h: number }> = []
    if (landscape) {
      let x = 0
      ratios.forEach((r) => {
        chapters.push({ x, y: 0, w: W * r, h: H })
        x += W * r
      })
    } else {
      let y = 0
      ratios.forEach((r) => {
        chapters.push({ x: 0, y, w: W, h: H * r })
        y += H * r
      })
    }
    const [scene, chapter, closing] = chapters

    // Ground for the closing page
    fillRect(ctx, { x: 0, y: 0, w: W, h: H }, mix(palette.bg, palette.surface, 0.3))

    // ── Chapter one: illustration ───────────────────────────────────────────
    f.revealDraw(0.03, 0.7, () => {
      withClip(ctx, scene, () => {
        fillRect(ctx, scene, mix(palette.deep, palette.bg, 0.35))
        f.art(
          {
            x: scene.x - scene.w * 0.08,
            y: scene.y - scene.h * 0.08,
            w: scene.w * 1.16,
            h: scene.h * 1.16,
          },
          { opacity: 1 },
        )
        const scrim = ctx.createLinearGradient(0, scene.y, 0, scene.y + scene.h)
        scrim.addColorStop(0, alpha(palette.deep, 0.55))
        scrim.addColorStop(0.35, alpha(palette.deep, 0))
        scrim.addColorStop(0.78, alpha(palette.deep, 0.55))
        scrim.addColorStop(1, alpha(palette.bg, 0.95))
        ctx.fillStyle = scrim
        ctx.fillRect(scene.x, scene.y, scene.w, scene.h)
      })
    })

    const onScene = palette.mode === 'dark' ? palette.ink : mix(palette.ink, palette.deep, 0.2)
    if (landscape) {
      f.logo({ x: safe.x, y: scene.y + safe.y, size: u * 24, showName: true, nameSize: u * 20, color: onScene })
    } else {
      f.logo({ x: safe.x, y: scene.y + safe.y, size: u * 24, showName: true, nameSize: u * 20, color: onScene })
    }
    const sceneLabel = f.brand.tagline || c.website
    f.label(sceneLabel, landscape ? scene.x + scene.w - pad : safe.x + safe.w, scene.y + safe.y + u * 30, u * 11.5, {
      align: 'right',
      color: alpha(onScene, 0.8),
      tracking: 0.24,
      w: Math.min(safe.w * 0.5, u * 520),
    })

    // Chapter marks
    const mark = (index: number, box: { x: number; y: number; w: number; h: number }, color: string, alignRight = true) => {
      f.label(String(index).padStart(2, '0'), alignRight ? box.x + box.w - u * 30 : box.x + u * 30, box.y + box.h - u * 26, u * 13, {
        align: alignRight ? 'right' : 'left',
        color,
        tracking: 0.2,
        w: u * 60,
      })
    }
    mark(1, scene, alpha(onScene, 0.75))

    const sceneCaption = (c.subheadline || f.brand.tagline || '').toUpperCase()
    if (sceneCaption) {
      const capY = scene.y + scene.h - u * 74
      ctx.save()
      ctx.fillStyle = alpha(palette.accent, 0.9)
      ctx.fillRect(safe.x, capY - u * 14, u * 34, Math.max(1.5, u * 2))
      ctx.restore()
      f.label(sceneCaption, safe.x, capY, u * 12, {
        color: alpha(onScene, 0.85),
        tracking: 0.22,
        weight: 600,
        w: landscape ? scene.w - safe.x - u * 60 : safe.w * 0.7,
      })
    }

    // ── Chapter two: colour page + headline ─────────────────────────────────
    const chapterColor = mix(palette.deep, palette.accent, palette.mode === 'dark' ? 0.12 : 0.08)
    fillRect(ctx, chapter, chapterColor)
    ctx.save()
    ctx.globalAlpha = 0.05
    ctx.strokeStyle = palette.ink
    ctx.lineWidth = Math.max(1, u * 1.4)
    const hatchGap = u * 20
    for (let x = chapter.x - chapter.h; x < chapter.x + chapter.w; x += hatchGap) {
      ctx.beginPath()
      ctx.moveTo(x, chapter.y + chapter.h)
      ctx.lineTo(x + chapter.h, chapter.y)
      ctx.stroke()
    }
    ctx.restore()
    strokeLine(ctx, chapter.x, chapter.y, chapter.x + chapter.w, chapter.y, alpha(palette.accent, 0.5), Math.max(0.8, u))
    strokeLine(ctx, chapter.x, chapter.y + chapter.h, chapter.x + chapter.w, chapter.y + chapter.h, alpha(palette.accent, 0.5), Math.max(0.8, u))

    const chapterInk = palette.mode === 'dark' ? palette.ink : palette.bg
    const textW = chapter.w - (landscape ? pad * 2 : safe.x * 2)
    const textX = chapter.x + (landscape ? pad : safe.x)
    const headTop = chapter.y + (landscape ? u * 48 : u * 34)

    eyebrow(f, c.eyebrow, textX, headTop, {
      size: u * 11,
      color: alpha(chapterInk, 0.8),
      rule: false,
      align: 'left',
    })

    const head = f.text({
      text: c.headline,
      x: textX,
      y: headTop + u * 28,
      w: textW,
      h: chapter.h - u * (landscape ? 120 : 104),
      size: Math.min(u * (landscape ? 46 : story ? 74 : 64), textW * 0.16),
      minSize: u * 22,
      maxLines: landscape ? 4 : 3,
      fit: true,
      role: 'display',
      weight: spec.typography.headlineWeight,
      lineHeight: 1.02,
      tracking: spec.typography.tracking,
      color: chapterInk,
      id: 'headline',
      label: 'Headline',
      required: true,
      anim: { start: 0.3, span: 0.45, distance: u * 22 },
    })
    if (c.subheadline.trim()) {
      f.text({
        text: c.subheadline,
        x: textX,
        y: head.box.y + head.box.h + u * 14,
        w: textW,
        size: u * (landscape ? 11 : 12.5),
        maxLines: 2,
        role: 'body',
        weight: 600,
        uppercase: true,
        tracking: 0.2,
        lineHeight: 1.6,
        color: alpha(chapterInk, 0.7),
        id: 'subheadline',
        label: 'Subheadline',
        anim: { start: 0.42, span: 0.35 },
      })
    }
    strokeLine(
      ctx,
      textX,
      chapter.y + chapter.h - u * 26,
      textX + Math.min(textW * 0.4, u * 320),
      chapter.y + chapter.h - u * 26,
      alpha(chapterInk, 0.3),
      Math.max(0.7, u),
    )
    mark(2, chapter, alpha(chapterInk, 0.45), !landscape)

    // ── Chapter three: details ──────────────────────────────────────────────
    const closeX = landscape ? closing.x + pad : safe.x
    const closeY = landscape ? safe.y + u * 30 : closing.y + u * 30
    const closeW = landscape ? closing.w - pad * 2 : safe.w

    eyebrow(f, 'The details', closeX, closeY, { size: u * 10.5, color: palette.accent, rule: false })

    let cursor = closeY + u * 34
    if (c.body.trim()) {
      const bodyW = landscape ? closeW : closeW * (points.length ? 0.56 : 0.64)
      const body = f.text({
        text: c.body,
        x: closeX,
        y: cursor,
        w: bodyW,
        h: closing.h - u * (landscape ? 190 : 150),
        size: u * (landscape ? 13 : story ? 16 : 15),
        minSize: u * 11,
        maxLines: landscape ? 4 : story ? 5 : 3,
        fit: true,
        role: 'body',
        lineHeight: 1.62,
        color: alpha(palette.ink, 0.72),
        id: 'body',
        label: 'Body copy',
        anim: { start: 0.48, span: 0.4 },
      })
      cursor = body.box.y + body.box.h + u * 26
    }

    if (points.length && spec.layout.showPoints) {
      const listX = landscape ? closeX : closeX + closeW * 0.62
      const listY = landscape ? closeY + u * 46 : closeY + u * 34
      const listW = landscape ? closeW : closeW * 0.38
      numberedList(f, points.slice(0, landscape ? 2 : 3), { x: listX, y: listY, w: listW, h: u * 110 }, {
        size: u * (landscape ? 11.5 : 12.5),
        gap: u * 30,
        color: alpha(palette.ink, 0.85),
        accent: palette.accent,
      })
    } else if (!landscape && !story) {
      // No service list: close the page with a small illustrated medallion so the
      // composition does not end in dead space.
      const r = u * 76
      const mx = closeX + closeW - r - u * 6
      const my = closing.y + closing.h * 0.46
      ctx.save()
      ctx.beginPath()
      ctx.arc(mx, my, r, 0, Math.PI * 2)
      ctx.clip()
      fillRect(ctx, { x: mx - r, y: my - r, w: r * 2, h: r * 2 }, mix(palette.deep, palette.bg, 0.35))
      f.art({ x: mx - r * 1.1, y: my - r * 1.1, w: r * 2.2, h: r * 2.2 }, { opacity: 1 })
      ctx.restore()
      f.ctx.save()
      f.ctx.beginPath()
      f.ctx.arc(mx, my, r, 0, Math.PI * 2)
      f.ctx.strokeStyle = alpha(palette.accent, 0.55)
      f.ctx.lineWidth = Math.max(0.8, u)
      f.ctx.stroke()
      f.ctx.restore()
    }

    if (c.cta.trim()) {
      const ctaY = closing.y + closing.h - u * (landscape ? 96 : 74)
      const style = f.style(u * 13, {
        role: 'body',
        weight: 600,
        tracking: 0.18,
        uppercase: true,
        color: palette.accent,
        align: 'left',
      })
      const ctaW = Math.min(closeW * 0.8, u * 420)
      f.label(c.cta, closeX, ctaY, u * 13, { color: palette.accent, tracking: 0.18, weight: 600, w: ctaW })
      strokeLine(ctx, closeX, ctaY - u * 20, closeX + Math.min(ctaW, u * 210), ctaY - u * 20, alpha(palette.accent, 0.45), Math.max(0.7, u))
      void style
    }

    mark(3, closing, alpha(palette.ink, 0.3), !landscape)

    contactFooter(f, landscape ? H - u * 20 : closing.y + closing.h - u * 26, {
      color: palette.ink,
      size: u * 11,
      rule: false,
      showBrand: false,
      items: [c.website, c.contact],
      x: closeX,
      w: closeW,
    })
  },
}
