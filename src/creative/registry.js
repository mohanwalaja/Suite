import {
  baseModelsFor,
  collectionInfo as baseCollectionInfo,
  picturesFor as basePicturesFor,
} from '../art/base-models.js';
import { PORTRAIT } from '../../shared/poster-spec.js';
import { COMPOSITIONS, compositionById } from './composition.js';
import { TYPE_SYSTEMS, typeSystemById } from './typography.js';
import { ARRANGEMENTS, arrangementById, motifPairFor, motifPoolFor } from './artwork.js';
import { BACKGROUNDS, ORNAMENTS, variationFor, validateVariation } from './variation.js';
import { hash32, assertStructurallyUnique } from './uniqueness.js';

const DESIGN_COUNT = 150;
export const MIN_DESIGNS_PER_SUBJECT = 100;
const tint = (hex, target, amount) =>
  '#' +
  [1, 3, 5]
    .map((i) =>
      Math.round(
        parseInt(hex.slice(i, i + 2), 16) * (1 - amount) +
          parseInt(target.slice(i, i + 2), 16) * amount,
      )
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

const titleCase = (id) => id.replace(/(^|[- ])\w/g, (m) => m.toUpperCase());

/**
 * CreativeRegistry owns one independently defined composition per index for every subject.
 * The legacy fifty rows remain the first fifty definitions, so saved drafts, model names,
 * palettes and published history keep resolving to precisely the same artwork. The second
 * fifty rebuild the subject vocabulary with a different composition, illustration
 * arrangement, hierarchy, background and decorative programme.
 */
export class CreativeRegistry {
  constructor(base = baseModelsFor) {
    this.base = base;
    this.cache = new Map();
  }

  key(topic) {
    return `${topic.category}:${topic.id}`;
  }

  definitionsFor(topic) {
    if (!topic) return [];
    const key = this.key(topic);
    if (this.cache.has(key)) return this.cache.get(key);
    const base = this.base(topic);
    const pool = motifPoolFor(topic, base);
    const definitions = [];
    for (let index = 0; index < DESIGN_COUNT; index++) {
      const pass = index < base.length ? 0 : index < base.length * 2 ? 1 : 2;
      const source = base[index % base.length];
      definitions.push(this.build(topic, source, index, pass, pool));
    }
    assertStructurallyUnique(definitions, topic.name);
    if (this.cache.size >= 48) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, definitions);
    return definitions;
  }

  build(topic, base, index, pass, pool) {
    const variation = variationFor(base.id, pass, base.sequence || 0, pool.length);
    if (!validateVariation(variation)) throw Error('The variation engine produced an invalid design.');
    const composition =
      pass === 0
        ? { id: 'legacy', name: 'Classic studio plate', concept: `Classic ${titleCase(base.layout)} composition` }
        : compositionById(variation.compositionId);
    const typeSystem =
      pass === 0 ? TYPE_SYSTEMS[0] : TYPE_SYSTEMS[variation.typeSystemId] || typeSystemById(variation.typeSystemId);
    const background =
      pass === 0 ? BACKGROUNDS[0] : BACKGROUNDS[variation.backgroundId];
    const ornament =
      pass === 0 ? ORNAMENTS[0] : ORNAMENTS[variation.ornamentId];
    const arrangement =
      pass === 0
        ? {
            // Personal collections repeat a motif and layout every forty studies. Their
            // inherited frame is unchanged, but each plate is a separately mounted keepsake.
            id: base.local ? `personal-${base.id}` : 'inherited-' + (base.sequence || 0),
            name: 'Inherited scene arrangement',
          }
        : ARRANGEMENTS[variation.arrangementId] || arrangementById(variation.arrangementId);
    const [hero, companion] =
      pass > 0 && !base.local && !base.setting
        ? motifPairFor(pool, base.id, pass)
        : [base.hero || null, base.companion || null];
    // Sacred pictures and personal photographs are never swapped for another subject's art.
    const setting = base.painting || base.local ? base.setting || null : base.setting || null;
    const definitionId = `CAD-${hash32(topic.id + '|' + index + '|' + base.key).slice(0, 8).toUpperCase()}`;
    const id = `${topic.id}::${String(index).padStart(3, '0')}`;
    const definition = {
      id: definitionId,
      designId: id,
      index,
      subject: topic.name,
      subjectId: topic.id,
      category: topic.category,
      concept: `${pass === 0 ? 'Inherited study' : pass === 1 ? 'Direction II' : 'Direction III'}: ${variation.direction.concept} · ${base.name}`,
      artDirection: variation.direction.artDirection,
      composition: composition.concept,
      compositionId: composition.id,
      compositionName: composition.name,
      background: background.treatment,
      backgroundId: background.id,
      illustration: base.local
        ? 'The selected personal picture, shown uncropped with its own clear space.'
        : setting
          ? `${base.name}: registered ${base.medium.toLowerCase()} with subject-specific attributes.`
          : `${titleCase(hero || 'motif')} with a ${titleCase(companion || 'supporting')} vignette.`,
      secondaryElements: titleCase(companion || ornament.name),
      typography: `${typeSystem.name}: ${typeSystem.note}`,
      typographyId: typeSystem.id,
      headlinePlacement:
        pass === 0 ? 'Inherited text panel, optically centred and fitted.' : composition.geometry(1250).text.top.toFixed(3) + 'H, ' + typeSystem.align + ' alignment.',
      supportingPlacement: pass === 0 ? 'Below the headline, inside the protected text panel.' : typeSystem.order.join(' → '),
      logoPlacement: 'Reserved clear space; original logo proportions, never cropped.',
      decorative: ornament.treatment,
      decorativeId: ornament.id,
      shapes: pass === 0 ? titleCase(base.layout) : titleCase(composition.geometry(1250).art.shape || 'rect') + ' focal field',
      texture: variation.direction.texture,
      lighting: variation.direction.lighting,
      visualBalance: variation.direction.balance,
      export: {
        format: PORTRAIT.id,
        width: PORTRAIT.width,
        height: PORTRAIT.height,
        ratio: PORTRAIT.ratio,
        colour: 'Full-colour PNG and high-quality JPEG',
      },
      // Mirrored fields let the structural checker compare definitions exactly like models.
      hero,
      companion,
      setting,
      local: base.local || null,
      layout: base.layout,
      archetype: composition.id,
      arrangement: arrangement.id,
      typeSystem: typeSystem.id,
      ornament: ornament.id,
      backgroundIdForKey: background.id,
      direction: pass,
      renderDirection: pass === 0 ? 0 : 1,
      directionId: variation.direction.id,
    };
    const colors = base.colors.map((colour, i) => {
      if (pass === 0) return colour;
      const amount = (pass === 2 ? 0.075 : 0.05) + ((base.id + i) % 7) * 0.008;
      return tint(colour, variation.direction.accent, i === 1 ? amount * 1.4 : amount);
    });
    return {
      ...base,
      id: index,
      name: pass === 0 ? base.name : `${variation.direction.name}${pass === 2 ? ' II' : ''} · ${base.name}`,
      hero,
      companion,
      setting,
      colors,
      direction: pass === 0 ? 0 : 1,
      pass,
      directionId: variation.direction.id,
      compositionId: composition.id,
      arrangement: pass === 0 ? arrangement.id : variation.arrangementId,
      typeSystem: typeSystem.id,
      ornament: ornament.id,
      background: background.id,
      definition,
      key: `${base.key}:d${index}:${composition.id}:${arrangement.id}:${typeSystem.id}:${setting || ''}`,
    };
  }

  modelFor(topic, id = 0) {
    const designs = this.definitionsFor(topic);
    return designs[id] || designs[0];
  }

  count(topic) {
    return this.definitionsFor(topic).length;
  }
}

export const registry = new CreativeRegistry();
export { DESIGN_COUNT };
export { COMPOSITIONS, TYPE_SYSTEMS, ARRANGEMENTS, BACKGROUNDS, ORNAMENTS };
export { baseCollectionInfo, basePicturesFor };
