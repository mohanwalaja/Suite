import type { ArtContext } from './common'
import { center } from './common'
import {
  drawArcMoon,
  drawAstrolabe,
  drawCelestialOrb,
  drawMandalaLotus,
  drawMandalaSun,
  drawNavagraha,
  drawOrbitNetwork,
  drawZodiacWheel,
} from './celestial'
import {
  drawDeepamLamp,
  drawDurgaShakti,
  drawGaneshaMotif,
  drawKolamGrid,
  drawLotusCrest,
  drawPeacockFeather,
  drawTempleArch,
  drawTempleGopuram,
  drawTrishulCrescent,
  drawVelPeacock,
} from './devotional'
import { drawGeometricStrata, drawPaintedHills, drawTopographic } from './geometric'

export type MotifFamily = 'celestial' | 'devotional' | 'botanical' | 'architectural' | 'geometric'

export interface Motif {
  id: string
  name: string
  family: MotifFamily
  description: string
  /** Visual weight when used behind text. */
  density: 'light' | 'medium' | 'rich'
  draw: (a: ArtContext) => void
}

export const MOTIFS: Motif[] = [
  {
    id: 'mandala-lotus',
    name: 'Lotus mandala',
    family: 'botanical',
    description: 'Engraved 16-petal mandala with a lotus core. Calm, symmetrical focal point.',
    density: 'rich',
    draw: drawMandalaLotus,
  },
  {
    id: 'mandala-sun',
    name: 'Sun mandala',
    family: 'celestial',
    description: 'Radiant engraved sun with 60 rays and layered discs.',
    density: 'rich',
    draw: drawMandalaSun,
  },
  {
    id: 'zodiac-wheel',
    name: 'Zodiac wheel',
    family: 'celestial',
    description: 'Twelve-sector astrological wheel with constellation marks.',
    density: 'rich',
    draw: drawZodiacWheel,
  },
  {
    id: 'navagraha',
    name: 'Navagraha orbits',
    family: 'celestial',
    description: 'Nine planetary bodies on interlocking orbital rings.',
    density: 'medium',
    draw: drawNavagraha,
  },
  {
    id: 'celestial-orb',
    name: 'Ringed planet',
    family: 'celestial',
    description: 'Painted ringed planet with atmosphere, craters and star field.',
    density: 'medium',
    draw: drawCelestialOrb,
  },
  {
    id: 'orbit-network',
    name: 'Orbit network',
    family: 'celestial',
    description: 'Constellation network with orbital arcs. Light and modern.',
    density: 'light',
    draw: drawOrbitNetwork,
  },
  {
    id: 'astrolabe',
    name: 'Astrolabe',
    family: 'celestial',
    description: 'Graduated astrolabe instrument with an offset ecliptic ring.',
    density: 'rich',
    draw: drawAstrolabe,
  },
  {
    id: 'arc-moon',
    name: 'Arc moon',
    family: 'architectural',
    description: 'Arched window framing a crescent, stars and a hanging lamp.',
    density: 'medium',
    draw: drawArcMoon,
  },
  {
    id: 'temple-gopuram',
    name: 'Gopuram tower',
    family: 'architectural',
    description: 'Five-tier temple tower with kalasam finials and a lit gateway.',
    density: 'rich',
    draw: drawTempleGopuram,
  },
  {
    id: 'temple-arch',
    name: 'Temple arch',
    family: 'architectural',
    description: 'Layered arch with pillars and a hanging oil lamp.',
    density: 'medium',
    draw: drawTempleArch,
  },
  {
    id: 'vel-peacock',
    name: 'Vel & peacock',
    family: 'devotional',
    description: 'Spear, six-pointed star and feather fan. Murugan symbolism.',
    density: 'medium',
    draw: drawVelPeacock,
  },
  {
    id: 'trishul-crescent',
    name: 'Trishul & crescent',
    family: 'devotional',
    description: 'Trident, crescent moon and damaru. Shaiyite symbolism.',
    density: 'medium',
    draw: drawTrishulCrescent,
  },
  {
    id: 'ganesha-motif',
    name: 'Ganesha motif',
    family: 'devotional',
    description: 'Respectful abstract silhouette with crown, trunk and modak.',
    density: 'rich',
    draw: drawGaneshaMotif,
  },
  {
    id: 'durga-shakti',
    name: 'Shakti chakra',
    family: 'devotional',
    description: 'Spoked chakra, yantra triangles and trishul for Durga designs.',
    density: 'rich',
    draw: drawDurgaShakti,
  },
  {
    id: 'deepam-lamp',
    name: 'Deepam lamp',
    family: 'devotional',
    description: 'Oil lamp with a painted flame, glow and kolam base.',
    density: 'medium',
    draw: drawDeepamLamp,
  },
  {
    id: 'peacock-feather',
    name: 'Peacock feather',
    family: 'botanical',
    description: 'A single plume with engraved barbs and a detailed feather eye.',
    density: 'light',
    draw: drawPeacockFeather,
  },
  {
    id: 'lotus-crest',
    name: 'Lotus crest',
    family: 'botanical',
    description: 'Brand-ready lotus emblem with a monogram ring.',
    density: 'medium',
    draw: drawLotusCrest,
  },
  {
    id: 'kolam-grid',
    name: 'Kolam lattice',
    family: 'geometric',
    description: 'Symmetrical dot-and-loop kolam pattern with a lotus medallion.',
    density: 'rich',
    draw: drawKolamGrid,
  },
  {
    id: 'geometric-strata',
    name: 'Geometric strata',
    family: 'geometric',
    description: 'Angular art-deco bands with engraved separations and a sun disc.',
    density: 'rich',
    draw: drawGeometricStrata,
  },
  {
    id: 'painted-hills',
    name: 'Painted hills',
    family: 'geometric',
    description: 'Atmospheric layered landscape with a celestial sky and temple silhouette.',
    density: 'rich',
    draw: drawPaintedHills,
  },
  {
    id: 'topographic',
    name: 'Topographic field',
    family: 'geometric',
    description: 'Nested contour lines. Quiet texture for editorial layouts.',
    density: 'light',
    draw: drawTopographic,
  },
]

export const MOTIF_BY_ID: Record<string, Motif> = Object.fromEntries(MOTIFS.map((m) => [m.id, m]))

export function getMotif(id: string): Motif {
  return MOTIF_BY_ID[id] ?? MOTIFS[0]
}

export interface MotifDrawOptions {
  opacity?: number
  scale?: number
  rotate?: number
  /** Extra offset in design units, used for parallax. */
  offsetX?: number
  offsetY?: number
}

/** Draw a motif inside a rect, honouring opacity / scale / rotation. */
export function drawMotif(a: ArtContext, id: string, opts: MotifDrawOptions = {}) {
  const motif = getMotif(id)
  const { ctx, rect } = a
  const { cx, cy } = center(a)
  ctx.save()
  if (opts.opacity !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, opts.opacity))
  if (opts.offsetX || opts.offsetY) {
    ctx.translate(opts.offsetX ?? 0, opts.offsetY ?? 0)
  }
  if (opts.scale !== undefined || opts.rotate !== undefined) {
    ctx.translate(cx, cy)
    if (opts.rotate) ctx.rotate(opts.rotate)
    if (opts.scale !== undefined) ctx.scale(opts.scale, opts.scale)
    ctx.translate(-cx, -cy)
  }
  motif.draw({ ...a, rect })
  ctx.restore()
}

export { center }
