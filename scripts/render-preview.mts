/**
 * Developer preview: renders one poster per composition at preview scale and
 * assembles them into a contact sheet. The shipping sample suite is generated
 * by scripts/render-samples.mts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createCanvas, type Canvas } from '@napi-rs/canvas'
import { registerFonts } from './lib/fonts-node.mts'
import { renderToCanvas } from '../src/engine/renderer.ts'
import { createDesign } from '../src/engine/presets.ts'
import { COMPOSITIONS } from '../src/engine/compositions/index.ts'
import { getPalette } from '../src/engine/palettes.ts'
import type { CategoryId, CompositionId, FormatId } from '../src/engine/types.ts'

const outDir = process.argv[2] ?? '/tmp/astro-preview'
fs.mkdirSync(outDir, { recursive: true })

const categoryByComposition: Record<CompositionId, CategoryId> = {
  'hero-illustration': 'murugan',
  'editorial-type': 'birth-jathagam',
  'asymmetric-luxury': 'astrology-services',
  'circular-mandala': 'ganesha',
  'diagonal-geometric': 'durga',
  'cosmic-astrology': 'navagraha',
  'split-panel': 'temple-event',
  'illustrated-story': 'festival',
  'minimal-luxury': 'baby-naming',
  'premium-infographic': 'subha-muhurtham',
  'layered-collage': 'festival',
  'cinematic-devotional': 'shiva',
  'swiss-grid': 'temple-event',
  'decorative-frame': 'wedding-matching',
  'bold-campaign': 'astrology-services',
}

const formatByIndex: FormatId[] = ['ig-portrait', 'ig-portrait', 'ig-portrait', 'square', 'ig-portrait', 'ig-portrait', 'ig-portrait', 'ig-portrait', 'square', 'ig-portrait', 'ig-portrait', 'story', 'ig-portrait', 'ig-portrait', 'ig-portrait']

async function main() {
  const fonts = await registerFonts()
  console.log(`registered ${fonts} font faces`)

  const thumbW = 360
  const thumbH = 450
  const cols = 5
  const pad = 22
  const sheet = createCanvas(cols * (thumbW + pad) + pad, Math.ceil(COMPOSITIONS.length / cols) * (thumbH + pad + 26) + pad)
  const sctx = sheet.getContext('2d') as unknown as CanvasRenderingContext2D
  sctx.fillStyle = '#111116'
  sctx.fillRect(0, 0, sheet.width, sheet.height)

  for (const [i, comp] of COMPOSITIONS.entries()) {
    const category = categoryByComposition[comp.meta.id]
    const formatId = formatByIndex[i] ?? 'ig-portrait'
    const spec = createDesign({
      categoryId: category,
      compositionId: comp.meta.id,
      formatId,
      seed: 400 + i * 13,
      variant: i % 3,
    })
    const palette = getPalette(spec.paletteId)
    const { canvas, report } = renderToCanvas(createCanvas as never, spec, {
      width: spec.width,
      height: spec.height,
      static: true,
    })
    const c = canvas as unknown as Canvas
    const file = path.join(outDir, `${String(i + 1).padStart(2, '0')}-${comp.meta.id}-${palette.id}.png`)
    fs.writeFileSync(file, c.toBuffer('image/png'))
    console.log(`${String(i + 1).padStart(2, '0')} ${comp.meta.id.padEnd(24)} ${palette.id.padEnd(18)} ${spec.width}x${spec.height}  issues=${report.issues.length}`)
    for (const issue of report.issues) console.log(`     ${issue.severity}: ${issue.message}`)

    const x = pad + (i % cols) * (thumbW + pad)
    const y = pad + Math.floor(i / cols) * (thumbH + pad + 26)
    const s = Math.min(thumbW / spec.width, thumbH / spec.height)
    const w = spec.width * s
    const h = spec.height * s
    sctx.drawImage(c as never, x + (thumbW - w) / 2, y + (thumbH - h) / 2, w, h)
    sctx.fillStyle = '#A9A49A'
    sctx.font = '500 15px Inter'
    sctx.fillText(`${comp.meta.index}. ${comp.meta.name}`, x, y + thumbH + 20)
  }

  fs.writeFileSync(path.join(outDir, 'contact-sheet.png'), sheet.toBuffer('image/png'))
  console.log('contact sheet →', path.join(outDir, 'contact-sheet.png'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
