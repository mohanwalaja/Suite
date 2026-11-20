// Renders every registered poster and compares actual pixels, not design IDs.
// The work is batched by subject so the browser never holds more than a few hundred
// canvases' worth of image data at once.
// Usage: CHROMIUM_PATH=/path/to/chrome node scripts/audit-visuals.mjs [subjectLimit] [threshold]
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'node:fs';
import { visualAuditPasses } from './visual-gate.mjs';

const limit = Number(process.argv[2] || 0);
const threshold = Number(process.argv[3] || 0.97);
const BATCH = 4;
let browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  let page = await browser.newPage();
  page.setDefaultTimeout(180000);
  await page.goto(process.env.STUDIO_URL || 'http://127.0.0.1:5173/', {
    waitUntil: 'networkidle',
  });
  const all = await page.evaluate(async () => {
    const { topics } = await import('/src/catalogue.js');
    return topics.map((t) => ({ id: t.id, name: t.name }));
  });
  const subjects = limit ? all.slice(0, limit) : all;
  const totals = process.env.AUDIT_RESUME && process.env.AUDIT_CHECKPOINT
    ? JSON.parse(readFileSync(process.env.AUDIT_CHECKPOINT, 'utf8'))
    : {
    subjects: 0,
    rendered: 0,
    compared: 0,
    exact: 0,
    near: 0,
    worst: 0,
    threshold,
    issues: [],
    subjectsReport: [],
  };
  if (totals.threshold !== threshold || totals.subjects > subjects.length)
    throw Error('Checkpoint does not match this audit configuration.');
  for (let start = totals.subjects; start < subjects.length; start += BATCH) {
    const batch = subjects.slice(start, start + BATCH);
    const part = await page.evaluate(
      async ({ batch, threshold }) => {
        const { topics, newDesign } = await import('/src/catalogue.js');
        const { paintPoster } = await import('/src/poster.js');
        const canvas = document.createElement('canvas');
        const W = 320,
          H = 400,
          COLS = 32,
          ROWS = 40,
          BITS = COLS * ROWS,
          WORDS = BITS / 32;
        const sample = document.createElement('canvas');
        sample.width = COLS;
        sample.height = ROWS;
        const g = sample.getContext('2d', { willReadFrequently: true });
        const pop = (n) => {
          n = n - ((n >> 1) & 0x55555555);
          n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
          return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
        };
        const signature = () => {
          g.drawImage(canvas, 0, 0, COLS, ROWS);
          const data = g.getImageData(0, 0, COLS, ROWS).data;
          const lum = [];
          for (let i = 0; i < data.length; i += 4)
            lum.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
          const words = new Uint32Array(WORDS);
          for (let i = 0; i < lum.length; i++) if (lum[i] > mean) words[i >> 5] |= 1 << (i % 32);
          return words;
        };
        const similarity = (a, b) => {
          let same = 0;
          for (let i = 0; i < WORDS; i++) same += 32 - pop((a[i] ^ b[i]) | 0);
          return same / BITS;
        };
        const issues = [];
        const subjectsReport = [];
        let rendered = 0,
          compared = 0,
          exact = 0,
          near = 0,
          worst = 0;
        for (const meta of batch) {
          const topic = topics.find((t) => t.id === meta.id);
          const signs = [];
          for (let id = 0; id < 150; id++) {
            await paintPoster(canvas, { ...newDesign(topic), styleId: id }, {
              size: { width: W, height: H },
            });
            signs.push(signature());
            rendered++;
          }
          const conflicts = Array.from({ length: signs.length }, () => new Set());
          let subjectNear = 0,
            subjectExact = 0,
            peak = 0,
            pair = null;
          for (let i = 0; i < signs.length; i++)
            for (let j = i + 1; j < signs.length; j++) {
              const s = similarity(signs[i], signs[j]);
              compared++;
              worst = Math.max(worst, s);
              if (s >= threshold) {
                near++;
                subjectNear++;
                conflicts[i].add(j);
                conflicts[j].add(i);
              }
              if (s === 1) {
                exact++;
                subjectExact++;
              }
              if (s > peak) {
                peak = s;
                pair = [i, j];
              }
            }
          // This greedy subset has no pairs above the threshold. It is NOT a count of
          // genuinely distinct compositions: the coarse pixel test needs manual review.
          const candidates = [];
          for (let i = 0; i < signs.length; i++)
            if (candidates.every((previous) => !conflicts[i].has(previous))) candidates.push(i);
          subjectsReport.push({
            subject: topic.id, name: topic.name, rendered: signs.length,
            flaggedPairs: subjectNear, identicalSignatures: subjectExact,
            thresholdPassingCandidates: candidates.length,
            genuinelyDistinctVerified: null,
            status: subjectNear ? 'failed-screen' : 'manual-review-required',
          });
          if (subjectNear || subjectExact)
            issues.push({
              subject: topic.id,
              near: subjectNear,
              exact: subjectExact,
              peak: Number(peak.toFixed(4)),
              pair,
            });
        }
        return { rendered, compared, exact, near, worst, issues, subjectsReport };
      },
      { batch, threshold },
    );
    totals.subjects += batch.length;
    totals.rendered += part.rendered;
    totals.compared += part.compared;
    totals.exact += part.exact;
    totals.near += part.near;
    totals.worst = Math.max(totals.worst, part.worst);
    totals.issues.push(...part.issues);
    totals.subjectsReport.push(...part.subjectsReport);
    console.error(`${totals.subjects}/${subjects.length} subjects, ${totals.rendered} renders`);
    if (process.env.AUDIT_CHECKPOINT)
      writeFileSync(process.env.AUDIT_CHECKPOINT, JSON.stringify(totals, null, 2));
    if (start + BATCH < subjects.length) {
      await browser.close();
      browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_PATH,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      });
      page = await browser.newPage();
      page.setDefaultTimeout(180000);
      await page.goto(process.env.STUDIO_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    }
  }
  totals.worst = Number(totals.worst.toFixed(4));
  totals.issues.sort((a, b) => b.near - a.near || b.peak - a.peak);
  console.log(JSON.stringify(totals, null, 2));
  if (process.env.AUDIT_ENFORCE === '1' && !visualAuditPasses(totals)) {
    console.error('Visual screening failed or did not cover the full catalogue; manual review remains required even after a passing screen.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
