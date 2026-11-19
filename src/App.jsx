import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  PanelsTopLeft,
  Images,
  Send,
  SwatchBook,
  Link2,
  ChevronRight,
  ArrowUpRight,
  Bookmark,
  Plus,
  Sparkles,
  LayoutGrid,
  Menu,
  X,
  BookOpen,
  Check,
  ScanEye,
  SlidersHorizontal,
  Layers3,
  Download,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { MetaIcon, Modal, Poster } from './components/Shared';
import { DeityLibrary } from './components/DeityPictures';
import { DEITIES } from './art/deities.js';
import { Studio, TopicPicker, StyleGallery } from './components/Studio';
import {
  Library,
  BrandKit,
  Accounts,
  History,
  SetupGuide,
  PublishDialog,
} from './components/Workspace';
import { modelFor } from './art/models.js';
import { styles, fonts, topics, newDesign, createCopy, withPicture } from './catalogue';
import { BRAND, PORTRAIT, normalizeDesign } from '../shared/poster-spec.js';
import { exportPoster, download } from './poster';
import { load, store, api, uid } from './storage';
const pages = {
  studio: {
    name: 'Poster Studio',
    desc: 'Create on-brand content for Instagram and Facebook.',
    icon: PanelsTopLeft,
    kicker: 'CREATIVE WORKSPACE',
  },
  library: {
    name: 'Content Library',
    desc: 'Your saved posters, ready for their next chapter.',
    icon: Images,
    kicker: 'YOUR COLLECTION',
  },
  history: {
    name: 'Publish History',
    desc: 'A record of the posts you’ve shared with your community.',
    icon: Send,
    kicker: 'SOCIAL PUBLISHING',
  },
  brand: {
    name: 'Brand Kit',
    desc: 'One consistent identity, sourced from astrosivam.com.',
    icon: SwatchBook,
    kicker: 'BRAND WORKSPACE',
  },
  accounts: {
    name: 'Meta Accounts',
    desc: 'Manage the social channels connected to your studio.',
    icon: Link2,
    kicker: 'WORKSPACE CONNECTIONS',
  },
};
const getPage = () =>
  pages[window.location.hash.slice(1)] ? window.location.hash.slice(1) : 'studio';
function storedDesign() {
  const d = load('current', null);
  return d?.topic?.name && styles[d.styleId] && typeof d.caption === 'string'
    ? normalizeDesign(d)
    : newDesign();
}
function storedDrafts() {
  const previous = load('drafts', []);
  if (!Array.isArray(previous)) return [];
  let changed = false;
  const drafts = previous.map((record) => {
    const design = normalizeDesign(record.design);
    if (design === record.design) return record;
    changed = true;
    return { ...record, design };
  });
  if (changed) {
    // Keep the migration in memory even if this device cannot write to storage.
    try {
      store('drafts', drafts);
    } catch {
      /* Read-only device storage. */
    }
  }
  return drafts;
}
function Sidebar({ page, navigate, open, onClose, onHelp, drafts }) {
  const side = useRef(null);
  const [narrow, setNarrow] = useState(() => matchMedia('(max-width:900px)').matches);
  useEffect(() => {
    const q = matchMedia('(max-width:900px)');
    const listener = (e) => setNarrow(e.matches);
    q.addEventListener('change', listener);
    return () => q.removeEventListener('change', listener);
  }, []);
  useEffect(() => {
    if (!open || !narrow) return;
    const previous = document.activeElement;
    side.current?.querySelector('.mobile-close')?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const targets = [...side.current.querySelectorAll('a,button')].filter(
        (el) => el.offsetParent !== null,
      );
      if (e.shiftKey && document.activeElement === targets[0]) {
        e.preventDefault();
        targets.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === targets.at(-1)) {
        e.preventDefault();
        targets[0]?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, narrow]);
  const nav = (id) => {
    const Icon = pages[id].icon;
    return (
      <button
        key={id}
        className={'nav-item ' + (id === page ? 'active' : '')}
        aria-current={id === page ? 'page' : undefined}
        onClick={() => navigate(id)}
      >
        <Icon size={18} strokeWidth={1.65} />
        <span>{pages[id].name}</span>
        {id === 'library' && drafts > 0 && <small>{drafts}</small>}
      </button>
    );
  };
  return (
    <>
      {open && <div className="nav-backdrop" onClick={onClose} />}
      <aside
        ref={side}
        inert={narrow && !open ? true : undefined}
        aria-hidden={narrow && !open ? true : undefined}
        role={narrow && open ? 'dialog' : undefined}
        aria-modal={narrow && open ? true : undefined}
        className={'sidebar ' + (open ? 'open' : '')}
        aria-label="Main navigation"
      >
        <button
          className="brand-home"
          aria-label="ASTRO SIVAM home"
          onClick={() => navigate('studio')}
        >
          <img className="sidebar-wordmark" src={BRAND.logo} alt="ASTRO SIVAM · Vedic Astrology" />
          <span className="suite-descriptor">MARKETING SUITE</span>
        </button>
        <button className="mobile-close icon-btn" aria-label="Close navigation" onClick={onClose}>
          <X size={19} />
        </button>
        <div className="side-rule" />
        <div className="nav-group">
          <div className="nav-heading">STUDIO</div>
          {['studio', 'library', 'history'].map(nav)}
        </div>
        <div className="nav-group second">
          <div className="nav-heading">WORKSPACE</div>
          {['brand', 'accounts'].map(nav)}
        </div>
        <div className="sidebar-bottom">
          <div className="brand-space">
            <div className="orbit-decoration">
              <i />
              <i />
              <i />
              <b>✧</b>
            </div>
            <span className="brand-space-kicker">
              <span /> BRAND SPACE
            </span>
            <h3>{BRAND.name}</h3>
            <a href="https://astrosivam.com" target="_blank" rel="noreferrer">
              astrosivam.com <ArrowUpRight size={12} />
            </a>
          </div>
          <button className="help-link" onClick={onHelp}>
            <BookOpen size={16} /> Studio guide <ChevronRight size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}
export default function App() {
  const [page, setPage] = useState(getPage);
  const [design, setDesign] = useState(storedDesign);
  const [drafts, setDrafts] = useState(storedDrafts);
  const [history, setHistory] = useState(() => load('published', []));
  const [customTopics, setCustomTopics] = useState(() => load('occasions', []));
  const [modal, setModal] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [meta, setMeta] = useState({ configured: false, connected: false, pages: [] });
  const toastTimer = useRef();
  const mainRef = useRef(null);
  const notify = useCallback((text, action) => {
    setToast({ text, action });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4300);
  }, []);
  const persist = (key, value) => {
    try {
      store(key, value);
      return true;
    } catch {
      notify('Device storage is full or unavailable. Download a copy before leaving.');
      return false;
    }
  };
  const navigate = useCallback((id) => {
    setPage(id);
    setModal(null);
    setNavOpen(false);
    if (getPage() !== id) window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  const refresh = useCallback(async () => {
    try {
      setMeta(await api('/meta/status'));
    } catch {
      notify('Meta connection status could not be loaded. Check your network.');
    }
  }, [notify]);
  useEffect(() => {
    refresh();
    const result = new URLSearchParams(location.search).get('meta');
    if (result) {
      navigate('accounts');
      const messages = {
        connected: 'Meta connected. Your authorized channels are ready.',
        cancelled: 'Connection cancelled. Nothing was published.',
        expired: 'Your connection request expired. Please try again.',
        'no-pages': 'No managed Facebook Pages were authorized. Check your Page access.',
        failed: 'Meta could not finish the connection. Check the app setup and try again.',
      };
      notify(messages[result] || 'Meta connection updated.');
      window.history.replaceState(null, '', location.pathname + '#accounts');
    }
    const change = () => {
      setPage(getPage());
      setNavOpen(false);
      setModal(null);
    };
    window.addEventListener('hashchange', change);
    return () => {
      window.removeEventListener('hashchange', change);
      clearTimeout(toastTimer.current);
    };
  }, [refresh, navigate, notify]);
  useEffect(() => {
    document.title = pages[page].name + ' · ' + BRAND.name;
  }, [page]);
  useEffect(() => {
    // Only metadata is written here (picture blobs live in IndexedDB). Write immediately so a
    // phone reload just after Save draft cannot restore the previously selected picture.
    try {
      store('current', design);
    } catch {
      notify('Your working poster could not be saved on this device.');
    }
  }, [design, notify]);
  useEffect(() => {
    if (!navOpen) return;
    const key = (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', key);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = old;
    };
  }, [navOpen]);
  useEffect(() => {
    if (page !== 'history') return;
    api('/publishing/history')
      .then(({ posts }) => {
        if (posts?.length)
          setHistory((prev) => {
            const m = new Map([...prev, ...posts].map((p) => [p.channel + p.id, p]));
            const n = [...m.values()].sort((a, b) => b.date.localeCompare(a.date));
            try {
              store('published', n);
            } catch {}
            return n;
          });
      })
      .catch(() => {});
  }, [page]);
  const patch = useCallback((obj) => setDesign((d) => ({ ...d, ...obj })), []);
  function pickTopic(t) {
    if (t.id !== design.topic.id)
      patch({
        topic: t,
        styleId: 0,
        font: design.font === fonts[design.styleId] ? fonts[0] : design.font,
        headline: undefined,
        tagline: undefined,
        ...createCopy(t),
      });
    setModal(null);
  }
  function applyPicture(t, m) {
    setDesign((d) => withPicture(d, t, m));
    setModal(null);
    if (matchMedia('(max-width:700px)').matches)
      requestAnimationFrame(() =>
        document.getElementById('preview')?.scrollIntoView({ block: 'start' }),
      );
  }
  function saveCollection(t) {
    const next = [t, ...customTopics.filter((v) => v.id !== t.id)];
    if (!persist('occasions', next)) return false;
    setCustomTopics(next);
    return true;
  }
  function pickStyle(s) {
    if (s.id !== design.styleId) patch({ styleId: s.id, font: fonts[s.id], palette: -1 });
    setModal(null);
  }
  function newPoster() {
    setDesign(newDesign());
    navigate('studio');
  }
  function saveDraft() {
    const id = design.draftId || uid();
    const d = { ...design, draftId: id };
    const rec = { id, design: d, savedAt: new Date().toISOString() };
    const next = [rec, ...drafts.filter((v) => v.id !== id)];
    if (persist('drafts', next)) {
      setDrafts(next);
      setDesign(d);
      notify('Draft saved to your Content Library.', {
        label: 'View',
        onClick: () => navigate('library'),
      });
    }
  }
  async function exportImage() {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await exportPoster(design, 'image/png');
      download(
        blob,
        `ASTRO-SIVAM-${design.topic.name.replace(/[^\p{L}\p{N}]+/gu, '-')}-${modelFor(design.topic, design.styleId).name.replaceAll(' ', '-')}.png`,
      );
      notify('Your high-resolution poster is ready to download.');
    } catch (e) {
      notify(e.message || 'The poster could not be exported. Please try again.');
    } finally {
      setDownloading(false);
    }
  }
  const jump = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const publishSuccess = (posts) => {
    if (!posts.length) return;
    const unique = new Map([...posts, ...history].map((p) => [p.channel + p.id, p]));
    const next = [...unique.values()];
    setHistory(next);
    persist('published', next);
  };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current.focus();
        }}
      >
        Skip to workspace
      </a>
      <Sidebar
        page={page}
        navigate={navigate}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onHelp={() => {
          setNavOpen(false);
          setModal('guide');
        }}
        drafts={drafts.length}
      />
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <LayoutGrid size={16} />
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{pages[page].name}</strong>
          </div>
          <div className="mobile-brand">
            <button
              className="icon-btn"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <img className="mobile-wordmark" src={BRAND.logo} alt="ASTRO SIVAM · Vedic Astrology" />
          </div>
          <div className="topbar-actions">
            <button
              className={'meta-connect ' + (meta.connected ? 'is-connected' : '')}
              onClick={() => navigate('accounts')}
            >
              <MetaIcon size={21} />
              <span>{meta.connected ? 'Meta connected' : 'Connect Meta'}</span>
              {meta.connected && <span className="status-dot" />}
            </button>
            <i />
            <button
              className="avatar"
              title="Open brand workspace"
              aria-label="Open brand workspace"
              onClick={() => navigate('brand')}
            >
              <img src={BRAND.icon} alt="" />
            </button>
          </div>
        </header>
        <main className="workspace" id="main-content" tabIndex={-1} ref={mainRef}>
          <div className="page-intro">
            <div>
              <div className="eyebrow">
                <Sparkles size={13} strokeWidth={1.8} />
                {pages[page].kicker}
              </div>
              <h1>{pages[page].name}</h1>
              <p>{pages[page].desc}</p>
            </div>
            {page === 'studio' ? (
              <div className="page-actions">
                <button className="btn save-btn" onClick={saveDraft}>
                  <Bookmark size={15} /> Save draft
                </button>
                <button className="btn primary" onClick={() => setModal('publish')}>
                  <Send size={15} /> Publish post
                </button>
              </div>
            ) : page === 'library' ? (
              <button className="btn primary" onClick={newPoster}>
                <Plus size={16} /> New poster
              </button>
            ) : null}
          </div>
          {page === 'studio' && (
            <Studio
              design={design}
              patch={patch}
              notify={notify}
              onPickTopic={() => setModal(design.topic.category === DEITIES ? 'deities' : 'topics')}
              onPictures={() => setModal('pictures')}
              onCategory={(n) => {
                if (n === DEITIES) {
                  setModal('deities');
                  return;
                }
                if (design.topic.category !== n) pickTopic(topics.find((t) => t.category === n));
              }}
              onStyle={pickStyle}
              onGallery={() => setModal('styles')}
              onExpand={() => setModal('preview')}
              onDownload={exportImage}
              downloading={downloading}
            />
          )}
          {page === 'library' && (
            <Library
              drafts={drafts}
              onOpen={(d) => {
                setDesign({ ...d.design, draftId: d.id });
                navigate('studio');
              }}
              onNew={newPoster}
              onDelete={(id) => {
                const next = drafts.filter((d) => d.id !== id);
                if (persist('drafts', next)) {
                  setDrafts(next);
                  if (design.draftId === id) patch({ draftId: null });
                  notify('Draft removed from your library.');
                }
              }}
            />
          )}
          {page === 'accounts' && (
            <Accounts
              meta={meta}
              refresh={refresh}
              notify={notify}
              onSetup={() => setModal('setup')}
            />
          )}
          {page === 'brand' && <BrandKit />}
          {page === 'history' && <History posts={history} onStudio={() => navigate('studio')} />}
        </main>
      </div>
      {page === 'studio' && (
        <nav className="mobile-studio-bar" aria-label="Mobile studio shortcuts">
          {[
            { name: 'Preview', icon: ScanEye, id: 'preview' },
            { name: 'Customize', icon: SlidersHorizontal, id: 'customize' },
            { name: 'God pictures', icon: Images, id: 'deities' },
            { name: 'Models', icon: Layers3, id: 'styles' },
            { name: 'Publish', icon: Send, id: 'publish' },
          ].map(({ name, icon: Icon, id }) => (
            <button
              key={id}
              onClick={() =>
                id === 'publish'
                  ? setModal('publish')
                  : id === 'styles' || id === 'deities'
                    ? setModal(id)
                    : jump(id)
              }
              className={id === 'publish' ? 'publish-shortcut' : ''}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
      )}
      {(modal === 'deities' || modal === 'pictures') && (
        <DeityLibrary
          key={modal}
          design={design}
          customTopics={customTopics}
          initialTopic={modal === 'pictures' ? design.topic : null}
          restricted={modal === 'pictures' && design.topic.category !== DEITIES}
          onApply={applyPicture}
          onSaveCollection={saveCollection}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'topics' && (
        <TopicPicker
          design={design}
          customTopics={customTopics}
          onPick={pickTopic}
          onClose={() => setModal(null)}
          onCustom={(t) => {
            const existing = topics.find((v) => v.id === t.id);
            if (existing) {
              pickTopic(existing);
              return;
            }
            const next = [t, ...customTopics.filter((v) => v.id !== t.id)];
            if (persist('occasions', next)) {
              setCustomTopics(next);
              pickTopic(t);
            }
          }}
        />
      )}
      {modal === 'styles' && (
        <StyleGallery design={design} onStyle={pickStyle} onClose={() => setModal(null)} />
      )}
      {modal === 'preview' && (
        <Modal
          title="Poster preview"
          eyebrow={modelFor(design.topic, design.styleId).name.toUpperCase()}
          onClose={() => setModal(null)}
          className="enlarged-modal"
        >
          <div className="large-poster">
            <Poster design={design} />
          </div>
          <div className="modal-foot">
            <span>
              {PORTRAIT.name} · {PORTRAIT.ratio}
            </span>
            <button className="btn small" disabled={downloading} onClick={exportImage}>
              <Download size={14} /> Download PNG
            </button>
          </div>
        </Modal>
      )}
      {modal === 'publish' && (
        <PublishDialog
          design={design}
          meta={meta}
          onClose={() => setModal(null)}
          onConnect={() => navigate('accounts')}
          onSuccess={publishSuccess}
          onDownload={exportImage}
          notify={notify}
        />
      )}
      {modal === 'setup' && <SetupGuide onClose={() => setModal(null)} />}
      {modal === 'guide' && (
        <Modal
          title="A quick studio guide"
          eyebrow="WELCOME TO ASTRO SIVAM"
          onClose={() => setModal(null)}
        >
          <div className="modal-body">
            <ol className="step-list">
              <li>
                <span>1</span>
                <div>
                  <strong>Choose your subject</strong>
                  <p>
                    Select a service, Indian festival, Hindu deity, or special day. Add a custom
                    occasion if yours isn’t listed.
                  </p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Make it yours</strong>
                  <p>
                    Browse 50 portrait designs and customize the palette and typeface. Every poster
                    is 1080 × 1350, with the original ASTRO SIVAM logo and lettering directly on the
                    artwork.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Review the words</strong>
                  <p>
                    Open Caption & tags to personalize the suggested post copy, or copy it for
                    another channel.
                  </p>
                </div>
              </li>
              <li>
                <span>4</span>
                <div>
                  <strong>Save, download, or publish</strong>
                  <p>
                    Save drafts on this device, download a full-resolution PNG, or connect Meta and
                    publish to your selected channels.
                  </p>
                </div>
              </li>
            </ol>
            <button
              className="btn primary"
              onClick={() => {
                setModal(null);
                navigate('studio');
              }}
            >
              Open the studio <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          <span>{toast.text}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action.onClick();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button aria-label="Dismiss notification" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
