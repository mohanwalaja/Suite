import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('data-rendered', 'true');
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('width', '1080');
});

test('100 original designs, selectable fonts, palettes, and correctly sized PNG exports', async ({
  page,
}) => {
  const card = page.locator('.style-strip .style-art').first();
  const size = await card.boundingBox();
  expect(size.width).toBeGreaterThan(100);
  expect(size.width / size.height).toBeCloseTo(0.8, 2);
  await page.getByRole('button', { name: 'Browse all' }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /Apply .* model/ }),
  ).toHaveCount(100);
  await page.getByRole('textbox', { name: 'Search models' }).fill('The Chart Cabinet');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Apply The Chart Cabinet model' })
    .click();
  await expect(page.getByLabel('Typography')).toHaveValue('Mulish');
  await expect(page.getByLabel('Typography').locator('option')).toHaveCount(50);
  await page.getByRole('button', { name: 'Use Forest jade palette' }).click();
  await expect(page.getByRole('button', { name: 'Use Forest jade palette' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('combobox', { name: 'Poster format' })).toHaveCount(0);
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('height', '1350');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download poster', exact: true }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toMatch(/The-Chart-Cabinet\.png$/);
  const png = await readFile(await file.path());
  expect(png.toString('ascii', 1, 4)).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1350);
});

test('service copy, editable captions, and durable drafts', async ({ page }) => {
  await page.getByRole('button', { name: 'Birth Jathagam', exact: true }).click();
  await page.getByRole('button', { name: /Marriage Compatibility The art/ }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue(/classical 10 Poruthams/);
  await page.getByLabel('Post caption').fill('A custom verified caption.');
  await page.getByLabel('Hashtags', { exact: true }).fill('#AstroSivam #Porutham');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.getByRole('button', { name: /^Content Library/ }).click();
  await expect(page.locator('.draft-card')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button', { name: 'Edit poster', exact: true }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue('A custom verified caption.');
  await page.getByRole('button', { name: 'Publish post', exact: true }).click();
  await expect(page.locator('.publish-copy')).toContainText('#AstroSivam #Porutham');
  await expect(page.locator('.publish-summary canvas')).toHaveAttribute('height', '1350');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: /^Content Library/ }).click();
  await page.getByRole('button', { name: /Delete Marriage Compatibility draft/ }).click();
  await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your poster library starts here' }),
  ).toBeVisible();
});

test('festivals and unlimited custom occasions inherit the style collection', async ({ page }) => {
  await page.getByRole('button', { name: 'Festivals', exact: true }).click();
  await page.getByRole('button', { name: 'Diwali', exact: true }).click();
  await page.getByLabel('Search topics').fill('Pongal');
  await page.getByRole('button', { name: 'Pongal Harvest blessings', exact: true }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue(/Iniya Pongal/);
  await page.getByRole('tab', { name: 'Design', exact: true }).click();
  await page.getByRole('button', { name: 'Pongal', exact: true }).click();
  await page.getByRole('button', { name: 'Add a custom festival' }).click();
  await page.getByRole('textbox', { name: 'Custom occasion name' }).fill('Harvest Home');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Harvest Home', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Browse all' }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /Apply .* model/ }),
  ).toHaveCount(100);
});

test('phone-only workflow: select a day, edit, review, and find real connection setup', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await page.getByRole('button', { name: 'Special days', exact: true }).click();
  await page.getByRole('button', { name: 'Mother’s Day', exact: true }).click();
  await page.getByLabel('Search topics').fill('Father');
  await page.getByRole('button', { name: /Father’s Day With love/ }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue(/Happy Father’s Day/);
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Father’s Day');
  await page.getByRole('dialog').getByRole('button', { name: 'Connect Meta' }).click();
  await expect(page.getByRole('heading', { name: 'Meta Accounts', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Setup guide' }).click();
  await expect(page.getByRole('dialog')).toContainText('PUBLIC_BASE_URL');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Brand Kit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Brand reference' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});

test('the original website identity is locked on every device', async ({ page }) => {
  await page.getByRole('button', { name: 'Brand Kit', exact: true }).click();
  const logo = page.getByRole('img', { name: 'Official ASTRO SIVAM logo and wordmark' });
  await expect(logo).toHaveAttribute('src', '/brand/official-logo.png');
  expect(await logo.evaluate((el) => [el.naturalWidth, el.naturalHeight])).toEqual([1220, 233]);
  await expect(page.locator('.identity-facts')).toContainText('ASTRO SIVAM');
  await expect(page.locator('main input')).toHaveCount(0);
  await page.getByRole('button', { name: 'Poster Studio', exact: true }).click();
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('aria-label', /by ASTRO SIVAM$/);
  await expect(page.getByRole('switch')).toHaveCount(0);
  await expect(page.getByText('Always on', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Poster format' })).toHaveCount(0);
  await expect(page.locator('.format-badge')).toHaveText('Portrait · 4:5');
  for (const width of [320, 390, 700, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
  }
});

test('legacy hidden-brand landscape drafts reopen with their edits in portrait', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('astrosivam:drafts'))[0];
    record.design = {
      ...record.design,
      format: 'landscape',
      showBrand: false,
      caption: 'My saved wording',
      headline: 'Saved headline',
    };
    localStorage.setItem('astrosivam:current', JSON.stringify(record.design));
    localStorage.setItem('astrosivam:drafts', JSON.stringify([record]));
    localStorage.setItem(
      'astrosivam:brand',
      JSON.stringify({ name: 'Obsolete name', logo: '/wrong-logo.png', website: 'old.example' }),
    );
  });
  await page.reload();
  await expect(page.locator('.format-badge')).toContainText('Portrait');
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('height', '1350');
  await page.getByRole('button', { name: /^Content Library/ }).click();
  await expect(page.locator('.draft-image canvas')).toHaveAttribute('aria-label', /ASTRO SIVAM/);
  await expect(page.locator('.draft-image canvas')).toHaveAttribute('height', '480');
  await page.getByRole('button', { name: 'Edit poster', exact: true }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue('My saved wording');
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem('astrosivam:drafts'))[0].design,
  );
  expect(saved.format).toBe('portrait');
  expect(saved.showBrand).toBeUndefined();
  expect(saved.headline).toBe('Saved headline');
});

test('independent palette choices and custom poster text do not change the service facts', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Explore all 50 color palettes' }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: /Apply .* palette/ }),
  ).toHaveCount(50);
  await page.getByLabel('Search palettes').fill('Jade Pavilion');
  await page.getByRole('button', { name: 'Apply Jade Pavilion palette' }).click();
  await expect(page.getByRole('button', { name: 'Explore all 50 color palettes' })).toHaveText(
    'Jade Pavilion',
  );
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await page.getByText('Poster wording', { exact: true }).click();
  await page.getByLabel('Poster headline', { exact: true }).fill('Your birth chart');
  await page.getByLabel('Poster tagline', { exact: true }).fill('A personal reading from Chennai.');
  await expect(page.getByLabel('Post caption')).toHaveValue(/Rasi and Navamsa/);
  await page.getByRole('button', { name: 'Save draft' }).click();
  const draft = await page.evaluate(
    () => JSON.parse(localStorage.getItem('astrosivam:drafts'))[0].design,
  );
  expect(draft.headline).toBe('Your birth chart');
  expect(draft.tagline).toBe('A personal reading from Chennai.');
});

test('all 200 preview models retain original logo ink and show the real artwork through the lockup on portrait canvases', async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { paintPoster, exportPoster, imageOf } = await import('/src/poster.js');
    const { paintArt } = await import('/src/art/press.js');
    const { illustrationImage } = await import('/src/art/illustration.js');
    const { modelFor } = await import('/src/art/models.js');
    const { styles, topics, newDesign, getPalette } = await import('/src/catalogue.js');
    const orig = await imageOf('/brand/official-logo.png');
    const cv = () => document.createElement('canvas'),
      live = cv(),
      ref = cv();
    const ctx = (c) => c.getContext('2d', { willReadFrequently: true });
    ctx(live);
    ctx(ref);
    // Independently rasterize the official PNG's alpha. Compare both the solid ink and
    // the clear spaces between/outside letters, excluding only the fine anti-aliased edge.
    const masks = new Map();
    function mask(w, h) {
      if (masks.has(w)) return masks.get(w);
      const x = w * 0.065,
        y = h * 0.05,
        lw = w * 0.46,
        lh = (lw * orig.naturalHeight) / orig.naturalWidth;
      const pad = Math.ceil(w * 0.012),
        bounds = [
          Math.floor(x) - pad,
          Math.floor(y) - pad,
          Math.ceil(lw) + 2 * pad,
          Math.ceil(lh) + 2 * pad,
        ];
      const [, , bw, bh] = bounds,
        within = Math.ceil(w * 0.00145) + 2;
      const c = cv();
      c.width = w;
      c.height = h;
      const g = ctx(c);
      g.imageSmoothingQuality = 'high';
      g.drawImage(orig, x, y, lw, lh);
      const alpha = g.getImageData(...bounds).data;
      const ink = [],
        clear = [];
      for (let j = within; j < bh - within; j += 2)
        for (let i = within; i < bw - within; i += 2) {
          const p = 4 * (j * bw + i);
          // Chromium's high-quality resampler can round even fully opaque native ink to 254.
          if (alpha[p + 3] >= 254) ink.push(p);
          if (alpha[p + 3]) continue;
          let safe = true;
          for (let dy = -within; safe && dy <= within; dy++)
            for (let dx = -within; dx <= within; dx++)
              if (alpha[p + 4 * (dy * bw + dx) + 3]) {
                safe = false;
                break;
              }
          if (safe) clear.push(p);
        }
      if (ink.length < 10 || clear.length < 100)
        throw Error('Insufficient opaque/transparent signature samples.');
      const value = { x, y, lw, lh, bounds, ink, clear };
      masks.set(w, value);
      return value;
    }
    const delta = (a, b, offsets) =>
      offsets.reduce(
        (sum, i) =>
          sum +
          Math.abs(a[i] - b[i]) +
          Math.abs(a[i + 1] - b[i + 1]) +
          Math.abs(a[i + 2] - b[i + 2]),
        0,
      ) /
      (offsets.length * 3);
    async function compare(d, canvas) {
      // Paint only background/art into the reference. The logo area is reserved above all
      // poster copy. An opaque white rectangle would now fail even if the logo itself matched.
      const { width: w, height: h } = canvas,
        m = modelFor(d.topic, d.styleId),
        pal = getPalette(d);
      ref.width = w;
      ref.height = h;
      const r = ctx(ref);
      r.save();
      r.scale(w / 1000, w / 1000);
      r.imageSmoothingQuality = 'high';
      paintArt(
        r,
        (1000 * h) / w,
        m,
        pal,
        m.setting
          ? await imageOf(
              w === 384 && m.painting
                ? `/art/thumbs/${m.setting}.webp?view=portrait`
                : `/art/scenes/${m.setting}.jpg`,
            )
          : null,
        m.hero ? await illustrationImage(m) : null,
      );
      r.restore();
      const { x, y, lw, lh, bounds, ink, clear } = mask(w, h);
      r.imageSmoothingQuality = 'high';
      r.drawImage(orig, x, y, lw, lh);
      const expected = r.getImageData(...bounds).data,
        actual = ctx(canvas).getImageData(...bounds).data;
      return { ink: delta(expected, actual, ink), clear: delta(expected, actual, clear) };
    }
    let count = 0,
      maxInk = 0,
      maxClear = 0,
      wrongSize = false;
    for (const category of ['Services', 'Festivals', 'Special days', 'Hindu deities'])
      for (const s of styles) {
        const d = {
          ...newDesign(topics.find((t) => t.category === category)),
          styleId: s.id,
          font: s.font,
          format: ['portrait', 'instagram', 'facebook', 'landscape'][s.id % 4],
          showBrand: false,
          palette: s.id % 3 === 0 ? 4 : -1,
        };
        await paintPoster(live, d, { small: true });
        wrongSize ||= live.width !== 384 || live.height !== 480;
        const e = await compare(d, live);
        maxInk = Math.max(maxInk, e.ink);
        maxClear = Math.max(maxClear, e.clear);
        count++;
      }
    const d = { ...newDesign(), format: 'facebook' };
    await paintPoster(live, d);
    const full = await compare(d, live);
    const downloads = {};
    for (const mime of ['image/png', 'image/jpeg']) {
      // Allow for JPEG compression by encoding the verified live portrait at the same quality.
      const expected = await createImageBitmap(
        await new Promise((ok) => live.toBlob(ok, mime, 0.94)),
      );
      const actual = await createImageBitmap(await exportPoster(d, mime));
      const reg = mask(1080, 1350),
        pixels = (bmp) => {
          const c = cv();
          c.width = bmp.width;
          c.height = bmp.height;
          const r = ctx(c);
          r.drawImage(bmp, 0, 0);
          return r.getImageData(...reg.bounds).data;
        };
      const a = pixels(actual),
        b = pixels(expected);
      downloads[mime] = {
        size: [actual.width, actual.height],
        ink: delta(a, b, reg.ink),
        clear: delta(a, b, reg.clear),
      };
      expected.close();
      actual.close();
    }
    return { count, wrongSize, maxInk, maxClear, full, downloads };
  });
  expect(result.count).toBe(200);
  expect(result.wrongSize).toBe(false);
  // An alpha of 254 admits at most one RGB level of the underlay.
  expect(result.maxInk).toBeLessThanOrEqual(1);
  expect(result.maxClear).toBeLessThan(1);
  expect(result.full.ink).toBeLessThanOrEqual(1);
  expect(result.full.clear).toBeLessThan(1);
  for (const out of Object.values(result.downloads)) {
    expect(out.size).toEqual([1080, 1350]);
    expect(out.ink).toBeLessThan(1);
    expect(out.clear).toBeLessThan(1);
  }
});

test('an unavailable original logo cannot produce an unbranded download or post', async ({
  page,
}) => {
  let downloaded = false,
    submitted = false;
  page.on('download', () => (downloaded = true));
  await page.route('**/brand/official-logo.png', (r) => r.abort());
  await page.route('**/api/meta/status', (r) =>
    r.fulfill({
      json: {
        configured: true,
        connected: true,
        account: { id: 'test-page', name: 'Test Page' },
        pages: [],
      },
    }),
  );
  await page.route('**/api/publish', (r) => {
    submitted = true;
    return r.abort();
  });
  await page.reload();
  await expect(page.locator('.canvas-mat')).toContainText(
    'original ASTRO SIVAM logo could not load',
  );
  await page.getByRole('button', { name: 'Download poster', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('logo could not load');
  await page.getByRole('button', { name: 'Publish post', exact: true }).click();
  await page.getByRole('button', { name: 'Publish now', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('logo could not load');
  expect(downloaded).toBe(false);
  expect(submitted).toBe(false);
});
