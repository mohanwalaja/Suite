import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Plus,
  Search,
  Download,
  Upload,
  LoaderCircle,
  ChevronRight,
} from 'lucide-react';
import { Modal, Poster } from './Shared';
import pack from '../deity-pack.json';
import { DEITIES, deityTopics, customDeity } from '../art/deities.js';
import { modelFor, picturesFor } from '../art/models.js';
import { matchesTopic, withPicture } from '../catalogue.js';
import { importPictures, discardPictures } from '../local-pictures.js';

// These are real portrait compositions, not square source-image crops. Poster lazily
// renders visible cards with the same transparent brand and layout as the final export.
function Picture({ design, topic, model, sharedTitle }) {
  const preview = withPicture(design, topic, model);
  return (
    <span className="deity-art" style={{ backgroundColor: model.colors[0] }}>
      <Poster design={sharedTitle ? { ...preview, headline: sharedTitle } : preview} small />
    </span>
  );
}

export function DeityLibrary({
  design,
  initialTopic,
  customTopics,
  onApply,
  onSaveCollection,
  onClose,
  restricted = false,
}) {
  const [topic, setTopic] = useState(initialTopic || null),
    [q, setQ] = useState(''),
    [figure, setFigure] = useState('All pictures'),
    [adding, setAdding] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [name, setName] = useState(''),
    [files, setFiles] = useState([]);
  const custom = customTopics.filter((t) => t.category === DEITIES && t.photos?.length);
  const list = [...deityTopics, ...custom].filter((t) => matchesTopic(t, q));
  // A shared Sita–Rama work appears once in the directory, with a button for each subject.
  // In search results a single matching name is presented as a normal collection card.
  const groups = new Map();
  for (const t of topic || adding ? [] : list) {
    const pictures = picturesFor(t),
      cover = pictures[0];
    if (!cover) continue;
    const key = cover.local ? t.id : cover.deityPicture || cover.setting;
    if (!groups.has(key)) groups.set(key, { cover, entries: [] });
    groups.get(key).entries.push({ topic: t, count: pictures.length });
  }
  const pics = topic ? picturesFor(topic) : [];
  const gods = [...new Set(pics.map((m) => m.figure))].filter(Boolean);
  const shown = pics.filter((m) => figure === 'All pictures' || m.figure === figure);
  const selected = modelFor(design.topic, design.styleId);
  const active = (m) =>
    design.topic.id === topic?.id &&
    (m.local
      ? m.local === selected.local
      : (m.deityPicture || m.setting) === (selected.deityPicture || selected.setting));
  const open = (t) => {
    setFigure('All pictures');
    setError('');
    setTopic(t);
  };
  const add = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const photos = await importPictures(files);
      const t = customDeity(name.trim(), photos);
      if (!onSaveCollection(t)) {
        await discardPictures(photos);
        throw Error('Could not save this collection on this device.');
      }
      setAdding(false);
      setName('');
      setFiles([]);
      open(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={
        adding
          ? 'Add your deity pictures'
          : topic
            ? topic.name + ' pictures'
            : 'Hindu deity pictures'
      }
      eyebrow={
        adding
          ? 'YOUR DEVICE LIBRARY'
          : topic
            ? 'CHOOSE A PICTURE'
            : `${deityTopics.length} DEITIES · AI PAINTING LIBRARY`
      }
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      {adding ? (
        <form className="modal-body deity-upload" onSubmit={add}>
          <p>
            Add a deity or regional form with pictures you own or have permission to publish. The
            originals are not sent to a server.
          </p>
          <label className="field">
            <span>Deity name</span>
            <input
              required
              maxLength={55}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name in your tradition"
            />
          </label>
          <label className="field">
            <span>Choose pictures</span>
            <input
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                setFiles(Array.from(e.target.files || []));
                setError('');
              }}
            />
          </label>
          <small>Choose up to 12 JPG, PNG or WebP files at once. Saved in this browser only.</small>
          {error && <p role="alert">{error}</p>}
          <div className="deity-actions">
            <button type="button" className="btn" disabled={busy} onClick={() => setAdding(false)}>
              Back
            </button>
            <button className="btn primary" disabled={busy || !name.trim() || !files.length}>
              {busy ? <LoaderCircle size={15} className="spin" /> : <Upload size={15} />}Save
              collection
            </button>
          </div>
        </form>
      ) : topic ? (
        <>
          <div className="deity-toolbar">
            {!restricted && (
              <button
                className="text-btn"
                onClick={() => {
                  setTopic(null);
                  setFigure('All pictures');
                }}
              >
                <ArrowLeft size={15} />
                All deities
              </button>
            )}
            <span>
              {pics.length} {topic.photos ? 'device picture' : 'AI painting'}
              {pics.length !== 1 ? 's' : ''} · Tap to apply
            </span>
          </div>
          {gods.length > 1 && (
            <div className="filter-pills deity-filters" aria-label="Filter by deity">
              {['All pictures', ...gods].map((f) => (
                <button
                  key={f}
                  aria-pressed={figure === f}
                  className={figure === f ? 'active' : ''}
                  onClick={() => setFigure(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <div
            className={'deity-grid picture-grid' + (shown.length === 1 ? ' single' : '')}
            key={topic.id + figure}
          >
            {shown.map((m) => (
              <button
                key={m.key}
                className="deity-card"
                aria-label={'Use picture: ' + m.name}
                aria-pressed={active(m)}
                onClick={() => onApply(topic, m)}
              >
                <Picture design={design} topic={topic} model={m} />
                <span className="deity-text">
                  <small>{m.local ? 'My picture' : 'AI painting'}</small>
                  <strong>{m.name}</strong>
                </span>
                {active(m) && <Check className="deity-check" size={18} />}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="deity-toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Search deities"
                placeholder="Search Ganesh, Balaji, शिव…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <button className="btn add-deity" onClick={() => setAdding(true)}>
              <Plus size={15} />
              Add my pictures
            </button>
          </div>
          <div className="deity-grid" key="directory">
            {Array.from(groups, ([key, { cover, entries }]) => {
              const links = entries.map(({ topic: t, count }) => ({
                t,
                count,
                label: 'Browse ' + t.name + ' pictures' + (t.photos ? ' on this device' : ''),
              }));
              if (links.length > 1)
                return (
                  <div key={key} className="deity-card shared-painting">
                    <Picture
                      design={design}
                      topic={links[0].t}
                      model={cover}
                      sharedTitle={links.map(({ t }) => t.name).join(' & ')}
                    />
                    <small>One shared painting</small>
                    {links.map(({ t, label }) => (
                      <button key={t.id} onClick={() => open(t)} aria-label={label}>
                        <strong>{t.name}</strong>
                        <span lang="hi">{t.hindi}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                );
              const [{ t, count, label }] = links;
              return (
                <button key={key} className="deity-card" aria-label={label} onClick={() => open(t)}>
                  <Picture design={design} topic={t} model={cover} />
                  <span className="deity-text">
                    <small>
                      {count} {t.photos ? 'device picture' : 'AI painting'}
                      {count !== 1 ? 's' : ''}
                    </small>
                    <strong>{t.name}</strong>
                    {t.hindi && <span lang="hi">{t.hindi}</span>}
                  </span>
                  <ChevronRight size={15} className="deity-arrow" />
                </button>
              );
            })}
            {!list.length && (
              <p className="deity-empty">
                No matching deity. Try another spelling, or use <strong>Add my pictures</strong> for
                a regional form.
              </p>
            )}
          </div>
        </>
      )}
      {!topic && !adding && (
        <div className="deity-download">
          <div>
            <strong>All {pack.collections} deity collections</strong>
            <small>
              {pack.pictures} portrait JPEG posters · ZIP · {(pack.bytes / 1e6).toFixed(1)} MB
            </small>
          </div>
          <a
            href={`${pack.url}?revision=${pack.revision}`}
            download="ASTRO-SIVAM-Deity-Posters-Portrait.zip"
            className="btn"
            aria-label="Download all deity posters as a ZIP"
          >
            <Download size={15} />
            Download all
          </a>
        </div>
      )}
    </Modal>
  );
}
