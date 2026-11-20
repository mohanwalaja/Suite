import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.use({ viewport: { width: 390, height: 844 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('data-rendered', 'true');
});
const button = (root, name) => root.getByRole('button', { name, exact: true });

test('phone directory, Hindi and alias search, change the actual picture and export it', async ({
  page,
}) => {
  await button(page, 'God pictures').click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /^Browse .+ pictures/ })).toHaveCount(35);
  const download = dialog.getByRole('link', { name: 'Download all deity posters as a ZIP' });
  const pack = await page.request.head(await download.getAttribute('href'));
  expect(pack.ok()).toBe(true);
  expect(Number(pack.headers()['content-length'])).toBeGreaterThan(1000000);
  // Tap a real unfiltered directory card. Grid rows must not collapse over one another on phones.
  await button(dialog, 'Browse Ganesha pictures').click();
  await button(dialog, 'All deities').click();
  await dialog.getByLabel('Search deities').fill('महादेव');
  await expect(button(dialog, 'Browse Shiva pictures')).toBeVisible();
  await dialog.getByLabel('Search deities').fill('Ganpati');
  await button(dialog, 'Browse Ganesha pictures').click();
  await expect(dialog.getByRole('button', { name: /^Use picture:/ })).toHaveCount(2);
  await button(dialog, 'Use picture: Ganesha & the Modaks').click();
  const canvas = page.locator('.canvas-mat canvas');
  await expect(canvas).toHaveAttribute('aria-label', /Ganesha & the Modaks/);
  await expect(canvas).toHaveAttribute('data-rendered', 'true');
  // The unoverlaid right side must contain the selected painting, not merely different wording.
  const result = await page.evaluate(async () => {
    const scr = document.querySelector('.canvas-mat canvas'),
      w = scr.width;
    const { exportPoster, paintPoster } = await import('/src/poster.js');
    const { newDesign, topics } = await import('/src/catalogue.js');
    const d = newDesign(topics.find((t) => t.name === 'Ganesha'));
    const im = new Image();
    im.src = '/art/scenes/chaturthi-ganesha.jpg';
    await im.decode();
    const ref = document.createElement('canvas');
    ref.width = w;
    ref.height = scr.height;
    const r = ref.getContext('2d', { willReadFrequently: true });
    r.imageSmoothingEnabled = true;
    r.imageSmoothingQuality = 'high';
    // This editorial painting has left-side copy space. Its portrait cover retains the art
    // on the right, cropping only at the sides. Compare at the same crop and pixel density.
    const cover = (ctx, width, height, source = im) => {
      const scale = height / source.naturalHeight,
        sw = width / scale;
      ctx.drawImage(
        source,
        (source.naturalWidth - sw) * 0.88,
        0,
        sw,
        source.naturalHeight,
        0,
        0,
        width,
        height,
      );
    };
    cover(r, w, scr.height);
    const x = Math.floor(w * 0.85),
      y = Math.floor(w * 0.38),
      area = [x, y, 59, 155];
    const pixels = (c) => c.getContext('2d').getImageData(...area).data;
    const source = pixels(ref),
      delta = (data) => data.reduce((n, v, i) => n + Math.abs(v - source[i]), 0) / source.length;
    const out = { preview: delta(pixels(scr)) };
    for (const type of ['image/png', 'image/jpeg']) {
      const bmp = await createImageBitmap(await exportPoster(d, type));
      r.drawImage(bmp, 0, 0);
      bmp.close();
      out[type] = delta(pixels(ref));
    }
    const small = document.createElement('canvas');
    await paintPoster(small, d, { small: true });
    const work = document.createElement('canvas');
    work.width = small.width;
    work.height = small.height;
    const ctx = work.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const thumbSource = new Image();
    thumbSource.src = '/art/thumbs/chaturthi-ganesha.webp?view=portrait';
    await thumbSource.decode();
    cover(ctx, work.width, work.height, thumbSource);
    const rect = [Math.floor(work.width * 0.85), Math.floor(work.height * 0.38), 32, 67];
    const expected = ctx.getImageData(...rect).data,
      thumb = small.getContext('2d').getImageData(...rect).data;
    out.thumb = expected.reduce((n, v, i) => n + Math.abs(v - thumb[i]), 0) / expected.length;
    return out;
  });
  expect(result.preview).toBeLessThan(2);
  expect(result['image/png']).toBeLessThan(2);
  expect(result['image/jpeg']).toBeLessThan(5);
  expect(result.thumb).toBeLessThan(2);
  const original = await canvas.evaluate((c) => c.toDataURL());
  await button(page, 'Choose a deity picture 2 pictures').click();
  dialog = page.getByRole('dialog');
  await button(dialog, 'Use picture: Ganesha the Scribe').click();
  await expect(canvas).toHaveAttribute('aria-label', /Ganesha the Scribe/);
  await expect(canvas).toHaveAttribute('data-rendered', 'true');
  expect(await canvas.evaluate((c) => c.toDataURL())).not.toEqual(original);
  const dl = page.waitForEvent('download');
  await button(page, 'Download poster').click();
  const downloaded = await dl;
  expect(downloaded.suggestedFilename()).toContain('Ganesha-the-Scribe');
  const png = await readFile(await downloaded.path());
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1080, 1350]);
  await button(page, 'Models').click();
  dialog = page.getByRole('dialog');
  const models = dialog.getByRole('button', { name: /^Apply .* model$/ });
  await expect(models).toHaveCount(150);
  await models.last().scrollIntoViewIfNeeded();
  await expect(models.last().locator('canvas')).toHaveAttribute('data-rendered', 'true');
  await models.last().click();
  await expect(canvas).toHaveAttribute('data-rendered', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('festival picker restricts the figures and keeps the festival, edited wish and palette', async ({
  page,
}) => {
  await button(page, 'Festivals').click();
  await page.locator('.topic-select').click();
  await page.getByLabel('Search topics').fill('Ambubachi Mela');
  await page.getByRole('button', { name: /Ambubachi Mela/ }).click();
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await page.getByLabel('Post caption').fill('An Ambubachi Mela wish for our family.');
  await page.getByRole('tab', { name: 'Design', exact: true }).click();
  await button(page, 'Use Forest jade palette').click();
  await page.getByRole('button', { name: /Choose a deity picture/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText('Ambubachi Mela pictures');
  await expect(dialog.getByRole('button', { name: /Use picture: .*Lakshmi/ })).toHaveCount(0);
  await button(dialog, 'Use picture: Red Hibiscus at Kamakhya’s Shrine').click();
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute(
    'aria-label',
    /Ambubachi Mela · Red Hibiscus at Kamakhya’s Shrine/,
  );
  await expect(button(page, 'Use Forest jade palette')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('tab', { name: 'Caption & tags' }).click();
  await expect(page.getByLabel('Post caption')).toHaveValue('An Ambubachi Mela wish for our family.');
  await page.getByRole('tab', { name: 'Design', exact: true }).click();
  await button(page, 'Ambubachi Mela').click();
  await page.getByLabel('Search topics').fill('Eid al-Fitr');
  await page.getByRole('button', { name: /Eid al-Fitr Festival greetings/ }).click();
  await expect(page.getByRole('button', { name: /Choose a deity picture/ })).toHaveCount(0);
});

test('plated festivals keep their specific deity picture selectable and framed', async ({ page }) => {
  await button(page, 'Festivals').click();
  await page.locator('.topic-select').click();
  await page.getByLabel('Search topics').fill('Ganesh Chaturthi');
  await page.getByRole('button', { name: /Ganesh Chaturthi/ }).click();
  await expect(page.getByRole('button', { name: /Choose a deity picture/ })).toBeVisible();
  await page.getByRole('button', { name: /Choose a deity picture/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText('Ganesh Chaturthi pictures');
  await expect(dialog.getByRole('button', { name: /Use picture:/ }).first()).toBeVisible();
  await dialog.getByRole('button', { name: /Use picture:/ }).first().click();
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute(
    'aria-label',
    /Ganesh Chaturthi/,
  );
  const paintings = await page.evaluate(async () => {
    const { picturesFor } = await import('/src/art/models.js');
    const { topics } = await import('/src/catalogue.js');
    return picturesFor(topics.find((t) => t.id === 'fest-ganesh-chaturthi')).map(
      (m) => m.deityPicture,
    );
  });
  expect(paintings).toContain('chaturthi-ganesha');
});

test('a regional deity accepts multiple local pictures and a saved draft uses the selected one after reload', async ({
  page,
}) => {
  await button(page, 'God pictures').click();
  let dialog = page.getByRole('dialog');
  await button(dialog, 'Add my pictures').click();
  await dialog.getByLabel('Deity name').fill('Our village shrine');
  await dialog
    .getByLabel('Choose pictures')
    .setInputFiles(['public/art/scenes/dev-murugan.jpg', 'public/art/scenes/dev-hanuman.jpg']);
  await button(dialog, 'Save collection').click();
  await expect(dialog.getByRole('heading')).toHaveText('Our village shrine pictures');
  await expect(dialog.getByRole('button', { name: /^Use picture:/ })).toHaveCount(2);
  await button(dialog, 'Use picture: dev-hanuman · 02').click();
  const canvas = page.locator('.canvas-mat canvas');
  await expect(canvas).toHaveAttribute('data-rendered', 'true');
  await expect(canvas).toHaveAttribute('aria-label', /Our village shrine · dev-hanuman · 02/);
  await button(page, 'Save draft').click();
  await page.reload();
  await expect(canvas).toHaveAttribute('data-rendered', 'true');
  await expect(canvas).toHaveAttribute('aria-label', /dev-hanuman · 02/);
  await button(page, 'God pictures').click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Search deities').fill('Our village');
  await expect(button(dialog, 'Browse Our village shrine pictures on this device')).toBeVisible();
});

test('all lightweight painting sources decode and match the field of view of their full-size originals', async ({
  page,
}) => {
  const out = await page.evaluate(async () => {
    const { paintings } = await import('/src/art/deities.js');
    const img = async (url) => {
      const im = new Image();
      im.src = url;
      await im.decode();
      return im;
    };
    // Compare area averages of native decoded pixels, not two browser resizes with different
    // sampling kernels. Fine jewelry and foliage can alias strongly in a 40-pixel resize.
    const cv = document.createElement('canvas'),
      ctx = cv.getContext('2d', { willReadFrequently: true });
    const sample = (im) => {
      const w = (cv.width = im.naturalWidth),
        h = (cv.height = im.naturalHeight),
        grid = 16;
      ctx.drawImage(im, 0, 0);
      const rgba = ctx.getImageData(0, 0, w, h).data;
      const rgb = new Uint32Array(grid * grid * 3),
        area = new Uint32Array(grid * grid);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const bin = (((y * grid) / h) | 0) * grid + (((x * grid) / w) | 0),
            pos = (y * w + x) * 4;
          area[bin]++;
          for (let j = 0; j < 3; j++) rgb[bin * 3 + j] += rgba[pos + j];
        }
      return Uint8Array.from(rgb, (v, i) => Math.round(v / area[(i / 3) | 0]));
    };
    const signatures = new Set(),
      mismatches = [];
    for (const key of Object.keys(paintings)) {
      const pixels = sample(await img(`/art/scenes/${key}.jpg`));
      const reduced = Array.from(pixels, (v) => v >> 4).join(',');
      if (signatures.has(reduced) || new Set(pixels).size < 60) mismatches.push(key);
      signatures.add(reduced);
      const swatch = sample(await img(`/art/thumbs/${key}.webp`));
      if (pixels.reduce((d, v, i) => d + Math.abs(v - swatch[i]), 0) / pixels.length > 5)
        mismatches.push(key + ': wrong thumbnail');
    }
    return mismatches;
  });
  expect(out).toEqual([]);
});

test('retried Jagannath painting is the selectable, uncropped artwork in a portrait export', async ({
  page,
}) => {
  await button(page, 'God pictures').click();
  const d = page.getByRole('dialog');
  await expect(d.locator('.shared-painting')).toHaveCount(1);
  await expect(d.locator('.shared-painting')).toContainText('Sita');
  await d.getByLabel('Search deities').fill('जगन्नाथ');
  const choice = button(d, 'Browse Jagannath pictures');
  const cover = choice.locator('canvas');
  await expect(cover).toHaveAttribute('data-rendered', 'true');
  await expect(cover).toHaveAttribute('aria-label', /Jagannath on Nandighosha/);
  await expect(cover).toHaveAttribute('height', '480');
  await expect(cover).toHaveAttribute('width', '384');
  await choice.click();
  await button(d, 'Use picture: Jagannath on Nandighosha').click();
  await expect(page.locator('.format-badge')).toHaveText('Portrait · 4:5');
  const poster = page.locator('.canvas-mat canvas');
  await expect(poster).toHaveAttribute('height', '1350');
  await expect(poster).toHaveAttribute('data-rendered', 'true');
  const diff = await page.evaluate(async () => {
    const im = new Image();
    im.src = '/art/scenes/jagannath-puri.jpg';
    await im.decode();
    const live = document.querySelector('.canvas-mat canvas');
    const { width: w, height: h } = live;
    const ref = document.createElement('canvas');
    ref.width = w;
    ref.height = h;
    const c = ref.getContext('2d', { willReadFrequently: true });
    c.imageSmoothingQuality = 'high';
    const side = 0.6 * h,
      x = (w - side) / 2,
      y = 0.14 * h;
    c.drawImage(im, x, y, side, side);
    const rect = [Math.ceil(x) + 3, Math.ceil(y) + 3, Math.floor(side) - 6, Math.floor(side) - 6];
    const expected = c.getImageData(...rect).data;
    const difference = (ctx) =>
      ctx.getImageData(...rect).data.reduce((n, v, i) => n + Math.abs(v - expected[i]), 0) /
      expected.length;
    const preview = difference(live.getContext('2d'));
    const { exportPoster } = await import('/src/poster.js');
    const design = JSON.parse(localStorage.getItem('astrosivam:current'));
    const bmp = await createImageBitmap(await exportPoster(design, 'image/png'));
    c.drawImage(bmp, 0, 0);
    bmp.close();
    return [preview, difference(c)];
  });
  for (const delta of diff) expect(delta).toBeLessThan(2);
});
