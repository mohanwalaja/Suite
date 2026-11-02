/**
 * Registers the exact same font families used in the browser with the Node
 * canvas backend, so generated samples/tests measure text identically.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { GlobalFonts } from '@napi-rs/canvas'
import wawoff2 from 'wawoff2'
import { FONT_FAMILIES } from '../../src/engine/fonts.ts'

const require = createRequire(import.meta.url)
const CACHE = '/tmp/astrosivam-font-cache'

export async function registerFonts(root = process.cwd()): Promise<number> {
  fs.mkdirSync(CACHE, { recursive: true })
  let count = 0
  for (const family of FONT_FAMILIES) {
    const pkg = family.id.toLowerCase().replace(/\s+/g, '-')
    for (const weight of family.weights) {
      const file = `${pkg}-latin-${weight}-normal.woff2`
      const source = path.join(root, 'node_modules', '@fontsource', pkg, 'files', file)
      if (!fs.existsSync(source)) continue
      const cached = path.join(CACHE, `${pkg}-${weight}.ttf`)
      if (!fs.existsSync(cached)) {
        const woff2 = fs.readFileSync(source)
        const ttf = await wawoff2.decompress(woff2)
        fs.writeFileSync(cached, Buffer.from(ttf))
      }
      GlobalFonts.registerFromPath(cached, family.id)
      count++
    }
    // Italic cut for the display serifs (used by a few compositions).
    if (family.role !== 'body') {
      const italicFile = `${pkg}-latin-${family.weights.includes(500) ? 500 : family.weights[0]}-italic.woff2`
      const source = path.join(root, 'node_modules', '@fontsource', pkg, 'files', italicFile)
      if (fs.existsSync(source)) {
        const cached = path.join(CACHE, `${pkg}-italic.ttf`)
        if (!fs.existsSync(cached)) {
          const ttf = await wawoff2.decompress(fs.readFileSync(source))
          fs.writeFileSync(cached, Buffer.from(ttf))
        }
        GlobalFonts.registerFromPath(cached, family.id)
        count++
      }
    }
  }
  void require
  return count
}
