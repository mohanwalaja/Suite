// The originals are already bundled. This optional maintenance command can restore each
// PNG from the website or its pinned public source blob; it never accepts an unverified logo.
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { BRAND } from '../shared/poster-spec.js';
const assets = [
  {
    kind: 'logo',
    site: BRAND.logoSource,
    blob: '65ad9adb56ac5e643f09094e4e47571fa197280d',
    sha256: 'be06e37a2011c4f1934ae433d8d4da528d73e24b4adab50d3ddd778a0aa57794',
  },
  {
    kind: 'icon',
    site: BRAND.site + '/assets/images/android-chrome-192x192.png',
    blob: '8caff3cfa48b969a40f9bb47fa6cdcf4e80086b3',
    sha256: '0621a9ea8296f39adea13eed441544ba7ae24ee9b247a0e2067113881a8bc91f',
  },
  {
    kind: 'iconLarge',
    site: BRAND.site + '/assets/images/android-chrome-512x512.png',
    blob: '63301521ea52cd61fc6e7c0d0d455fa01efd4f3a',
    sha256: 'e6af2da345d3377bb3131e7c4347efab046fb6a5630df48ad955f60a0eb96ce8',
  },
];
const digest = (b) => createHash('sha256').update(b).digest('hex');
const get = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: 'error' });
  if (!r.ok) throw new Error('Source unavailable');
  return r;
};
await mkdir('public/brand', { recursive: true });
for (const asset of assets) {
  const dest = `public${BRAND[asset.kind]}`;
  try {
    const local = await readFile(dest).catch(() => null);
    if (local && digest(local) === asset.sha256) {
      console.log(`Verified ${dest}`);
      continue;
    }
    let bytes;
    try {
      bytes = Buffer.from(await (await get(asset.site)).arrayBuffer());
    } catch {
      /* Use the same source bytes below. */
    }
    if (!bytes || digest(bytes) !== asset.sha256) {
      const data = await (
        await get(`https://api.github.com/repos/mohanwalaja/Mohan/git/blobs/${asset.blob}`)
      ).json();
      bytes = Buffer.from(data.content, 'base64');
    }
    if (digest(bytes) !== asset.sha256) throw new Error('Source checksum did not match');
    await writeFile(dest + '.tmp', bytes);
    await rename(dest + '.tmp', dest);
    console.log(`Restored ${dest}`);
  } catch {
    console.error(`Could not verify ${dest}. No replacement was installed.`);
    process.exitCode = 1;
  }
}
