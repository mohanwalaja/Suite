/**
 * Renders the shipped sample gallery: 30 posters covering every category,
 * every composition and all four aspect classes. Output:
 *   public/samples/NN-slug.png
 *   public/samples/manifest.json  (read by the Projects page)
 *
 * The same engine used by the browser renders these files, so the gallery is an
 * honest record of what the studio produces rather than a mockup.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createCanvas, type Canvas } from '@napi-rs/canvas'
import { registerFonts } from './lib/fonts-node.mts'
import { renderToCanvas } from '../src/engine/renderer.ts'
import { createDesign } from '../src/engine/presets.ts'
import { getCategory } from '../src/engine/categories.ts'
import { getComposition } from '../src/engine/compositions/index.ts'
import { getPalette } from '../src/engine/palettes.ts'
import type { CategoryId, CompositionId, DesignContent, FormatId } from '../src/engine/types.ts'

interface SampleSpec {
  category: CategoryId
  composition: CompositionId
  format: FormatId
  variant?: number
  palette?: string
  motif?: string
  content?: Partial<DesignContent>
  title: string
}

const SAMPLES: SampleSpec[] = [
  { category: 'murugan', composition: 'hero-illustration', format: 'ig-portrait', title: 'Murugan — Vel Vel', motif: 'vel-peacock' },
  { category: 'birth-jathagam', composition: 'editorial-type', format: 'ig-portrait', title: 'Jathagam — editorial' },
  { category: 'astrology-services', composition: 'asymmetric-luxury', format: 'ig-portrait', title: 'Consultation — luxury panel' },
  { category: 'ganesha', composition: 'circular-mandala', format: 'square', title: 'Ganesha — circular mandala' },
  { category: 'durga', composition: 'diagonal-geometric', format: 'ig-portrait', title: 'Durga — diagonal field' },
  { category: 'navagraha', composition: 'cosmic-astrology', format: 'ig-portrait', title: 'Navagraha — cosmic wheel' },
  { category: 'temple-event', composition: 'split-panel', format: 'ig-portrait', title: 'Temple event — split panel' },
  { category: 'festival', composition: 'illustrated-story', format: 'ig-portrait', title: 'Festival — illustrated story' },
  { category: 'baby-naming', composition: 'minimal-luxury', format: 'square', title: 'Baby naming — minimal' },
  { category: 'subha-muhurtham', composition: 'premium-infographic', format: 'ig-portrait', title: 'Muhurtham — infographic' },
  { category: 'festival', composition: 'layered-collage', format: 'ig-portrait', title: 'Deepam — layered collage' },
  { category: 'shiva', composition: 'cinematic-devotional', format: 'story', title: 'Shiva — cinematic story' },
  { category: 'temple-event', composition: 'swiss-grid', format: 'ig-portrait', title: 'Temple — swiss grid' },
  { category: 'wedding-matching', composition: 'decorative-frame', format: 'ig-portrait', title: 'Matching — decorative frame' },
  { category: 'astrology-services', composition: 'bold-campaign', format: 'ig-portrait', title: 'Services — bold campaign' },
  { category: 'shiva', composition: 'hero-illustration', format: 'story', title: 'Shiva — hero story', motif: 'trishul-crescent' },
  { category: 'ganesha', composition: 'editorial-type', format: 'ig-portrait', title: 'Ganesha — editorial', motif: 'ganesha-motif' },
  { category: 'birth-jathagam', composition: 'cosmic-astrology', format: 'square', title: 'Jathagam — square cosmic' },
  { category: 'festival', composition: 'illustrated-story', format: 'square', title: 'Greeting — illustrated square' },
  { category: 'wedding-matching', composition: 'split-panel', format: 'fb-landscape', title: 'Matching — landscape split' },
  { category: 'astrology-services', composition: 'swiss-grid', format: 'fb-landscape', title: 'Services — landscape grid' },
  { category: 'festival', composition: 'bold-campaign', format: 'square', title: 'Festival — bold square' },
  { category: 'murugan', composition: 'cinematic-devotional', format: 'ig-portrait', title: 'Murugan — cinematic' },
  { category: 'durga', composition: 'hero-illustration', format: 'square', title: 'Durga — hero square', motif: 'durga-shakti' },
  { category: 'baby-naming', composition: 'decorative-frame', format: 'square', title: 'Naming — framed square' },
  { category: 'subha-muhurtham', composition: 'diagonal-geometric', format: 'ig-portrait', title: 'Muhurtham — diagonal' },
  { category: 'navagraha', composition: 'premium-infographic', format: 'ig-portrait', title: 'Navagraha — data layout' },
  { category: 'temple-event', composition: 'layered-collage', format: 'story', title: 'Temple — collage story' },
  { category: 'astrology-services', composition: 'minimal-luxury', format: 'ig-portrait', title: 'Reading — minimal portrait' },
  { category: 'festival', composition: 'circular-mandala', format: 'ig-portrait', title: 'Greeting — mandala portrait' },
]

const outDir = path.resolve('public/samples')

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-+$/g, '')
}

async function main() {
  const faces = await registerFonts()
  console.log(`Registered ${faces} font faces`)
  fs.mkdirSync(outDir, { recursive: true })

  const manifest: Array<{
    file: string
    title: string
    category: string
    composition: string
    palette: string
    width: number
    height: number
    issues: number
  }> = []
  const created: CompositionId[] = []
  let errorTotal = 0

  for (const [index, sample] of SAMPLES.entries()) {
    const design = createDesign({
      categoryId: sample.category,
      compositionId: sample.composition,
      formatId: sample.format,
      paletteId: sample.palette,
      motifId: sample.motif as never,
      seed: 911 + index * 37,
      variant: sample.variant ?? index % 3,
      content: sample.content,
    })
    // Use the category's own motif when the sample does not override it, unless
    // the composition defines a more specific set.
    if (!sample.motif) {
      const allowed = getComposition(design.compositionId).meta.motifs
      if (allowed.length && !allowed.includes(design.art.motifId)) {
        design.art.motifId = allowed[0]
      }
    }

    const { canvas, report } = renderToCanvas(createCanvas as never, design, {
      width: design.width,
      height: design.height,
      static: true,
    })
    const errors = report.issues.filter((i) => i.severity === 'error')
    errorTotal += errors.length
    created.push(design.compositionId)
    const file = `${String(index + 1).padStart(2, '0')}-${slug(sample.title)}.jpg`
    fs.writeFileSync(path.join(outDir, file), (canvas as unknown as Canvas).toBuffer('image/jpeg', 90))
    manifest.push({
      file,
      title: sample.title,
      category: getCategory(sample.category).name,
      composition: getComposition(design.compositionId).meta.name,
      palette: getPalette(design.paletteId).name,
      width: design.width,
      height: design.height,
      issues: report.issues.length,
    })
    const flag = errors.length ? `  ✗ ${errors.length} error(s)` : '  ✓'
    console.log(
      `${String(index + 1).padStart(2, '0')}  ${sample.title.padEnd(34)} ${design.compositionId.padEnd(22)} ${String(design.width)}×${String(design.height)}${flag}`,
    )
    for (const issue of errors) console.log(`      ${issue.message}`)
  }

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: manifest.length,
        compositions: [...new Set(created)].length,
        posters: manifest,
      },
      null,
      2,
    ),
  )

  const uniqueCompositions = new Set(created)
  console.log('')
  console.log(`Wrote ${manifest.length} posters to ${outDir}`)
  console.log(`Compositions covered: ${uniqueCompositions.size}/15`)
  console.log(`Error-level issues: ${errorTotal}`)
  if (uniqueCompositions.size < 15) {
    console.error('Expected all 15 compositions to appear in the sample set.')
    process.exitCode = 1
  }
  if (errorTotal > 0) {
    console.error('Fix the error-level layout issues above before shipping samples.')
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
