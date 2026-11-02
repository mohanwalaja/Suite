import type {
  AnimationSpec,
  ArtSpec,
  BrandSpec,
  CategoryId,
  CompositionId,
  DesignContent,
  DesignSpec,
  FormatId,
  LayoutSpec,
  TypographySpec,
} from './types'
import { CATEGORIES, getCategory } from './categories'
import { FORMAT_BY_ID, aspectClass } from './formats'
import { PALETTES, getPalette } from './palettes'
import { MOTIFS } from './artwork'
import { getComposition } from './compositions'
import { selectComposition, selectFrom } from './selection'

export function newId(prefix = 'dsg'): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  const uuid = g.crypto?.randomUUID?.()
  if (uuid) return `${prefix}_${uuid.slice(0, 8)}`
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export const DEFAULT_BRAND: BrandSpec = {
  name: 'ASTRO SIVAM',
  tagline: 'Vedic Astrology',
  logoDataUrl: null,
  logoSize: 1,
  logoPosition: 'auto',
  showLogo: true,
  accent: '#D9B673',
  cta: 'Order a report',
  contact: '',
  website: 'astrosivam.com',
  footer: 'PDF report by email · 7-day astrologer chat',
}

export const DEFAULT_TYPOGRAPHY: TypographySpec = {
  displayFont: 'Playfair Display',
  bodyFont: 'Inter',
  headlineWeight: 500,
  headlineScale: 1,
  tracking: 0,
  lineHeight: 1.06,
  align: 'left',
  uppercaseHeadline: false,
  italicHeadline: false,
}

export const DEFAULT_LAYOUT: LayoutSpec = {
  margin: 1,
  density: 0.55,
  focalX: 0.5,
  focalY: 0.42,
  artScale: 1,
  grain: 0.4,
  frame: false,
  cornerRadius: 0,
  showPoints: true,
  showArtwork: true,
}

export const DEFAULT_ART: ArtSpec = {
  mode: 'motif',
  motifId: 'mandala-lotus',
  uploadDataUrl: null,
  providerImageDataUrl: null,
  uploadFit: 'cover',
  uploadOpacity: 1,
  providerPrompt: '',
  offsetX: 0,
  offsetY: 0,
}

export const DEFAULT_OVERRIDES = {
  background: null,
  ink: null,
  accent: null,
} as const

export const DEFAULT_ANIMATION: AnimationSpec = {
  enabled: true,
  duration: 6,
  easing: 'smooth',
  textReveal: true,
  particles: true,
  parallax: true,
  lightSweep: true,
  grainMotion: true,
  sceneTransition: 'fade',
  fps: 30,
  loop: true,
}

/** Typography recommendations per composition family. */
export function typographyForComposition(
  compositionId: CompositionId,
  base: TypographySpec,
  categoryId?: CategoryId,
): TypographySpec {
  const devotional = categoryId ? getCategory(categoryId).group === 'devotional' : false
  const preset: Partial<TypographySpec> = (() => {
    switch (compositionId) {
      case 'editorial-type':
        return { displayFont: 'Playfair Display', headlineWeight: 500, tracking: -0.015, lineHeight: 0.98, align: 'left' }
      case 'swiss-grid':
        return { displayFont: 'Montserrat', headlineWeight: 700, tracking: -0.03, lineHeight: 0.98, align: 'left' }
      case 'bold-campaign':
        return { displayFont: 'Montserrat', headlineWeight: 800, tracking: -0.02, lineHeight: 0.94, uppercaseHeadline: true, align: 'left' }
      case 'minimal-luxury':
        return { displayFont: 'Cormorant Garamond', headlineWeight: 400, tracking: 0.03, lineHeight: 1.18, align: 'center' }
      case 'cinematic-devotional':
        return { displayFont: devotional ? 'Cinzel' : 'Cormorant Garamond', headlineWeight: 600, tracking: 0.06, lineHeight: 1.12, uppercaseHeadline: true, align: 'center' }
      case 'decorative-frame':
        return { displayFont: 'Cormorant Garamond', headlineWeight: 500, tracking: 0.04, lineHeight: 1.14, align: 'center' }
      case 'circular-mandala':
        return { displayFont: 'Cormorant Garamond', headlineWeight: 500, tracking: 0.01, lineHeight: 1.08, align: 'center' }
      case 'asymmetric-luxury':
        return { displayFont: 'Playfair Display', headlineWeight: 400, tracking: 0.005, lineHeight: 1.1, align: 'left' }
      case 'cosmic-astrology':
        return { displayFont: 'Cormorant Garamond', headlineWeight: 500, tracking: 0.01, lineHeight: 1.1, align: 'left' }
      case 'premium-infographic':
        return { displayFont: 'Space Grotesk', headlineWeight: 600, tracking: -0.01, lineHeight: 1.04, align: 'left' }
      case 'layered-collage':
        return { displayFont: 'Playfair Display', headlineWeight: 600, tracking: 0, lineHeight: 1.05, align: 'left' }
      case 'diagonal-geometric':
        return { displayFont: 'Space Grotesk', headlineWeight: 700, tracking: -0.02, lineHeight: 0.98, align: 'left' }
      case 'split-panel':
        return { displayFont: 'Montserrat', headlineWeight: 600, tracking: -0.01, lineHeight: 1.02, align: 'left' }
      case 'illustrated-story':
        return { displayFont: devotional ? 'Cinzel' : 'Playfair Display', headlineWeight: 600, tracking: 0.01, lineHeight: 1.04, align: 'left' }
      case 'hero-illustration':
      default:
        return { displayFont: devotional ? 'Cinzel' : 'Playfair Display', headlineWeight: devotional ? 600 : 500, tracking: 0.01, lineHeight: 1.05, align: 'left' }
    }
  })()
  return {
    ...base,
    ...preset,
    bodyFont: base.bodyFont || 'Inter',
    uppercaseHeadline: preset.uppercaseHeadline ?? false,
  }
}

export function paletteForCategory(categoryId: CategoryId, seed = 0): string {
  const cat = getCategory(categoryId)
  return selectFrom(cat.palettes, seed)
}

export function motifForCategory(categoryId: CategoryId, seed = 0): string {
  const cat = getCategory(categoryId)
  return selectFrom(cat.motifs, seed)
}

export interface CreateDesignOptions {
  categoryId?: CategoryId
  formatId?: FormatId
  compositionId?: CompositionId
  paletteId?: string
  motifId?: string
  variant?: number
  seed?: number
  recent?: CompositionId[]
  name?: string
  content?: Partial<DesignContent>
  width?: number
  height?: number
}

/** Build a complete, renderable design from a category + format. */
export function createDesign(options: CreateDesignOptions = {}): DesignSpec {
  const seed = options.seed ?? Math.floor(Math.random() * 100000)
  const category = getCategory(options.categoryId ?? 'astrology-services')
  const formatId = options.formatId ?? category.defaultFormat
  const format = FORMAT_BY_ID[formatId] ?? FORMAT_BY_ID['ig-portrait']
  const variant = options.variant ?? 0
  const paletteId = options.paletteId ?? paletteForCategory(category.id, seed + variant)
  const palette = getPalette(paletteId)
  const aspect = aspectClass(format.width, format.height)

  const content: DesignContent = {
    ...category.defaultContent,
    ...options.content,
  }
  if (!content.website) content.website = 'astrosivam.com'
  if (!content.contact) content.contact = ''

  if (variant === 1) {
    // Keep one point: an empty list leaves the editorial compositions with a
    // dead band they cannot fill from other content.
    content.points = content.points.slice(0, 2)
    content.body = truncateSentences(content.body, 1)
  } else if (variant === 2) {
    content.points = content.points.slice(0, 2)
    content.body = truncateSentences(content.body, 2)
  }

  const compositionId =
    options.compositionId ??
    selectComposition({
      categoryId: category.id,
      aspect,
      seed,
      exclude: options.recent,
      content,
      mood: palette.mode === 'light' ? 'editorial' : 'luxury',
    })

  const composition = getComposition(compositionId)
  const motifId = options.motifId ?? selectFrom(composition.meta.motifs.length ? composition.meta.motifs : category.motifs, seed)

  const typography = typographyForComposition(compositionId, DEFAULT_TYPOGRAPHY, category.id)

  return {
    id: newId(),
    name: options.name ?? `${category.name} · ${composition.meta.name}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    formatId: format.id,
    width: options.width ?? format.width,
    height: options.height ?? format.height,
    categoryId: category.id,
    compositionId,
    paletteId,
    content,
    typography: {
      ...typography,
      bodyFont: palette.mode === 'light' ? 'Inter' : typography.bodyFont,
    },
    layout: { ...DEFAULT_LAYOUT },
    brand: { ...DEFAULT_BRAND, accent: palette.accent },
    art: { ...DEFAULT_ART, motifId },
    animation: { ...DEFAULT_ANIMATION },
    overrides: { ...DEFAULT_OVERRIDES },
  }
}

function truncateSentences(text: string, count: number): string {
  const parts = text.split(/(?<=\.)\s+/).filter(Boolean)
  return parts.slice(0, count).join(' ').trim()
}

/**
 * Regenerate is a structural change, not a colour swap: choose a different
 * composition (never the current one or the last two), then pull a matching
 * palette and motif, and reset type to the new composition's direction.
 */
export function regenerateDesign(
  design: DesignSpec,
  opts: { recent?: CompositionId[]; keepPalette?: boolean; keepFonts?: boolean } = {},
): DesignSpec {
  const seed = Math.floor(Math.random() * 100000)
  const exclude = [design.compositionId, ...(opts.recent ?? []).filter((id) => id !== design.compositionId)].slice(0, 3)
  const compositionId = selectComposition({
    categoryId: design.categoryId,
    aspect: aspectClass(design.width, design.height),
    seed,
    exclude,
    content: design.content,
  })
  const composition = getComposition(compositionId)
  const paletteId = opts.keepPalette ? design.paletteId : selectFrom(getCategory(design.categoryId).palettes, seed + 3, [design.paletteId])
  const motifId = selectFrom(
    composition.meta.motifs.length ? composition.meta.motifs : getCategory(design.categoryId).motifs,
    seed + 7,
    [design.art.motifId],
  )
  const typography = opts.keepFonts
    ? design.typography
    : typographyForComposition(compositionId, design.typography, design.categoryId)

  // Keep content and animation settings; only the visual system changes.
  return {
    ...design,
    compositionId,
    paletteId,
    art: { ...design.art, mode: design.art.mode === 'upload' ? 'upload' : 'motif', motifId },
    typography,
    updatedAt: Date.now(),
    name: design.name,
  }
}

/** Change canvas size without touching content. Layout re-flows: every
 *  composition reads the live safe rect instead of scaling a fixed image. */
export function withFormat(design: DesignSpec, formatId: FormatId, size?: { width: number; height: number }): DesignSpec {
  const format = FORMAT_BY_ID[formatId] ?? FORMAT_BY_ID['ig-portrait']
  const width = formatId === 'custom' && size ? Math.round(size.width) : format.width
  const height = formatId === 'custom' && size ? Math.round(size.height) : format.height
  return { ...design, formatId, width, height, updatedAt: Date.now() }
}

/** Rotate through palettes without touching layout. */
export function nextPalette(paletteId: string, direction = 1): string {
  const idx = PALETTES.findIndex((p) => p.id === paletteId)
  return PALETTES[(idx + direction + PALETTES.length) % PALETTES.length].id
}

export function nextMotif(motifId: string, direction = 1): string {
  const idx = MOTIFS.findIndex((m) => m.id === motifId)
  return MOTIFS[(idx + direction + MOTIFS.length) % MOTIFS.length].id
}

/** All category × composition starter options for the "new poster" flow. */
export function categoryStarters() {
  return CATEGORIES.map((category) => ({
    category,
    starters: category.compositions.map((compositionId) => ({
      compositionId,
      paletteId: paletteForCategory(category.id, 1),
      motifId: getComposition(compositionId).meta.motifs[0] ?? category.motifs[0],
    })),
  }))
}
