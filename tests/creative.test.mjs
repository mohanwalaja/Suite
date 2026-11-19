import test from 'node:test';
import assert from 'node:assert/strict';
import { topics, services, newDesign } from '../src/catalogue.js';
import { modelsFor } from '../src/art/models.js';
import { registry, MIN_DESIGNS_PER_SUBJECT } from '../src/creative/registry.js';
import { CreativeHistoryManager } from '../src/creative/history.js';
import { DailyRotationEngine } from '../src/creative/rotation.js';
import { createDailyCopy } from '../src/creative/captions.js';
import { inspectDesign, assessDefinition } from '../src/creative/quality.js';
import { COMPOSITIONS } from '../src/creative/composition.js';
import { TYPE_SYSTEMS } from '../src/creative/typography.js';
import { ART_DIRECTIONS, validateVariation, variationFor } from '../src/creative/variation.js';
import { exportSizeFor, canvasSize, normalizeDesign } from '../shared/poster-spec.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}

test('Creative Registry registers 100+ complete definitions for every existing subject', () => {
  assert.equal(topics.length, 169);
  assert.equal(registry.count(topics[0]), MIN_DESIGNS_PER_SUBJECT);
  for (const topic of topics) {
    const designs = modelsFor(topic);
    assert.ok(designs.length >= 100, topic.name);
    assert.equal(new Set(designs.map((d) => d.definition.id)).size, designs.length, topic.name);
    assert.equal(new Set(designs.map((d) => d.definition.concept)).size, designs.length, topic.name);
    for (const d of designs) {
      assert.equal(d.definition.subjectId, topic.id);
      assert.match(d.definition.id, /^CAD-[0-9A-F]{8}$/);
      assert.match(d.definition.export.ratio, /^\d+:\d+$/);
      assert.ok(d.definition.artDirection.length > 15);
      assert.ok(d.definition.composition.length > 15);
    }
    const directions = new Set(designs.map((d) => d.directionId));
    assert.ok(directions.size >= 8, `${topic.name} art directions: ${directions.size}`);
  }
  assert.ok(ART_DIRECTIONS.length >= 10);
  assert.ok(COMPOSITIONS.length >= 10);
  assert.ok(TYPE_SYSTEMS.length >= 8);
  for (let i = 0; i < 50; i++) {
    assert.ok(validateVariation(variationFor(i, 0)));
    assert.ok(validateVariation(variationFor(i, 1, 0, 8)));
  }
});

test('daily rotation prefers unused designs, never repeats a composition consecutively, and is date-stable', () => {
  const topic = services[0];
  const storage = new MemoryStorage();
  const history = new CreativeHistoryManager(storage);
  const day = (n) => new Date(Date.UTC(2026, 0, 1 + n)).toISOString();
  const engine = new DailyRotationEngine({ definitionsFor: modelsFor, historyManager: history, today: () => day(0) });
  const picked = [];
  for (let i = 0; i < 100; i++) {
    const design = engine.suggest(topic, day(i));
    picked.push(design.id);
    history.record({
      subjectId: topic.id,
      subject: topic.name,
      designId: design.id,
      designName: design.name,
      composition: design.compositionId,
      source: i % 3 === 0 ? 'published' : 'generated',
    });
  }
  assert.equal(new Set(picked).size, 100, 'the first 100 days exhaust the library without a repeat');
  assert.equal(engine.remaining(topic), 0);
  assert.equal(engine.suggest(topic, day(100)).id, engine.suggest(topic, day(100)).id, 'the same day and history produce the same suggestion');
  const firstAfter = engine.suggest(topic, day(100));
  assert.ok(firstAfter, 'the engine still offers a design after the library is exhausted');
  assert.notEqual(firstAfter.compositionId, history.lastComposition(topic.id), 'a new day avoids the previous composition');

  const preferred = engine.suggest(topic, day(101), { directionId: 'swiss' });
  assert.equal(preferred.directionId, 'swiss');
});

test('creative history persists across manager instances and can be reset by an administrator', () => {
  const storage = new MemoryStorage();
  const first = new CreativeHistoryManager(storage);
  first.record({ subjectId: 'birth', designId: 'birth::004', composition: 'editorial', source: 'manual' });
  first.record({ subjectId: 'birth', designId: 'birth::004', composition: 'editorial', source: 'published' });
  const second = new CreativeHistoryManager(storage);
  assert.ok(second.usedIds('birth').has('birth::004'));
  assert.ok(second.publishedIds('birth').has('birth::004'));
  assert.equal(second.stats().published, 1);
  assert.equal(second.stats().manual, 1);
  assert.equal(second.lastComposition('birth'), 'editorial');
  assert.ok(second.reset());
  assert.equal(new CreativeHistoryManager(storage).stats().total, 0);
});

test('English daily captions vary by day and never add prices, guarantees or predictions', () => {
  const topic = services[1];
  const design = modelsFor(topic)[12];
  const captions = new Set();
  for (let d = 1; d <= 14; d++) {
    const copy = createDailyCopy(topic, design, new Date(Date.UTC(2026, 10, d)));
    captions.add(copy.caption);
    assert.ok(copy.caption.includes('astrosivam.com'));
    assert.ok(copy.caption.includes(topic.description));
    assert.ok(copy.hashtags.includes('#AstroSivam'));
    assert.doesNotMatch(copy.caption + copy.hashtags, /[\u0900-\u097F]/);
    assert.doesNotMatch(copy.caption, /\$|₹|guarantee|promise|prediction|percent/i);
  }
  assert.ok(captions.size >= 3, 'captions rotate instead of repeating the same text daily');
});

test('quality control validates composition duplication, fonts, English copy and export sizes', () => {
  const design = newDesign(services[0]);
  assert.deepEqual(inspectDesign(design), []);
  assert.ok(inspectDesign({ ...design, font: 'Not Bundled' }).some((p) => p.code === 'font'));
  assert.ok(inspectDesign({ ...design, headline: 'जन्म कुंडली' }).some((p) => p.code === 'language'));
  const models = modelsFor(services[0]);
  assert.deepEqual(assessDefinition(models[0].definition, []), []);
  assert.ok(assessDefinition(models[0].definition, [models[0].definition]).some((p) => p.code === 'duplicate'));
  assert.deepEqual(canvasSize('square'), { width: 1080, height: 1350 });
  assert.deepEqual(exportSizeFor('portrait'), { width: 1080, height: 1350 });
  assert.deepEqual(exportSizeFor('square'), { width: 1080, height: 1080 });
  assert.deepEqual(exportSizeFor('story'), { width: 1080, height: 1920 });
  assert.equal(normalizeDesign({ ...design, format: 'square' }).format, 'portrait');
});
