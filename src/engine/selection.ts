import type { AspectClass } from './formats'
import type { CategoryId, CompositionId, DesignContent } from './types'
import { COMPOSITIONS } from './compositions'
import { getCategory } from './categories'
import { rng } from './color'

export interface SelectionInput {
  categoryId: CategoryId
  aspect: AspectClass
  seed?: number
  /** Recently used compositions, most recent first. */
  exclude?: CompositionId[]
  content?: Partial<DesignContent>
  /** Force a style family bias. */
  mood?: 'luxury' | 'editorial' | 'devotional' | 'campaign' | 'minimal' | 'cosmic'
}

/**
 * Composition selection engine.
 *
 * Scores every composition on category fit, aspect-ratio behaviour, content
 * shape (headline length, number of points, body length) and recency, then
 * picks from the top scores with a seeded weighted draw. The recency penalty is
 * deliberately large so a regenerate never repeats the same family.
 */
export function scoreCompositions(input: SelectionInput): Array<{ id: CompositionId; score: number; reasons: string[] }> {
  const category = getCategory(input.categoryId)
  const headline = input.content?.headline ?? ''
  const body = input.content?.body ?? ''
  const points = (input.content?.points ?? []).filter(Boolean).length
  const seed = input.seed ?? 1
  const rand = rng(seed)

  const recent = input.exclude ?? []
  return COMPOSITIONS.map((comp) => {
    const reasons: string[] = []
    let score = 4

    // The category shortlist is a hard preference: compositions the category
    // does not list stay available as a last resort but never win by accident.
    if (category.compositions.includes(comp.meta.id)) {
      score += 10
      reasons.push('category shortlist')
    } else {
      score -= 26
    }
    if (comp.meta.bestFor.includes(category.id)) {
      score += 7
      reasons.push('category fit')
    }
    if (comp.meta.formats.includes(input.aspect)) {
      score += 1.5
    } else {
      score -= 6
    }

    const idx = recent.indexOf(comp.meta.id)
    if (idx === 0) {
      score -= 1000
      reasons.push('just used')
    } else if (idx > 0) {
      score -= 240 / idx
      reasons.push('recent')
    }

    if (headline.length > 46) {
      if (['editorial-type', 'hero-illustration', 'cinematic-devotional', 'swiss-grid'].includes(comp.meta.id)) {
        score += 2.5
        reasons.push('long headline')
      }
    } else if (headline.length > 0 && headline.length < 26) {
      if (['minimal-luxury', 'bold-campaign', 'decorative-frame', 'circular-mandala'].includes(comp.meta.id)) {
        score += 2
        reasons.push('short headline')
      }
    }

    if (points >= 3) {
      if (['premium-infographic', 'swiss-grid', 'split-panel', 'editorial-type'].includes(comp.meta.id)) {
        score += 2.5
        reasons.push('service points')
      }
    } else if (['premium-infographic', 'swiss-grid'].includes(comp.meta.id)) {
      score -= 1.5
    }

    if (body.length > 170) {
      if (['editorial-type', 'layered-collage', 'illustrated-story', 'asymmetric-luxury'].includes(comp.meta.id)) {
        score += 2
        reasons.push('long body')
      }
    } else if (body.length > 0 && body.length < 90) {
      if (['minimal-luxury', 'bold-campaign', 'decorative-frame', 'split-panel'].includes(comp.meta.id)) {
        score += 1.5
        reasons.push('short body')
      }
    }

    if (input.aspect === 'story') {
      if (['cinematic-devotional', 'hero-illustration', 'circular-mandala', 'bold-campaign'].includes(comp.meta.id)) {
        score += 2
      }
    }
    if (input.aspect === 'landscape') {
      if (['split-panel', 'swiss-grid', 'editorial-type', 'hero-illustration'].includes(comp.meta.id)) {
        score += 2
      }
    }
    if (input.aspect === 'square') {
      if (['circular-mandala', 'minimal-luxury', 'decorative-frame', 'layered-collage'].includes(comp.meta.id)) {
        score += 1.5
      }
    }

    if (input.mood) {
      const map: Record<string, string[]> = {
        luxury: ['asymmetric-luxury', 'minimal-luxury', 'decorative-frame', 'editorial-type'],
        editorial: ['editorial-type', 'swiss-grid', 'premium-infographic'],
        devotional: ['cinematic-devotional', 'hero-illustration', 'decorative-frame', 'circular-mandala'],
        campaign: ['bold-campaign', 'split-panel', 'diagonal-geometric'],
        minimal: ['minimal-luxury', 'swiss-grid', 'editorial-type'],
        cosmic: ['cosmic-astrology', 'circular-mandala', 'circular-mandala', 'premium-infographic'],
      }
      if ((map[input.mood] ?? []).includes(comp.meta.id)) score += 1.5
    }

    // Small deterministic jitter keeps consecutive regenerations varied without
    // letting randomness override the structural fit.
    score += rand() * 1.4
    return { id: comp.meta.id, score, reasons }
  }).sort((a, b) => b.score - a.score)
}

export function selectComposition(input: SelectionInput): CompositionId {
  const category = getCategory(input.categoryId)
  const all = scoreCompositions(input)
  const shortlisted = all.filter((r) => category.compositions.includes(r.id))
  // Prefer the category's own shortlist. Fall back to the full set only when the
  // category does not define one (or every shortlisted option is excluded).
  const ranked = shortlisted.length >= 2 ? shortlisted : all
  const eligible = ranked.filter((r) => r.score > -500)
  const pool = eligible.length ? eligible : ranked
  // Weighted draw from the top four so the same context can produce different
  // (but always appropriate) compositions.
  const top = pool.slice(0, Math.min(4, pool.length))
  const weights = top.map((_t, i) => Math.max(0.4, 5 - i * 1.1))
  const total = weights.reduce((a, b) => a + b, 0)
  const rand = rng((input.seed ?? 1) * 7919 + 13)
  let r = rand() * total
  for (let i = 0; i < top.length; i++) {
    r -= weights[i]
    if (r <= 0) return top[i].id
  }
  return top[0].id
}

export function selectFrom<T>(items: T[], seed: number, exclude: T[] = []): T {
  const available = items.filter((i) => !exclude.includes(i))
  const pool = available.length ? available : items
  return pool[Math.abs(seed) % pool.length]
}
