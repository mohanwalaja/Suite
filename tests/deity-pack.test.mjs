import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { imageSize } from 'image-size';
import { POSTER_REVISION } from '../shared/poster-spec.js';
import { deityTopics } from '../src/art/deities.js';
import { picturesFor } from '../src/art/models.js';
import pack from '../src/deity-pack.json' with { type: 'json' };

test('complete downloadable ZIP has one portrait JPEG per curated picture choice', () => {
  const zip = readFileSync('public' + pack.url);
  assert.equal(zip.length, pack.bytes);
  assert.equal(pack.revision, POSTER_REVISION);
  // The reproducible pack script uses stored entries. Read the central directory and check
  // actual image bytes; counting file names in a catalogue would miss stale or empty exports.
  const eoc = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(eoc > 0);
  let off = zip.readUInt32LE(eoc + 16);
  const counts = new Map(),
    entries = new Set();
  for (let i = 0; i < zip.readUInt16LE(eoc + 10); i++) {
    assert.equal(zip.readUInt32LE(off), 0x02014b50);
    const nameLen = zip.readUInt16LE(off + 28),
      extraLen = zip.readUInt16LE(off + 30),
      commentLen = zip.readUInt16LE(off + 32);
    const name = zip.toString('utf8', off + 46, off + 46 + nameLen);
    if (name.endsWith('.jpg')) {
      entries.add(name);
      assert.equal(zip.readUInt16LE(off + 10), 0);
      const local = zip.readUInt32LE(off + 42),
        start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const { type, width, height } = imageSize(
        zip.subarray(start, start + zip.readUInt32LE(off + 20)),
      );
      assert.deepEqual([type, width, height], ['jpg', 1080, 1350]);
      const folder = name.split('/')[0];
      counts.set(folder, (counts.get(folder) || 0) + 1);
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  assert.equal(counts.size, pack.collections);
  assert.equal(
    [...counts.values()].reduce((a, b) => a + b, 0),
    pack.pictures,
  );
  let serial = 0;
  for (const t of deityTopics) {
    const works = picturesFor(t);
    assert.equal(counts.get(t.name), works.length, t.name);
    for (const m of works) {
      assert.ok(m.painting && m.setting, m.name);
      const slug = m.name
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-$/, '');
      assert.ok(entries.has(`${t.name}/${String(++serial).padStart(3, '0')}-${slug}.jpg`), m.name);
    }
  }
});
