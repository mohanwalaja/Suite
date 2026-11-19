import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Check,
  Clock3,
  CopyPlus,
  Layers3,
  LockKeyhole,
  RotateCcw,
  RotateCw,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { Poster } from './Shared';
import { fonts, topics } from '../catalogue.js';
import { EXPORT_FORMATS } from '../../shared/poster-spec.js';
import { ART_DIRECTIONS, BACKGROUNDS, ORNAMENTS } from '../creative/variation.js';
import { COMPOSITIONS } from '../creative/composition.js';
import { TYPE_SYSTEMS } from '../creative/typography.js';
import { history } from '../creative/history.js';
import { perceptualSignature } from '../creative/uniqueness.js';
import { rotation } from '../creative/rotation.js';
import { createDailyCopy } from '../creative/captions.js';

const CATEGORIES = ['Services', 'Festivals', 'Hindu deities', 'Special days'];
const today = () => new Date().toISOString().slice(0, 10);

export function Planner({ design, onUse, notify }) {
  const [category, setCategory] = useState(design.topic.category);
  const [subjectId, setSubjectId] = useState(design.topic.id);
  const [direction, setDirection] = useState('');
  const [date, setDate] = useState(today);
  const [scheduled, setScheduled] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [historyTick, setHistoryTick] = useState(0);
  const seen = useRef(new Set());
  const subject = topics.find((t) => t.id === subjectId && t.category === category) || topics[0];
  const pick = useMemo(
    () => rotation.suggest(subject, date, { directionId: direction || undefined }),
    [subject, date, direction, refresh],
  );
  const copy = useMemo(() => (pick ? createDailyCopy(subject, pick, date) : null), [pick, subject, date]);
  const stats = useMemo(() => history.stats(), [historyTick]);
  const preview = pick
    ? {
        ...design,
        topic: subject,
        styleId: pick.id,
        font: fonts[pick.id % fonts.length],
        palette: -1,
        headline: undefined,
        tagline: undefined,
        adjustments: {},
        logoPosition: 'top-left',
      }
    : design;

  // Every generated suggestion joins the persistent history once per day/direction.
  useEffect(() => {
    if (!pick) return;
    const key = `${subject.id}|${date}|${direction}|${pick.id}|${refresh}`;
    if (seen.current.has(key)) return;
    seen.current.add(key);
    history.record({
      subjectId: subject.id,
      subject: subject.name,
      designId: pick.id,
      designName: pick.name,
      composition: pick.compositionId,
      source: 'generated',
      signature: perceptualSignature(document.querySelector('.planner-poster canvas')),
    });
    setHistoryTick((n) => n + 1);
  }, [pick?.id, subject.id, date, direction, refresh]);

  const apply = () => {
    if (!pick) return;
    history.record({
      subjectId: subject.id,
      subject: subject.name,
      designId: pick.id,
      designName: pick.name,
      composition: pick.compositionId,
      source: 'manual',
      signature: perceptualSignature(document.querySelector('.planner-poster canvas')),
    });
    setHistoryTick((n) => n + 1);
    onUse({ ...preview, caption: copy.caption, hashtags: copy.hashtags, scheduledAt: scheduled || null });
    notify(`${pick.name} is ready in the studio.`, {
      label: 'Open studio',
      onClick: () => (window.location.hash = 'studio'),
    });
  };

  return (
    <div className="planner-grid">
      <section className="panel planner-controls">
        <div className="panel-heading">
          <div className="panel-title">
            <span className="header-icon">
              <CalendarDays size={18} />
            </span>
            <h2>Daily content plan</h2>
          </div>
          <span className="format-badge">
            <Clock3 size={13} /> {date}
          </span>
        </div>
        <div className="editor-body">
          <label className="field">
            <span className="field-label">Content collection</span>
            <select
              value={category}
              onChange={(e) => {
                const next = e.target.value;
                const first = topics.find((t) => t.category === next);
                setCategory(next);
                setSubjectId(first?.id || subject.id);
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Subject</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {topics
                .filter((t) => t.category === category)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Creative direction</span>
            <select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">Atelier selection (unused first)</option>
              {ART_DIRECTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Plan for date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Schedule note (never publishes automatically)</span>
            <input
              type="datetime-local"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
            />
          </label>
          <div className="planner-actions">
            <button className="btn primary" onClick={apply} disabled={!pick}>
              <WandSparkles size={15} /> Use in studio
            </button>
            <button className="btn" onClick={() => setRefresh((n) => n + 1)}>
              <RotateCw size={14} /> New suggestion
            </button>
          </div>
          <div className="planner-stats">
            <div>
              <strong>{rotation.remaining(subject)}</strong>
              <span>unused designs for this subject</span>
            </div>
            <div>
              <strong>{stats.generated}</strong>
              <span>generated in this browser</span>
            </div>
            <div>
              <strong>{stats.published}</strong>
              <span>confirmed publications</span>
            </div>
          </div>
          <button
            className="text-btn danger"
            onClick={() => {
              if (window.confirm('Clear all design rotation history from this browser?')) {
                history.reset();
                setRefresh((n) => n + 1);
                setHistoryTick((n) => n + 1);
                notify('Design history cleared. The full library is available again.');
              }
            }}
          >
            <Trash2 size={14} /> Reset rotation history
          </button>
        </div>
      </section>
      <section className="panel planner-result">
        <div className="panel-heading">
          <div className="panel-title">
            <span className="header-icon">
              <Sparkles size={17} />
            </span>
            <h2>{subject.name}</h2>
          </div>
          <span className="format-badge">{pick ? `${pick.id + 1} / 100` : 'No design'}</span>
        </div>
        {pick && (
          <div className="planner-preview">
            <div className="planner-poster">
              <Poster design={preview} small />
            </div>
            <div className="planner-details">
              <div className="eyebrow">{pick.definition.directionId?.toUpperCase()} ART DIRECTION</div>
              <h3>{pick.name}</h3>
              <p>{pick.definition.concept}</p>
              <dl>
                <div>
                  <dt>Composition</dt>
                  <dd>{COMPOSITIONS.find((c) => c.id === pick.compositionId)?.name || 'Classic studio plate'}</dd>
                </div>
                <div>
                  <dt>Typography</dt>
                  <dd>{TYPE_SYSTEMS.find((t) => t.id === pick.typeSystem)?.name || 'Classic editorial'}</dd>
                </div>
                <div>
                  <dt>Background</dt>
                  <dd>{BACKGROUNDS.find((b) => b.id === pick.background)?.name || 'Warm paper tooth'}</dd>
                </div>
                <div>
                  <dt>Decoration</dt>
                  <dd>{ORNAMENTS.find((o) => o.id === pick.ornament)?.name || 'Heritage accent'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        <div className="planner-copy">
          <div className="section-label">
            <label>Caption preview</label>
            <span>{copy?.day || date}</span>
          </div>
          <p>{copy?.caption || ''}</p>
          <strong>{copy?.hashtags || ''}</strong>
        </div>
        <div className="info-note tiny">
          <ShieldCheck size={15} />
          <span>Suggestions are prepared on this device. Publishing still needs your review and an authorized Meta account.</span>
        </div>
      </section>
    </div>
  );
}

const LAYERS = [
  ['background', 'Background', 'Warm paper and constructed fields'],
  ['artwork', 'Artwork', 'Subject-specific illustration or picture'],
  ['headline', 'Headline', 'Display hierarchy and placement'],
  ['support', 'Supporting text', 'Tagline, eyebrow and website rail'],
  ['signature', 'Brand signature', 'Original ASTRO SIVAM lockup'],
];

export function LayerPanel({ design, patch, onUndo, onRedo, canUndo, canRedo, onDuplicate, onQuality, quality }) {
  const [active, setActive] = useState('artwork');
  const adj = design.adjustments || {};
  const setAdjust = (key, value) => patch({ adjustments: { ...adj, [key]: value } });
  const control = (label, value, min, max, step, key, suffix = '') => (
    <label className="field range-field">
      <span className="field-label">
        {label} <em>{value}{suffix}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setAdjust(key, Number(e.target.value))}
      />
    </label>
  );
  return (
    <div className="layer-panel" role="tabpanel">
      <div className="layer-toolbar">
        <button className="btn small" onClick={onUndo} disabled={!canUndo} aria-label="Undo last change">
          <RotateCcw size={14} /> Undo
        </button>
        <button className="btn small" onClick={onRedo} disabled={!canRedo} aria-label="Redo last change">
          <RotateCw size={14} /> Redo
        </button>
        <button className="btn small" onClick={onDuplicate}>
          <CopyPlus size={14} /> Duplicate design
        </button>
      </div>
      <div className="layer-list">
        {LAYERS.map(([id, name, note]) => (
          <button
            key={id}
            className={'layer-row ' + (active === id ? 'active' : '')}
            onClick={() => setActive(id)}
            aria-pressed={active === id}
          >
            <span className="layer-ico">
              {id === 'signature' ? <LockKeyhole size={15} /> : <Layers3 size={15} />}
            </span>
            <span>
              <strong>{name}</strong>
              <small>{note}</small>
            </span>
            {active === id && <Check size={15} />}
          </button>
        ))}
      </div>
      <div className="layer-controls">
        {active === 'background' && (
          <>
            <label className="field">
              <span className="field-label">Background construction</span>
              <select
                value={adj.background || design.definitionBackground || 'auto'}
                onChange={(e) => setAdjust('background', e.target.value === 'auto' ? null : e.target.value)}
              >
                <option value="auto">Composition default</option>
                {BACKGROUNDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="subtle">Paper construction changes the field, never the subject or its artwork.</p>
          </>
        )}
        {active === 'artwork' && (
          <>
            {control('Artwork scale', adj.artScale ?? 1, 0.88, 1.12, 0.01, 'artScale')}
            {control('Artwork X', adj.artX || 0, -40, 40, 2, 'artX')}
            {control('Artwork Y', adj.artY || 0, -40, 40, 2, 'artY')}
            <label className="field">
              <span className="field-label">Focal shape</span>
              <select value={adj.shape || 'auto'} onChange={(e) => setAdjust('shape', e.target.value === 'auto' ? null : e.target.value)}>
                <option value="auto">Composition default</option>
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="arch">Arch</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Decorative system</span>
              <select
                value={adj.ornament || 'auto'}
                onChange={(e) => setAdjust('ornament', e.target.value === 'auto' ? null : e.target.value)}
              >
                <option value="auto">Composition default</option>
                {ORNAMENTS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {(active === 'headline' || active === 'support') && (
          <>
            {control('Text X', adj.textX || 0, -36, 36, 2, 'textX')}
            {control('Text Y', adj.textY || 0, -36, 36, 2, 'textY')}
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={!!adj.guides}
                onChange={(e) => setAdjust('guides', e.target.checked)}
              />
              <ScanEye size={15} /> Show alignment guides
            </label>
            {active === 'headline' && (
              <div className="info-note tiny">
                <Sparkles size={14} />
                <span>Headline copy is edited under Caption &amp; tags. The bundled typeface is chosen in Design.</span>
              </div>
            )}
          </>
        )}
        {active === 'signature' && (
          <>
            <label className="field">
              <span className="field-label">Logo placement</span>
              <select
                value={design.logoPosition || 'top-left'}
                onChange={(e) => patch({ logoPosition: e.target.value })}
              >
                <option value="top-left">Top left (heritage position)</option>
                <option value="top-centre">Top centre</option>
                <option value="top-right">Top right</option>
              </select>
            </label>
            <div className="info-note tiny">
              <ShieldCheck size={15} />
              <span>The original lockup keeps its proportions, clear space and full lettering in every position.</span>
            </div>
          </>
        )}
      </div>
      <div className="quality-card">
        <button className="btn small" onClick={onQuality}>
          <ShieldCheck size={14} /> Check export quality
        </button>
        {quality && (
          <>
            <span className={quality.ok ? 'quality-ok' : 'quality-bad'}>
              {quality.ok ? 'Ready to export' : `${quality.problems.length} item(s) to review`} · {quality.score}/100
            </span>
            <ul>
              {quality.suggestions.slice(0, 4).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
              {!quality.problems.length && <li>Dimensions, assets, copy and brand signature verified.</li>}
            </ul>
          </>
        )}
      </div>
      <label className="field">
        <span className="field-label">Export placement</span>
        <select
          value={design.exportPlacement || 'portrait'}
          onChange={(e) => patch({ exportPlacement: e.target.value })}
        >
          {EXPORT_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} · {f.width} × {f.height}
            </option>
          ))}
        </select>
      </label>
      <button className="text-btn" onClick={() => patch({ adjustments: {} })} disabled={!Object.keys(adj).length}>
        <RotateCcw size={14} /> Reset layer adjustments
      </button>
    </div>
  );
}
