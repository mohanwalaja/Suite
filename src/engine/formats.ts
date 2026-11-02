import type { DesignFormat, FormatId } from './types'

/** Every supported canvas size. The renderer is resolution independent, so a
 *  custom size is simply another width/height pair. */
export const FORMATS: DesignFormat[] = [
  {
    id: 'ig-portrait',
    label: 'Instagram portrait post',
    short: '4:5',
    width: 1080,
    height: 1350,
    usage: 'Feed posts — the highest-reach Instagram format.',
  },
  {
    id: 'square',
    label: 'Square post',
    short: '1:1',
    width: 1080,
    height: 1080,
    usage: 'Instagram + Facebook feed, WhatsApp forwards.',
  },
  {
    id: 'story',
    label: 'Story / Reel cover',
    short: '9:16',
    width: 1080,
    height: 1920,
    usage: 'Stories, Reels covers, status updates.',
  },
  {
    id: 'fb-portrait',
    label: 'Facebook portrait',
    short: '4:5',
    width: 1080,
    height: 1350,
    usage: 'Facebook feed, higher vertical real estate.',
  },
  {
    id: 'fb-square',
    label: 'Facebook square',
    short: '1:1',
    width: 1080,
    height: 1080,
    usage: 'Facebook feed and page posts.',
  },
  {
    id: 'fb-landscape',
    label: 'Facebook landscape',
    short: '1.91:1',
    width: 1200,
    height: 628,
    usage: 'Link previews, page cover, event banners.',
  },
  {
    id: 'custom',
    label: 'Custom size',
    short: 'Custom',
    width: 1080,
    height: 1350,
    usage: 'Any square-pixel size between 320 and 4096.',
  },
]

export const FORMAT_BY_ID: Record<string, DesignFormat> = Object.fromEntries(
  FORMATS.map((f) => [f.id, f]),
)

export type AspectClass = 'portrait' | 'square' | 'story' | 'landscape'

export function aspectClass(width: number, height: number): AspectClass {
  const ratio = width / height
  if (ratio >= 1.35) return 'landscape'
  if (ratio > 1.06) return 'portrait'
  if (ratio >= 0.94) return 'square'
  if (ratio >= 0.68) return 'portrait'
  return 'story'
}

export function formatLabel(width: number, height: number): string {
  const g = gcd(width, height)
  return `${width / g}:${height / g}`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function resolveFormat(spec: { formatId: FormatId; width: number; height: number }): DesignFormat {
  const base = FORMAT_BY_ID[spec.formatId]
  if (!base || spec.formatId === 'custom') {
    return {
      id: 'custom',
      label: 'Custom size',
      short: formatLabel(spec.width, spec.height),
      width: spec.width,
      height: spec.height,
      usage: 'Custom pixel dimensions.',
    }
  }
  return { ...base, width: spec.width, height: spec.height }
}

export function clampDimensions(width: number, height: number) {
  const w = Math.round(Math.min(4096, Math.max(320, Number.isFinite(width) ? width : 1080)))
  const h = Math.round(Math.min(4096, Math.max(320, Number.isFinite(height) ? height : 1350)))
  return { width: w, height: h }
}
