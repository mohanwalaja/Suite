import type { CompositionId } from '../types'
import type { Composition } from './types'
import { heroIllustration } from './hero-illustration'
import { editorialType } from './editorial-type'
import { asymmetricLuxury } from './asymmetric-luxury'
import { circularMandala } from './circular-mandala'
import { diagonalGeometric } from './diagonal-geometric'
import { cosmicAstrology } from './cosmic-astrology'
import { splitPanel } from './split-panel'
import { illustratedStory } from './illustrated-story'
import { minimalLuxury } from './minimal-luxury'
import { premiumInfographic } from './premium-infographic'
import { layeredCollage } from './layered-collage'
import { cinematicDevotional } from './cinematic-devotional'
import { swissGrid } from './swiss-grid'
import { decorativeFrame } from './decorative-frame'
import { boldCampaign } from './bold-campaign'

/** Registry of every composition. Order defines the gallery order. */
export const COMPOSITIONS: Composition[] = [
  heroIllustration,
  editorialType,
  asymmetricLuxury,
  circularMandala,
  diagonalGeometric,
  cosmicAstrology,
  splitPanel,
  illustratedStory,
  minimalLuxury,
  premiumInfographic,
  layeredCollage,
  cinematicDevotional,
  swissGrid,
  decorativeFrame,
  boldCampaign,
]

export const COMPOSITION_BY_ID: Record<string, Composition> = Object.fromEntries(
  COMPOSITIONS.map((c) => [c.meta.id, c]),
)

export function getComposition(id: CompositionId | string): Composition {
  return COMPOSITION_BY_ID[id] ?? COMPOSITIONS[0]
}

export type { Composition }
