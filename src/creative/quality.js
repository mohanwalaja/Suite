import { BRAND, PORTRAIT, canvasSize } from '../../shared/poster-spec.js';
import { fonts } from '../catalogue.js';
import { modelsFor } from '../art/models.js';
import { structuralSignature, perceptualSignature, similarity } from './uniqueness.js';
import { englishOnly } from './typography.js';

// PosterQualityEngine. The static checks run on any device; the rendered checks add
// perceptual comparison and canvas verification in the browser. Every issue carries an
// actionable suggestion for the editor.
const issue = (code, message, suggestion, level = 'error') => ({ code, message, suggestion, level });

export function inspectDesign(design) {
  const problems = [];
  if (!design?.topic?.name) problems.push(issue('subject', 'The subject is missing.', 'Choose a subject from the content collection.'));
  if (!design?.topic?.category)
    problems.push(issue('category', 'The subject category is missing.', 'Choose a service, festival, deity or special day.'));
  if (!Number.isInteger(design?.styleId) || !modelsFor(design.topic)[design.styleId])
    problems.push(issue('design', 'The selected design definition is not available.', 'Pick another composition from the model library.'));
  if (design?.font && !fonts.includes(design.font))
    problems.push(issue('font', 'The headline typeface is not bundled with the studio.', 'Choose a bundled typeface from the Typography control.'));
  const text = [design?.headline, design?.tagline, design?.caption, design?.hashtags].join(' ');
  if (!englishOnly(text))
    problems.push(issue('language', 'Poster text must be in English only.', 'Replace non-English wording before export.'));
  if (!String(design?.caption || '').includes(BRAND.website) && design?.topic?.category === 'Services')
    problems.push(issue('website', 'The service caption does not reference the official website.', 'Restore the suggested caption or add astrosivam.com.'));
  if (!String(design?.hashtags || '').includes('#AstroSivam'))
    problems.push(issue('hashtags', 'The official hashtag is missing.', 'Add #AstroSivam to the hashtag field.'));
  return problems;
}

export function assessDefinition(definition, previousDefinitions = []) {
  const problems = [];
  const required = [
    'id',
    'subject',
    'category',
    'concept',
    'artDirection',
    'composition',
    'background',
    'illustration',
    'typography',
    'decorative',
    'shapes',
    'texture',
    'lighting',
    'visualBalance',
    'export',
  ];
  for (const field of required)
    if (definition?.[field] === undefined || definition?.[field] === null || definition?.[field] === '')
      problems.push(issue('definition:' + field, `The design definition is missing ${field}.`, 'Rebuild the definition from the Creative Registry.'));
  const signature = structuralSignature(definition);
  if (previousDefinitions.some((p) => structuralSignature(p) === signature))
    problems.push(
      issue(
        'duplicate',
        'This composition is structurally identical to another design.',
        'Choose a different composition, illustration arrangement or typographic system.',
      ),
    );
  return problems;
}

export async function assessRendered(canvas, design, { previousSignatures = [] } = {}) {
  const problems = [];
  if (!canvas) return problems;
  const { width, height } = canvasSize(design?.format);
  if (canvas.width !== width || canvas.height !== height)
    problems.push(
      issue('size', `The canvas is ${canvas.width} × ${canvas.height}, not ${width} × ${height}.`, 'Re-render the poster at the portrait social size.'),
    );
  if (!canvas.width || !canvas.height) return problems;
  const signature = perceptualSignature(canvas);
  const duplicate = previousSignatures.findIndex((p) => similarity(signature, p) >= 0.97);
  if (duplicate >= 0)
    problems.push(
      issue('similar', 'This poster is visually almost identical to a previously generated poster.', 'Select another composition or art direction.', 'warning'),
    );
  // The locked logo occupies the reserved top-left zone. A completely uniform region there
  // means the signature could not be drawn, so exporting would produce unbranded artwork.
  try {
    const g = canvas.getContext('2d', { willReadFrequently: true });
    const sample = g.getImageData(
      Math.round(width * 0.06),
      Math.round(height * 0.05),
      Math.round(width * 0.2),
      Math.round(height * 0.03),
    ).data;
    const colours = new Set();
    for (let i = 0; i < sample.length; i += 40) colours.add(`${sample[i]},${sample[i + 1]},${sample[i + 2]}`);
    if (colours.size < 2)
      problems.push(
        issue('logo', 'The original ASTRO SIVAM logo could not load, or its reserved brand area is empty.', 'Reload the studio so the original ASTRO SIVAM logo can be drawn.'),
      );
  } catch {
    // Browser canvas privacy rules may disallow sampling; the renderer already fails closed
    // when the original logo asset cannot load.
  }
  return { problems, signature };
}

export async function qualityReport(design, canvas, options = {}) {
  const staticIssues = inspectDesign(design);
  let rendered = { problems: [], signature: null };
  if (canvas) rendered = await assessRendered(canvas, design, options);
  const problems = [...staticIssues, ...(rendered.problems || [])];
  const errors = problems.filter((p) => p.level === 'error');
  return {
    ok: errors.length === 0,
    ready: errors.length === 0,
    score: Math.max(0, 100 - errors.length * 20 - (problems.length - errors.length) * 6),
    problems,
    suggestions: problems.map((p) => p.suggestion),
    signature: rendered.signature,
    dimensions: [PORTRAIT.width, PORTRAIT.height],
  };
}
