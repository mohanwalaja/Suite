import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BRAND, formats, formatFor, canvasSize, normalizeDesign } from '../shared/poster-spec.js';
import {
  styles,
  topics,
  fonts,
  services,
  makeOccasion,
  createCopy,
  newDesign,
  matchesTopic,
} from '../src/catalogue.js';
import { modelsFor, picturesFor } from '../src/art/models.js';
import { imageSize } from 'image-size';
import { sceneSvg } from '../src/art/illustration.js';
import { DEITIES, deityTopics, paintings, paintingsOf, customDeity } from '../src/art/deities.js';
import { occasionBrief } from '../src/art/briefs.js';
const digest = (x) => createHash('sha256').update(x).digest('hex');
test('every subject has 50 unique style, palette, and font combinations', () => {
  assert.equal(styles.length, 50);
  for (const field of ['name', 'font', 'id'])
    assert.equal(new Set(styles.map((s) => s[field])).size, 50);
  assert.equal(new Set(styles.map((s) => s.colors.join(','))).size, 50);
  assert.equal(fonts.length, 50);
  const photoHashes = new Map();
  for (const t of topics) {
    const models = modelsFor(t),
      drawn = new Set();
    assert.equal(models.length, 50, t.name);
    assert.equal(new Set(models.map((m) => m.name)).size, 50, t.name);
    assert.equal(new Set(models.map((m) => m.colors.join())).size, 50, t.name);
    if (t.category !== 'Services') assert.ok(occasionBrief(t).curated, t.name);
    for (const m of models) {
      let art = '';
      if (m.setting) {
        if (!photoHashes.has(m.setting))
          photoHashes.set(m.setting, digest(readFileSync(`public/art/scenes/${m.setting}.jpg`)));
        art += photoHashes.get(m.setting);
      }
      if (m.hero) {
        const svg = sceneSvg(m);
        assert.doesNotMatch(svg, /undefined|NaN|\[object Object\]/, m.name);
        art += digest(svg);
      }
      assert.ok(art, m.name);
      drawn.add(art);
    }
    // Hash the actual illustration/scene, before any poster title, logo, font or palette is applied.
    assert.equal(drawn.size, 50, t.name + ' must not just repaint the same background');
  }
});
test('all 50 typefaces are bundled with local files and licenses', () => {
  for (const f of fonts) {
    const slug = f.toLowerCase().replaceAll(' ', '-');
    assert.ok(readFileSync(`public/fonts/${slug}.woff2`).length > 1000);
    assert.ok(existsSync(`public/fonts/licenses/${slug}.txt`));
  }
});
test('site services and required family occasions have ready-to-edit copy', () => {
  assert.equal(new Set(topics.map((t) => t.id)).size, topics.length);
  for (const n of [
    'Birth Jathagam',
    'Subha Muhurtham',
    'Marriage Compatibility',
    'Baby Naming',
    'Father’s Day',
    'Mother’s Day',
    'Teachers’ Day',
    'Diwali',
    'Pongal',
    'Onam',
    'Eid al-Fitr',
  ])
    assert.ok(topics.some((t) => t.name === n));
  for (const t of topics) {
    const c = createCopy(t);
    assert.ok(c.caption.includes('astrosivam.com'));
    assert.ok(c.hashtags.includes('#AstroSivam'));
    assert.ok(c.caption.length + c.hashtags.length + 2 < 2200);
  }
  assert.ok(services.every((t) => t.path.startsWith('/')));
});
test('custom occasions work in the same design and caption workflow', () => {
  const t = makeOccasion('Community Day');
  const d = newDesign(t);
  assert.equal(d.topic.name, 'Community Day');
  assert.match(d.hashtags, /#CommunityDay/);
  assert.ok(!Object.hasOwn(d, 'showBrand'));
  assert.equal(d.font, styles[0].font);
  assert.equal(d.format, 'portrait');
  assert.deepEqual(
    formats.map((f) => [f.width, f.height]),
    [[1080, 1350]],
  );
});

test('original full lockup is bundled byte-for-byte, including its lettering', () => {
  assert.equal(BRAND.name, 'ASTRO SIVAM');
  const png = readFileSync('public' + BRAND.logo);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1220, 233]);
  assert.equal(
    createHash('sha256').update(png).digest('hex'),
    'be06e37a2011c4f1934ae433d8d4da528d73e24b4adab50d3ddd778a0aa57794',
  );
  const greeting = createCopy(makeOccasion('Community Day'), {
    name: 'Old custom name',
    website: 'old.example',
  });
  assert.match(greeting.caption, /ASTRO SIVAM · astrosivam\.com/);
});

test('all old sizes migrate to 4:5 without changing edits, selected picture, format-independent destinations or IDs', () => {
  const { showBrand, ...expected } = {
    ...newDesign(),
    showBrand: false,
    styleId: 36,
    caption: 'Keep my edits',
    headline: 'Custom title',
    tagline: 'My wish',
    draftId: 'saved-01',
    platforms: ['facebook'],
  };
  for (const old of [
    'instagram',
    'facebook',
    'square',
    'landscape',
    'portrait',
    'unknown',
    undefined,
  ]) {
    const restored = normalizeDesign({ ...expected, format: old, showBrand });
    assert.deepEqual(restored, { ...expected, format: 'portrait' });
    assert.equal(normalizeDesign(restored), restored);
    assert.equal(formatFor(old).id, 'portrait');
    assert.deepEqual(canvasSize(old), { width: 1080, height: 1350 });
    assert.deepEqual(canvasSize(old, true), { width: 384, height: 480 });
  }
});

test('deity pictures are individually generated raster paintings, not recolored faces or poster layouts', () => {
  assert.equal(deityTopics.length, 35);
  const uniqueSourceHashes = new Set();
  for (const k of Object.keys(paintings)) {
    const bytes = readFileSync(`public/art/scenes/${k}.jpg`);
    const { type, width, height } = imageSize(bytes);
    assert.ok(type === 'jpg' && width >= 1024 && height >= 1024, k);
    const thumb = imageSize(readFileSync(`public/art/thumbs/${k}.webp`));
    assert.ok(thumb.type === 'webp' && Math.max(thumb.width, thumb.height) <= 512, k);
    uniqueSourceHashes.add(digest(bytes));
  }
  assert.equal(uniqueSourceHashes.size, Object.keys(paintings).length);
  for (const t of deityTopics) {
    const pics = picturesFor(t),
      sources = paintingsOf(t.name);
    assert.ok(pics.length >= 1, t.name);
    assert.deepEqual(
      pics.map((m) => m.setting),
      sources,
      t.name,
    );
    assert.ok(pics.every((m) => m.figure === t.name && !m.hero && m.painting));
    assert.ok(
      modelsFor(t).every((m) => m.painting && sources.includes(m.setting)),
      t.name,
    );
  }
  // Regression: the deities previously represented by the same SVG face each lead their
  // own full-scene painting. None is a crop or colourway of another deity's picture.
  const previouslyMissing =
    'Ganga Annapurna Meenakshi Andal Mariamman Dhanvantari Dattatreya Shani Chandra Indra Agni Naga Bhagavathy Kamakhya Jhulelal Jagannath Narasimha Brahma Parvati Radha'.split(
      ' ',
    );
  const leads = previouslyMissing.map((name) => paintingsOf(name, { leadOnly: true })[0]);
  assert.equal(new Set(leads).size, previouslyMissing.length);
  for (const key of leads) assert.equal(paintings[key][3], 'whole');
  assert.ok(paintingsOf('Ganesha').length >= 2 && paintingsOf('Krishna').length >= 2);
  for (const [q, n] of [
    ['Balaji', 'Venkateswara'],
    ['Mahadev', 'Shiva'],
    ['महादेव', 'Shiva'],
    ['कार्तिकेय', 'Murugan'],
    ['Gauri', 'Parvati'],
  ])
    assert.ok(
      matchesTopic(
        deityTopics.find((t) => t.name === n),
        q,
      ),
      q,
    );
  for (const [n, gs] of [
    ['Diwali', ['Ganesha', 'Lakshmi']],
    ['Navaratri', ['Durga', 'Lakshmi', 'Saraswati']],
    ['Pongal', ['Surya']],
    ['Dhanteras', ['Dhanvantari', 'Lakshmi']],
    ['Ratha Yatra', ['Jagannath']],
    ['Ambubachi Mela', ['Kamakhya']],
    ['Bonalu', ['Kali']],
    ['Eid al-Fitr', []],
    ['Christmas', []],
    ['Father’s Day', []],
  ]) {
    const pics = picturesFor(topics.find((t) => t.name === n));
    assert.deepEqual([...new Set(pics.map((p) => p.figure))].sort(), gs.sort());
    assert.ok(
      pics.every(
        (p) => p.painting && paintingsOf(p.figure, { leadOnly: true }).includes(p.setting),
      ),
    );
  }
  const local = customDeity('Our village deity', [
    { id: 'local-a', label: 'Shrine' },
    { id: 'local-b', label: 'Procession' },
  ]);
  assert.equal(local.category, DEITIES);
  assert.deepEqual(
    picturesFor(local).map((m) => m.local),
    ['local-a', 'local-b'],
  );
  assert.ok(modelsFor(local).every((m) => m.local && !m.setting && !m.hero));
});
