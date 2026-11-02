/**
 * Engine test suite. Runs headlessly against the same renderer the browser uses.
 *
 *   npm test
 *
 * Covers: composition registry, category wiring, selection variety, consecutive
 * regeneration, all aspect classes, motif rendering, typography limits, palette
 * contrast, text-overflow detection and exact export dimensions.
 */
import { createCanvas, type Canvas } from '@napi-rs/canvas'
import { registerFonts } from './lib/fonts-node.mts'
import { renderToCanvas } from '../src/engine/renderer.ts'
import { createDesign, regenerateDesign, withFormat } from '../src/engine/presets.ts'
import { COMPOSITIONS, getComposition } from '../src/engine/compositions/index.ts'
import { CATEGORIES, getCategory } from '../src/engine/categories.ts'
import { MOTIFS, drawMotif } from '../src/engine/artwork/index.ts'
import { PALETTES, getPalette } from '../src/engine/palettes.ts'
import { FORMATS } from '../src/engine/formats.ts'
import { contrastRatio } from '../src/engine/color.ts'
import { selectComposition } from '../src/engine/selection.ts'
import { FONT_FAMILIES } from '../src/engine/fonts.ts'
import type { CategoryId, CompositionId, FormatId } from '../src/engine/types.ts'
import type { AspectClass } from '../src/engine/formats.ts'

let passed = 0
let failed = 0
const failures: string[] = []

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    failures.push(name + (detail ? ` — ${detail}` : ''))
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(title: string) {
  console.log(`\n${title}`)
}

function render(spec: Parameters<typeof renderToCanvas>[1], scale = 0.5) {
  return renderToCanvas(createCanvas as never, spec, {
    width: Math.round(spec.width * scale),
    height: Math.round(spec.height * scale),
    static: true,
  })
}

const ASPECT_FORMAT: Record<AspectClass, FormatId> = {
  portrait: 'ig-portrait',
  square: 'square',
  story: 'story',
  landscape: 'fb-landscape',
}

const ALL_ASPECTS: AspectClass[] = ['portrait', 'square', 'story', 'landscape']

async function main() {
  const faces = await registerFonts()
  console.log(`Font faces registered: ${faces}`)

  section('Registry')
  check('15 compositions are registered', COMPOSITIONS.length === 15, `found ${COMPOSITIONS.length}`)
  check(
    'composition ids are unique',
    new Set(COMPOSITIONS.map((c) => c.meta.id)).size === COMPOSITIONS.length,
  )
  check(
    'composition indexes are 1…15 in order',
    COMPOSITIONS.every((c, i) => c.meta.index === i + 1),
  )
  check('12 categories exist', CATEGORIES.length === 12, `found ${CATEGORIES.length}`)
  check('7 font families are bundled', FONT_FAMILIES.length === 7, `found ${FONT_FAMILIES.length}`)
  check('at least 14 palettes exist', PALETTES.length >= 14, `found ${PALETTES.length}`)
  check('at least 20 motifs exist', MOTIFS.length >= 20, `found ${MOTIFS.length}`)

  section('Category wiring')
  for (const category of CATEGORIES) {
    const design = createDesign({ categoryId: category.id, seed: 21 })
    const composition = getComposition(design.compositionId)
    const inAllowed = category.compositions.includes(design.compositionId)
    const okMotif = category.motifs.includes(design.art.motifId) || composition.meta.motifs.includes(design.art.motifId)
    check(
      `${category.name}: ${design.compositionId} + ${design.art.motifId}`,
      inAllowed && okMotif,
      inAllowed ? `motif ${design.art.motifId} not in category/composition lists` : `${design.compositionId} not allowed`,
    )
  }

  section('Selection variety (60 seeds per category)')
  let repeats = 0
  let allowedViolations = 0
  const used = new Set<CompositionId>()
  for (const category of CATEGORIES) {
    let previous: CompositionId | null = null
    for (let seed = 0; seed < 60; seed++) {
      const id = selectComposition({
        categoryId: category.id,
        aspect: (['portrait', 'square', 'story', 'landscape'] as AspectClass[])[seed % 4],
        seed: seed * 17 + category.id.length,
        content: category.defaultContent,
        exclude: previous ? [previous] : [],
      })
      used.add(id)
      if (previous && id === previous) repeats++
      if (!getCategory(category.id).compositions.includes(id)) allowedViolations++
      previous = id
    }
  }
  check('no composition immediately repeats', repeats === 0, `${repeats} repeats`)
  check('selection stays inside the category shortlist', allowedViolations === 0, `${allowedViolations} violations`)
  check('selection uses at least 12 distinct systems across seeds', used.size >= 12, `used ${used.size}`)

  section('Regeneration')
  for (const category of CATEGORIES) {
    let design = createDesign({ categoryId: category.id, seed: 5 })
    const seen: CompositionId[] = [design.compositionId]
    let bad = 0
    for (let i = 0; i < 8; i++) {
      const previous = design.compositionId
      design = regenerateDesign(design, { recent: seen.slice(0, 3) })
      if (design.compositionId === previous) bad++
      seen.unshift(design.compositionId)
    }
    check(`${category.name}: 8 regenerations never repeat the previous layout`, bad === 0, `${bad} repeats`)
    check(`${category.name}: regenerations stay in the category shortlist`, seen.every((id) => category.compositions.includes(id)))
  }

  section('Rendering all 15 compositions in all 4 aspects')
  for (const composition of COMPOSITIONS) {
    for (const aspect of ALL_ASPECTS) {
      const category = CATEGORIES.find((c) => c.compositions.includes(composition.meta.id)) ?? CATEGORIES[0]
      const design = createDesign({
        categoryId: category.id,
        compositionId: composition.meta.id,
        formatId: ASPECT_FORMAT[aspect],
        seed: 300 + composition.meta.index,
      })
      const { canvas, report } = render(design, 0.45)
      const errors = report.issues.filter((i) => i.severity === 'error')
      const c = canvas as unknown as Canvas
      check(
        `${composition.meta.id} · ${aspect} · ${c.width}×${c.height}`,
        errors.length === 0 && report.blocks.length > 0,
        errors.map((e) => e.message).join('; ') || 'no text blocks measured',
      )
    }
  }

  section('Motif rendering')
  for (const motif of MOTIFS) {
    const design = createDesign({ categoryId: 'festival', seed: 2 })
    design.art.motifId = motif.id
    design.compositionId = 'hero-illustration'
    let error: string | null = null
    try {
      const { report } = render(design, 0.32)
      if (report.issues.some((i) => i.severity === 'error')) error = 'layout error'
    } catch (err) {
      error = err instanceof Error ? err.message : 'threw'
    }
    check(`motif ${motif.id}`, error === null, error ?? undefined)
  }

  section('Palette contrast')
  for (const palette of PALETTES) {
    const ratio = contrastRatio(palette.ink, palette.bg)
    check(`${palette.name}: ${ratio.toFixed(2)}:1`, ratio >= 3, 'below 3:1')
  }

  section('Text measurement')
  {
    const design = createDesign({ categoryId: 'birth-jathagam', compositionId: 'editorial-type', seed: 9 })
    const longHeadline = (
      'A very long headline that has been deliberately written to exceed every reasonable display box in this composition. ' +
      'It keeps going with more clauses, more detail and more words than any poster should ever carry, because the engine must ' +
      'report the overflow rather than quietly cutting the sentence in half and pretending the layout succeeded. ' +
      'The report should flag this block before anyone exports it to a client.'
    )
    design.content.headline = longHeadline
    const { report } = render(design, 0.5)
    check(
      'oversized headline is reported instead of silently clipped',
      report.issues.some((i) => i.kind === 'overflow' || i.kind === 'clipped'),
      `issues: ${report.issues.map((i) => i.kind).join(', ') || 'none'}`,
    )
  }
  {
    const design = createDesign({ categoryId: 'ganesha', seed: 4 })
    design.content.headline = ''
    const { report } = render(design, 0.5)
    check('empty headline is reported', report.issues.some((i) => i.kind === 'empty'))
  }

  section('Formats & dimensions')
  for (const format of FORMATS.filter((f) => f.id !== 'custom')) {
    const base = createDesign({ categoryId: 'murugan', seed: 8 })
    const design = withFormat(base, format.id)
    const { canvas } = renderToCanvas(createCanvas as never, design, {
      width: design.width,
      height: design.height,
      static: true,
    })
    const c = canvas as unknown as Canvas
    check(
      `${format.label} exports ${format.width}×${format.height}`,
      c.width === format.width && c.height === format.height,
      `${c.width}×${c.height}`,
    )
  }
  {
    const base = createDesign({ categoryId: 'shiva', seed: 3, formatId: 'ig-portrait' })
    const square = withFormat(base, 'square')
    check('format switch updates stored dimensions', square.width === 1080 && square.height === 1080)
    check('format switch keeps content intact', square.content.headline === base.content.headline)
    const { canvas } = renderToCanvas(createCanvas as never, square, { width: 1080, height: 1080, static: true })
    const c = canvas as unknown as Canvas
    const ctx = c.getContext('2d')
    const data = ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data
    check('rendered canvas contains pixels (not blank)', data[0] + data[1] + data[2] > 0 || data[3] > 0)
  }

  section('Standalone motif draw (no composition)')
  {
    const canvas = createCanvas(400, 400)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#101018'
    ctx.fillRect(0, 0, 400, 400)
    let thrown: string | null = null
    try {
      drawMotif(
        {
          ctx: ctx as never,
          rect: { x: 20, y: 20, w: 360, h: 360 },
          palette: getPalette('midnight-gold'),
          u: 400 / 1080,
          seed: 4,
          time: 0,
          detail: 0.8,
        },
        'zodiac-wheel',
      )
    } catch (err) {
      thrown = err instanceof Error ? err.message : 'threw'
    }
    check('drawMotif runs without a composition frame', thrown === null, thrown ?? undefined)
  }

  section('Performance sanity')
  {
    const design = createDesign({ categoryId: 'festival', compositionId: 'layered-collage', seed: 44 })
    const started = Date.now()
    for (let i = 0; i < 6; i++) render(design, 0.5)
    const ms = (Date.now() - started) / 6
    check(`average full render at 540px: ${ms.toFixed(0)}ms`, ms < 900, 'render is slower than 900ms at half size')
  }

  console.log('\n' + '─'.repeat(64))
  console.log(`${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('\nFailures:')
    for (const failure of failures) console.log(`  • ${failure}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

export type { CategoryId }
