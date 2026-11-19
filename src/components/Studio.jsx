import { PORTRAIT } from '../../shared/poster-spec.js';
import React, { useState, useRef, useEffect } from 'react';
import {
  RectangleVertical,
  Maximize2,
  Download,
  SlidersHorizontal,
  Palette,
  Type,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Layers3,
  ArrowRight,
  ScanLine,
  Search,
  Plus,
  RotateCcw,
  Copy,
  ShieldCheck,
  LockKeyhole,
  Hash,
  LetterText,
  Images,
  LoaderCircle,
} from 'lucide-react';
import { Poster, Modal, ModelCard, categoryIcons } from './Shared';
import { LayerPanel } from './Creative.jsx';
import { modelsFor, modelFor, collectionInfo, picturesFor } from '../art/models.js';
import {
  categories,
  topics,
  styles,
  fonts,
  paletteOptions,
  makeOccasion,
  createCopy,
  getPalette,
  matchesTopic,
} from '../catalogue';
export function TopicPicker({ design, customTopics, onPick, onCustom, onClose }) {
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const all = [...topics, ...customTopics].filter(
    (t) => t.category === design.topic.category && matchesTopic(t, q),
  );
  const label =
    design.topic.category === 'Services'
      ? 'service'
      : design.topic.category === 'Festivals'
        ? 'festival'
        : 'special day';
  const Icon = categoryIcons[design.topic.category];
  return (
    <Modal title={`Choose a ${label}`} eyebrow="CONTENT COLLECTION" onClose={onClose}>
      <div className="modal-body">
        <label className="search-box">
          <Search size={17} />
          <input
            placeholder={`Search ${design.topic.category.toLowerCase()}…`}
            aria-label="Search topics"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="topic-list">
          {all.map((t) => (
            <button
              key={t.id}
              className={'topic-option ' + (design.topic.id === t.id ? 'chosen' : '')}
              onClick={() => onPick(t)}
            >
              <span className="topic-ico">
                <Icon size={17} />
              </span>
              <span>
                <strong>{t.name}</strong>
                <small>{t.eyebrow}</small>
              </span>
              {design.topic.id === t.id && <Check size={17} />}
            </button>
          ))}
          {!all.length && (
            <p className="subtle">
              No matching topics. Try another search
              {label === 'service' ? '.' : ' or add your own below.'}
            </p>
          )}
        </div>
        {label !== 'service' && (
          <div className="custom-topic">
            {custom ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = customName.trim();
                  if (n) onCustom(makeOccasion(n, design.topic.category));
                }}
              >
                <input
                  required
                  maxLength={55}
                  autoFocus
                  placeholder="Occasion name"
                  aria-label="Custom occasion name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <button className="btn primary" type="submit">
                  Create
                </button>
              </form>
            ) : (
              <button className="text-btn" onClick={() => setCustom(true)}>
                <Plus size={15} /> Add a custom {label}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
export function StyleGallery({ design, onStyle, onClose }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All models');
  const [directionFilter, setDirectionFilter] = useState('All directions');
  const models = modelsFor(design.topic),
    info = collectionInfo(design.topic);
  const filters = ['All models', ...new Set(models.map((m) => m.medium))];
  const directions = ['All directions', ...new Set(models.map((m) => m.directionId || 'editorial'))];
  const list = models.filter(
    (m) =>
      (filter === 'All models' || m.medium === filter) &&
      (directionFilter === 'All directions' || m.directionId === directionFilter) &&
      [
        m.name,
        m.detail,
        m.composition,
        m.figure,
        m.companion,
        fonts[m.id % fonts.length],
        m.definition?.concept || '',
        m.definition?.artDirection || '',
        String(m.id + 1).padStart(2, '0'),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <Modal
      title={info.name}
      eyebrow={`${design.topic.name.toUpperCase()} · ${models.length} POSTER DESIGNS`}
      onClose={onClose}
      wide
    >
      <div className="gallery-tools">
        <label className="field direction-filter">
          <span className="field-label">Art direction</span>
          <select value={directionFilter} onChange={(e) => setDirectionFilter(e.target.value)}>
            {directions.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="search-box">
          <Search size={17} />
          <input
            placeholder={
              models.some((m) => m.figure)
                ? 'Search a deity, motif or model…'
                : 'Search a motif, model or typeface…'
            }
            aria-label="Search models"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="filter-pills">
          {filters.map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="gallery-list">
        {list.map((s) => (
          <ModelCard
            key={s.id}
            model={s}
            design={design}
            selected={s.id === design.styleId}
            onClick={() => onStyle(s)}
          />
        ))}
        {!list.length && (
          <p className="subtle">No matching models. Try another motif or clear the search.</p>
        )}
      </div>
    </Modal>
  );
}
function PaletteLibrary({ design, onPick, onClose }) {
  const [q, setQ] = useState('');
  const list = styles.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal title="Palette library" eyebrow="50 CURATED COLOR PALETTES" onClose={onClose}>
      <div className="modal-body">
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Find a palette…"
            aria-label="Search palettes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="palette-library">
          {list.map((s) => (
            <button
              key={s.id}
              className={design.palette === s.id + paletteOptions.length ? 'chosen' : ''}
              onClick={() => onPick(s.id + paletteOptions.length)}
              aria-label={'Apply ' + s.name + ' palette'}
            >
              <span className="color-ribbon">
                {s.colors.map((c) => (
                  <i key={c} style={{ backgroundColor: c }} />
                ))}
              </span>
              <strong>{s.name}</strong>
              <small>{s.light ? 'Light' : 'Dark'} palette</small>
            </button>
          ))}
          {!list.length && <p className="subtle">No palettes found.</p>}
        </div>
      </div>
    </Modal>
  );
}
export function CopyEditor({ design, patch, notify }) {
  const reset = () => {
    patch(createCopy(design.topic));
    notify('Website-based post copy restored.');
  };
  return (
    <div className="copy-editor">
      <div className="section-label">
        <label htmlFor="caption">Post caption</label>
        <button
          className="small-tool"
          onClick={reset}
          title="Restore suggested caption and hashtags"
        >
          <RotateCcw size={13} /> Restore
        </button>
      </div>
      <textarea
        id="caption"
        maxLength={2200}
        rows={5}
        value={design.caption}
        onChange={(e) => patch({ caption: e.target.value })}
      />
      <div className="section-label">
        <label htmlFor="hashtags">Hashtags</label>
        <Hash size={13} />
      </div>
      <textarea
        id="hashtags"
        className="hashtags-input"
        rows={2}
        maxLength={800}
        value={design.hashtags}
        onChange={(e) => patch({ hashtags: e.target.value })}
      />
      <div className="copy-meta">
        <span
          className={(design.caption + '\n\n' + design.hashtags).length > 2200 ? 'warning' : ''}
        >
          {(design.caption + '\n\n' + design.hashtags).length.toLocaleString()} / 2,200 characters
        </span>
        <button
          className="small-tool"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                [design.caption, design.hashtags].filter(Boolean).join('\n\n'),
              );
              notify('Caption and hashtags copied.');
            } catch {
              notify('Copy is unavailable. Select the caption text to copy it.');
            }
          }}
        >
          <Copy size={13} /> Copy
        </button>
      </div>
      <details className="poster-wording">
        <summary>
          <Type size={14} /> Poster wording <ChevronDown size={12} />
        </summary>
        <label className="field">
          <span className="field-label">Poster headline</span>
          <input
            maxLength={55}
            value={design.headline ?? design.topic.name}
            onChange={(e) => patch({ headline: e.target.value })}
          />
        </label>
        <p className="subtle english-note">All poster wording is in English. Hindi names remain searchable in the deity directory.</p>
        <label className="field">
          <span className="field-label">Poster tagline</span>
          <input
            maxLength={85}
            value={design.tagline ?? design.topic.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </label>
      </details>
      <div className="info-note tiny">
        <Sparkles size={15} />
        <span>Your caption and hashtags travel with your post when you publish.</span>
      </div>
    </div>
  );
}
export function Studio({
  design,
  patch,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDuplicate,
  onQuality,
  quality,
  onCategory,
  onStyle,
  onPickTopic,
  onGallery,
  onPictures,
  onDownload,
  onExpand,
  notify,
  downloading,
}) {
  const [tab, setTab] = useState('Design');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const st = modelFor(design.topic, design.styleId);
  const pictureCount = picturesFor(design.topic).length;
  const models = modelsFor(design.topic),
    info = collectionInfo(design.topic);
  const rail = useRef(null);
  useEffect(() => {
    if (rail.current) {
      const selected = rail.current.children[st.id];
      if (selected) rail.current.scrollLeft = selected.offsetLeft - 3;
    }
  }, [design.topic.id, st.id]);
  const turnRail = (dir) =>
    rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.86, behavior: 'smooth' });
  const SelectIcon = categoryIcons[design.topic.category];
  const paletteName = getPalette(design).name;

  return (
    <>
      <div className="studio-grid">
        <section className="panel preview-panel" id="preview">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="header-icon">
                <ScanLine size={18} />
              </span>
              <h2>Poster preview</h2>
            </div>
            <span className="format-badge" title="Poster format for Instagram and Facebook">
              <RectangleVertical size={13} aria-hidden="true" />
              {PORTRAIT.name} · {PORTRAIT.ratio}
            </span>
          </div>
          <div className="canvas-stage">
            <div
              className="canvas-mat"
              style={{ aspectRatio: `${PORTRAIT.width} / ${PORTRAIT.height}` }}
            >
              <Poster design={design} />
            </div>
          </div>
          <div className="preview-foot">
            <div className="live-label">
              <span className="status-dot" />
              Live preview
            </div>
            <span className="dimensions">
              {PORTRAIT.width} × {PORTRAIT.height} px
            </span>
            <span className="foot-actions">
              <button
                className="icon-btn"
                disabled={downloading}
                onClick={onDownload}
                title="Download poster"
                aria-label="Download poster"
              >
                {downloading ? <LoaderCircle size={15} className="spin" /> : <Download size={15} />}
              </button>
              <button
                className="icon-btn"
                onClick={onExpand}
                title="Expand preview"
                aria-label="Expand preview"
              >
                <Maximize2 size={15} />
              </button>
            </span>
          </div>
        </section>
        <section className="panel editor-panel" id="customize">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="header-icon">
                <SlidersHorizontal size={17} />
              </span>
              <h2>Post editor</h2>
            </div>
            <span className="editor-kicker">
              <span />
              STUDIO TOOLS
            </span>
          </div>
          <div className="editor-body">
            <div className="editor-tabs" role="tablist" aria-label="Editor controls">
              {[
                { n: 'Design', i: Palette },
                { n: 'Caption & tags', i: LetterText },
                { n: 'Layers', i: Layers3 },
              ].map(({ n, i: Icon }) => (
                <button
                  role="tab"
                  aria-selected={tab === n}
                  className={tab === n ? 'active' : ''}
                  key={n}
                  onClick={() => setTab(n)}
                >
                  <Icon size={14} />
                  {n}
                </button>
              ))}
            </div>
            {tab === 'Design' ? (
              <div className="design-controls" role="tabpanel">
                <div className="control-group">
                  <div className="section-label">Content category</div>
                  <div className="category-options">
                    {categories.map((n) => {
                      const Icon = categoryIcons[n];
                      return (
                        <button
                          key={n}
                          aria-pressed={n === design.topic.category}
                          onClick={() => onCategory(n)}
                          className={n === design.topic.category ? 'active' : ''}
                        >
                          <Icon size={18} strokeWidth={1.65} />
                          <span>{n}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="control-group">
                  <div className="section-label">
                    {design.topic.category === 'Services'
                      ? 'Select service'
                      : design.topic.category === 'Festivals'
                        ? 'Select festival'
                        : design.topic.category === 'Hindu deities'
                          ? 'Select deity'
                          : 'Select special day'}
                  </div>
                  <button className="topic-select" onClick={onPickTopic}>
                    <SelectIcon size={15} />
                    <strong>{design.topic.name}</strong>
                    <ChevronDown size={14} />
                  </button>
                </div>
                {pictureCount > 0 && (
                  <button className="picture-launch" onClick={onPictures}>
                    <Images size={17} />
                    <strong>Choose a deity picture</strong>
                    <span>
                      {pictureCount} {pictureCount === 1 ? 'picture' : 'pictures'}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                )}
                <button className="model-picker" onClick={onGallery}>
                  <Layers3 size={17} />
                  <span>
                    <small>Poster model · {String(st.id + 1).padStart(2, '0')} of {models.length}</small>
                    <strong>{st.name}</strong>
                  </span>
                  <span className="model-browse-label">Browse {models.length}</span>
                  <ChevronRight size={15} />
                </button>
                <div className="controls-divider" />
                <div className="control-group">
                  <div className="section-label">
                    Color palette{' '}
                    <button
                      className="palette-name"
                      title="Explore all 50 color palettes"
                      aria-label="Explore all 50 color palettes"
                      onClick={() => setPaletteOpen(true)}
                    >
                      {paletteName}
                      <ChevronDown size={11} />
                    </button>
                  </div>
                  <div className="palette-choices">
                    {paletteOptions.map((pal, i) => {
                      const current = i === 0 ? design.palette === -1 : design.palette === i;
                      const cs = i === 0 ? st.colors : pal.colors;
                      const name = i === 0 ? st.theme + ' ink' : pal.name;
                      return (
                        <button
                          key={pal.name}
                          className={'palette-chip ' + (current ? 'active' : '')}
                          title={name}
                          aria-label={`Use ${name} palette`}
                          aria-pressed={current}
                          onClick={() => patch({ palette: i === 0 ? -1 : i })}
                        >
                          <span>
                            {cs.map((c, j) => (
                              <i key={j} style={{ backgroundColor: c }} />
                            ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="control-group">
                  <label className="section-label" htmlFor="typeface">
                    Typography
                  </label>
                  <div className="font-select">
                    <span>Aa</span>
                    <select
                      id="typeface"
                      value={design.font}
                      onChange={(e) => patch({ font: e.target.value })}
                    >
                      {fonts.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            ) : tab === 'Layers' ? (
              <LayerPanel
                design={design}
                patch={patch}
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                onDuplicate={onDuplicate}
                onQuality={onQuality}
                quality={quality}
              />
            ) : (
              <div role="tabpanel">
                <CopyEditor design={design} patch={patch} notify={notify} />
              </div>
            )}
          </div>
          <div className="brand-signature-row">
            <div>
              <ShieldCheck size={15} />
              <span>Official brand signature</span>
            </div>
            <span className="locked-indicator">
              <LockKeyhole size={11} /> Always on
            </span>
          </div>
        </section>
      </div>
      <section className="style-section" id="styles">
        <div className="style-heading">
          <div className="style-heading-left">
            <span className="section-symbol">
              <Layers3 size={20} />
            </span>
            <div>
              <div className="title-inline">
                <h2>{info.name}</h2>
                <span className="count-pill">{models.length} designs</span>
              </div>
              <p>{info.description}</p>
            </div>
          </div>
          <button className="browse-btn" onClick={onGallery}>
            Browse all <ArrowRight size={15} />
          </button>
        </div>
        <div className="style-strip" ref={rail} aria-label={`${design.topic.name} design models`}>
          {models.map((s) => (
            <ModelCard
              key={s.id}
              model={s}
              design={design}
              selected={s.id === design.styleId}
              onClick={() => onStyle(s)}
            />
          ))}
        </div>
        <div className="model-rail-foot">
          <span>Scroll through all {models.length} designs</span>
          <button className="icon-btn" aria-label="Scroll models back" onClick={() => turnRail(-1)}>
            <ChevronLeft size={16} />
          </button>
          <button
            className="icon-btn"
            aria-label="Scroll models forward"
            onClick={() => turnRail(1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
      {paletteOpen && (
        <PaletteLibrary
          design={design}
          onClose={() => setPaletteOpen(false)}
          onPick={(idx) => {
            patch({ palette: idx });
            setPaletteOpen(false);
          }}
        />
      )}
      <div className="studio-credit">
        <span className="credit-line" />
        <Sparkles size={12} />
        <span>CRAFTED FOR ASTRO SIVAM</span>
        <span className="credit-line" />
      </div>
    </>
  );
}
