/**
 * Font registry. The same family names are registered in the browser (via
 * @fontsource CSS in src/lib/fonts.ts) and in Node (via the sample renderer),
 * so canvas measurements match between preview, export and generated samples.
 */

export interface FontFamily {
  id: string
  label: string
  stack: string
  role: 'display' | 'body' | 'both'
  weights: number[]
  note: string
}

export const FONT_FAMILIES: FontFamily[] = [
  {
    id: 'Playfair Display',
    label: 'Playfair Display',
    stack: '"Playfair Display", "Times New Roman", Georgia, serif',
    role: 'display',
    weights: [400, 500, 600, 700, 800, 900],
    note: 'High-contrast editorial serif. Strong at large sizes.',
  },
  {
    id: 'Cormorant Garamond',
    label: 'Cormorant Garamond',
    stack: '"Cormorant Garamond", Garamond, Georgia, serif',
    role: 'both',
    weights: [300, 400, 500, 600, 700],
    note: 'Refined old-style serif for quiet luxury compositions.',
  },
  {
    id: 'Cinzel',
    label: 'Cinzel',
    stack: '"Cinzel", "Trajan Pro", Georgia, serif',
    role: 'display',
    weights: [400, 500, 600, 700, 800, 900],
    note: 'Roman inscription capitals. Best for devotional titles.',
  },
  {
    id: 'Marcellus',
    label: 'Marcellus',
    stack: '"Marcellus", Georgia, serif',
    role: 'display',
    weights: [400],
    note: 'Calm classical capitals. Single weight (400).',
  },
  {
    id: 'Montserrat',
    label: 'Montserrat',
    stack: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
    role: 'both',
    weights: [300, 400, 500, 600, 700, 800, 900],
    note: 'Geometric sans. Campaign headlines and labels.',
  },
  {
    id: 'Space Grotesk',
    label: 'Space Grotesk',
    stack: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    role: 'both',
    weights: [300, 400, 500, 600, 700],
    note: 'Technical modern sans with character.',
  },
  {
    id: 'Inter',
    label: 'Inter',
    stack: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    role: 'both',
    weights: [300, 400, 500, 600, 700, 800, 900],
    note: 'Neutral interface and body sans.',
  },
]

export const FONT_BY_ID: Record<string, FontFamily> = Object.fromEntries(
  FONT_FAMILIES.map((f) => [f.id, f]),
)

export function fontStack(id: string, fallbackRole: 'display' | 'body' = 'display'): string {
  return FONT_BY_ID[id]?.stack ?? FONT_FAMILIES.find((f) => f.role === fallbackRole)!.stack
}

export function supportedWeights(id: string): number[] {
  return FONT_BY_ID[id]?.weights ?? [400, 700]
}

export function nearestWeight(id: string, weight: number): number {
  const ws = supportedWeights(id)
  return ws.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), ws[0])
}

export const DISPLAY_FONTS = FONT_FAMILIES.filter((f) => f.role !== 'body')
export const BODY_FONTS = FONT_FAMILIES.filter((f) => f.role !== 'display')
