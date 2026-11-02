/**
 * Core data model for Astrosivam Creative Studio.
 *
 * Everything the renderer needs is expressed as plain data (DesignSpec) so a
 * design can be serialised, versioned, saved to local storage or a MySQL row,
 * and re-rendered deterministically on any device.
 */

export type CategoryGroup = 'astrology' | 'devotional'

export type CategoryId =
  | 'birth-jathagam'
  | 'wedding-matching'
  | 'baby-naming'
  | 'subha-muhurtham'
  | 'navagraha'
  | 'astrology-services'
  | 'murugan'
  | 'shiva'
  | 'ganesha'
  | 'durga'
  | 'festival'
  | 'temple-event'

export type CompositionId =
  | 'hero-illustration'
  | 'editorial-type'
  | 'asymmetric-luxury'
  | 'circular-mandala'
  | 'diagonal-geometric'
  | 'cosmic-astrology'
  | 'split-panel'
  | 'illustrated-story'
  | 'minimal-luxury'
  | 'premium-infographic'
  | 'layered-collage'
  | 'cinematic-devotional'
  | 'swiss-grid'
  | 'decorative-frame'
  | 'bold-campaign'

export type FormatId =
  | 'ig-portrait'
  | 'square'
  | 'story'
  | 'fb-portrait'
  | 'fb-square'
  | 'fb-landscape'
  | 'custom'

export interface DesignFormat {
  id: FormatId
  label: string
  short: string
  width: number
  height: number
  usage: string
}

export interface Palette {
  id: string
  name: string
  mood: string
  mode: 'dark' | 'light'
  bg: string
  deep: string
  surface: string
  ink: string
  inkSoft: string
  accent: string
  accentAlt: string
  line: string
  tags: string[]
}

export interface BrandSpec {
  name: string
  tagline: string
  logoDataUrl: string | null
  logoSize: number
  logoPosition: 'auto' | 'tl' | 'tr' | 'bl' | 'br' | 'center'
  showLogo: boolean
  accent: string
  cta: string
  contact: string
  website: string
  footer: string
}

export interface DesignContent {
  eyebrow: string
  headline: string
  subheadline: string
  body: string
  points: string[]
  cta: string
  contact: string
  website: string
  footer: string
}

export interface TypographySpec {
  displayFont: string
  bodyFont: string
  headlineWeight: number
  headlineScale: number
  tracking: number
  lineHeight: number
  align: 'left' | 'center' | 'right'
  uppercaseHeadline: boolean
  italicHeadline: boolean
}

export interface LayoutSpec {
  margin: number
  density: number
  focalX: number
  focalY: number
  artScale: number
  grain: number
  frame: boolean
  cornerRadius: number
  showPoints: boolean
  showArtwork: boolean
}

export interface ArtSpec {
  mode: 'motif' | 'upload' | 'provider' | 'none'
  motifId: string
  uploadDataUrl: string | null
  providerImageDataUrl: string | null
  uploadFit: 'cover' | 'contain'
  uploadOpacity: number
  providerPrompt: string
  /** Manual nudge of uploaded/generated artwork, -1..1 of the crop overflow. */
  offsetX: number
  offsetY: number
}

export interface AnimationSpec {
  enabled: boolean
  duration: number
  easing: 'smooth' | 'snappy' | 'cinematic'
  textReveal: boolean
  particles: boolean
  parallax: boolean
  lightSweep: boolean
  grainMotion: boolean
  sceneTransition: 'none' | 'wipe' | 'fade' | 'zoom'
  fps: number
  loop: boolean
}

export interface ColorOverrides {
  /** Hex colours that replace palette roles for this design only. */
  background: string | null
  ink: string | null
  accent: string | null
}

export interface DesignSpec {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  formatId: FormatId
  width: number
  height: number
  categoryId: CategoryId
  compositionId: CompositionId
  paletteId: string
  content: DesignContent
  typography: TypographySpec
  layout: LayoutSpec
  brand: BrandSpec
  art: ArtSpec
  animation: AnimationSpec
  overrides: ColorOverrides
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface TextBlockIssue {
  id: string
  label: string
  kind: 'overflow' | 'clipped' | 'safe-area' | 'small-type' | 'empty'
  message: string
  severity: 'error' | 'warning'
}

export interface RenderReport {
  compositionId: CompositionId
  paletteId: string
  motifId: string
  width: number
  height: number
  blocks: {
    id: string
    label: string
    box: Rect
    lines: number
    fontSize: number
  }[]
  issues: TextBlockIssue[]
  scannedAt: number
}

export interface CompositionMeta {
  id: CompositionId
  name: string
  family: string
  index: number
  summary: string
  /** Structural description used by the gallery + docs so users can see the
   *  difference between compositions is layout, not just colour. */
  structure: string
  focalPoint: string
  bestFor: CategoryId[]
  formats: Array<'portrait' | 'square' | 'story' | 'landscape'>
  motifs: string[]
  motion: string[]
}

export type AssetImage = CanvasImageSource & { width: number; height: number }

export interface RenderAssets {
  logo?: AssetImage | null
  artwork?: AssetImage | null
}

export interface CanvasLike {
  width: number
  height: number
  getContext(id: '2d'): CanvasRenderingContext2D | null
}

export type CanvasFactory = (width: number, height: number) => CanvasLike
