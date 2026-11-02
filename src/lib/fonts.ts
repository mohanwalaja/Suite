/**
 * Browser font loading. Fonts are bundled locally (no Google Fonts network
 * dependency), so canvas can measure and draw with the exact families used in
 * the editor UI. `ensureFontsForDesign` must resolve before exporting.
 */

import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/playfair-display/latin-400.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-800.css'
import '@fontsource/playfair-display/latin-500-italic.css'
import '@fontsource/cormorant-garamond/latin-300.css'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-700.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/cinzel/latin-400.css'
import '@fontsource/cinzel/latin-500.css'
import '@fontsource/cinzel/latin-600.css'
import '@fontsource/cinzel/latin-700.css'
import '@fontsource/cinzel/latin-800.css'
import '@fontsource/marcellus/latin-400.css'
import '@fontsource/montserrat/latin-300.css'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'
import '@fontsource/montserrat/latin-800.css'
import '@fontsource/montserrat/latin-900.css'
import '@fontsource/space-grotesk/latin-300.css'
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/space-grotesk/latin-700.css'

import type { DesignSpec } from '../engine/types'
import { nearestWeight } from '../engine/fonts'

let initialised: Promise<void> | null = null

export function fontsReady(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  if (!initialised) {
    initialised = (async () => {
      const loads: Promise<unknown>[] = []
      const families: Array<[string, number[]]> = [
        ['Inter', [300, 400, 500, 600, 700, 800]],
        ['Playfair Display', [400, 500, 600, 700, 800]],
        ['Cormorant Garamond', [300, 400, 500, 600, 700]],
        ['Cinzel', [400, 500, 600, 700, 800]],
        ['Marcellus', [400]],
        ['Montserrat', [300, 400, 500, 600, 700, 800, 900]],
        ['Space Grotesk', [300, 400, 500, 600, 700]],
      ]
      for (const [family, weights] of families) {
        for (const weight of weights) {
          loads.push(document.fonts.load(`${weight} 64px "${family}"`).catch(() => undefined))
        }
      }
      await Promise.all(loads)
      await document.fonts.ready
    })()
  }
  return initialised
}

/** Ensure the specific faces a design uses are loaded (including italics). */
export async function ensureFontsForDesign(spec: DesignSpec): Promise<void> {
  if (typeof document === 'undefined') return
  await fontsReady()
  const weights = [spec.typography.headlineWeight, 400, 500, 600, 700]
  const jobs: Promise<unknown>[] = []
  for (const family of ['Inter', spec.typography.displayFont, spec.typography.bodyFont]) {
    for (const weight of weights) {
      const w = nearestWeight(family, weight)
      jobs.push(document.fonts.load(`${w} 32px "${family}"`).catch(() => undefined))
      jobs.push(document.fonts.load(`italic ${w} 32px "${family}"`).catch(() => undefined))
    }
  }
  await Promise.all(jobs)
}
