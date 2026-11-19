// CreativeUniquenessEngine. Two different IDs are not evidence of different art: the
// structural signature excludes colour, font choice and tiny offsets. The perceptual
// signature compares actual rendered pixels at a small, luminance-normalised resolution.

export function hash32(value) {
  let h = 2166136261;
  for (const ch of String(value)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function structuralSignature(model) {
  return hash32(
    [
      model.family || '',
      model.hero || '-',
      model.companion || '-',
      model.setting || '-',
      model.local || '-',
      model.layout || '-',
      model.archetype || 'legacy',
      model.arrangement ?? '-',
      model.typeSystem || 'classic',
      model.ornament || '-',
      model.background || '-',
      model.direction ?? 0,
    ].join('|'),
  );
}

export function assertStructurallyUnique(models, subject) {
  const seen = new Map();
  for (const model of models) {
    const signature = structuralSignature(model);
    if (seen.has(signature))
      throw new Error(
        `${subject}: ${seen.get(signature)} and ${model.name} share one composition (${signature}).`,
      );
    seen.set(signature, model.name);
  }
  return seen.size;
}

// A 24 x 30 luminance grid is enough to catch duplicated compositions while ignoring
// palette swaps: each cell is compared against the local mean before differencing.
export function perceptualSignature(canvas, cols = 24, rows = 30) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(canvas, 0, 0, cols, rows);
  const data = g.getImageData(0, 0, cols, rows).data;
  const lum = [];
  for (let i = 0; i < data.length; i += 4)
    lum.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  return lum.map((v) => (v > mean ? 1 : 0));
}

export function similarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let same = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++;
  return same / a.length;
}

export class CreativeUniquenessEngine {
  constructor(threshold = 0.93) {
    this.threshold = threshold;
  }
  check(model, previousModels = [], rendered = null, previousRendered = []) {
    const structural = structuralSignature(model);
    const duplicate = previousModels.some((p) => structuralSignature(p) === structural);
    const visual = rendered
      ? Math.max(0, ...previousRendered.map((p) => similarity(rendered, p)))
      : 0;
    return {
      duplicate,
      tooSimilar: visual >= this.threshold,
      structural,
      visualSimilarity: Number(visual.toFixed(3)),
      ok: !duplicate && visual < this.threshold,
    };
  }
}
