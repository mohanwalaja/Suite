// Offline build tool, not a server endpoint: rasterize once so a phone doesn't have to
// render the entire collection, hold a whole ZIP in memory, or fetch images offsite.
import { chromium } from 'playwright';
import { imageSize } from 'image-size';
import { PORTRAIT, POSTER_REVISION } from '../shared/poster-spec.js';
import { mkdtemp, mkdir, writeFile, rm, stat, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { deityTopics, paintings } from '../src/art/deities.js';
import { picturesFor } from '../src/art/models.js';
import { createCopy } from '../src/catalogue.js';
const temp = await mkdtemp(join(tmpdir(), 'astro-sivam-deities-'));
const out = resolve('public/downloads');
await mkdir(out, { recursive: true });
const filename = 'ASTRO-SIVAM-Hindu-Deity-Posters.zip';
const archive = join(out, filename);
const partial = join(out, '.deities-next.zip');
const b = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
let total = 0;
try {
  const p = await b.newPage();
  await p.goto(process.env.ART_STUDIO_URL || 'http://127.0.0.1:5173', {
    waitUntil: 'domcontentloaded',
  });
  await p.waitForSelector('.canvas-mat canvas[data-rendered=true]');
  for (const t of deityTopics) {
    const dir = join(temp, t.name);
    await mkdir(dir);
    const pics = picturesFor(t);
    for (const m of pics) {
      const bytes = await p.evaluate(
        async ({ id, styleId, source, revision }) => {
          const spec = await import('/shared/poster-spec.js');
          if (spec.POSTER_REVISION !== revision)
            throw Error('Restart Vite before packing: the running poster revision is stale.');
          const { exportPoster } = await import('/src/poster.js');
          const { newDesign, topics, fonts } = await import('/src/catalogue.js');
          const { modelFor } = await import('/src/art/models.js');
          const topic = topics.find((t) => t.id === id);
          if (modelFor(topic, styleId).setting !== source)
            throw Error('Restart Vite: the running artwork catalogue is stale.');
          const blob = await exportPoster(
            { ...newDesign(topic), styleId, font: fonts[styleId] },
            'image/jpeg',
            0.79,
          );
          return await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result.split(',')[1]);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });
        },
        { id: t.id, styleId: m.id, source: m.setting, revision: POSTER_REVISION },
      );
      const name =
        String(++total).padStart(3, '0') +
        '-' +
        m.name
          .normalize('NFKD')
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/-$/, '') +
        '.jpg';
      const file = Buffer.from(bytes, 'base64');
      const { type, width, height } = imageSize(file);
      if (type !== 'jpg' || width !== PORTRAIT.width || height !== PORTRAIT.height)
        throw Error('Unexpected poster format: ' + name);
      await writeFile(join(dir, name), file);
      // A viewable example of the same branded JPEG shipped in the pack.
      if (t.id === 'deity-jagannath' && m.setting === 'jagannath-puri')
        await writeFile(join(out, 'ASTRO-SIVAM-Jagannath-Portrait.jpg'), file);
    }
    const copy = createCopy(t);
    await writeFile(join(dir, 'Caption.txt'), copy.caption + '\n\n' + copy.hashtags + '\n');
  }
  await writeFile(
    join(temp, 'READ-ME.txt'),
    `ASTRO SIVAM — Hindu deity poster collection\n\n${total} portrait ${PORTRAIT.width} × ${PORTRAIT.height} JPEG posters, in ${deityTopics.length} named folders. Each folder has an editable caption and hashtags. These are the built-in picture choices in the studio, not a claim to depict every Hindu deity or regional form. ${Object.keys(paintings).length} individually generated AI paintings. Shared scenes appear in the collections of the figures they depict: ${Object.values(
      paintings,
    )
      .filter(([, cast]) => cast.includes(','))
      .map(([title]) => title)
      .join(
        '; ',
      )}. Layouts, preview thumbnails and ritual ornaments are not separate paintings. The original transparent ASTRO SIVAM logo and wordmark overlay the artwork, without a white panel. Use the live studio for individual PNG exports, more layouts, personal collections, or different wording.\n`,
  );
  await rm(partial, { force: true });
  execFileSync('zip', ['-X', '-q', '-0', '-r', partial, '.'], { cwd: temp });
  await rename(partial, archive);
  const bytes = (await stat(archive)).size;
  await writeFile(
    'src/deity-pack.json',
    JSON.stringify(
      {
        url: '/downloads/' + filename,
        collections: deityTopics.length,
        pictures: total,
        bytes,
        revision: POSTER_REVISION,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `${filename}: ${deityTopics.length} folders, ${total} JPEGs, ${(bytes / 1e6).toFixed(1)} MB`,
  );
} finally {
  await b.close();
  await rm(temp, { recursive: true, force: true });
  await rm(partial, { force: true });
}
