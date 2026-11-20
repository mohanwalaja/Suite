import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Image as ImageIcon,
  Trash2,
  ArrowUpRight,
  ArrowRight,
  LibraryBig,
  Instagram,
  Facebook,
  Radio,
  ShieldCheck,
  Link2,
  MapPin,
  Languages,
  BookOpen,
  Check,
  Globe2,
  Send,
  Copy,
  ExternalLink,
  Unplug,
  LoaderCircle,
  Download,
  Info,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  CalendarClock,
  RefreshCw,
  Ban,
} from 'lucide-react';
import { Poster, Modal, MetaIcon } from './Shared';
import { modelFor } from '../art/models.js';
import { SITE, services } from '../catalogue';
import { BRAND, PORTRAIT, POSTER_REVISION } from '../../shared/poster-spec.js';
import { api, uid } from '../storage';
import { exportPoster } from '../poster';
export function Library({ drafts, onOpen, onNew, onDelete }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All posts');
  const [remove, setRemove] = useState(null);
  const list = drafts.filter(
    (d) =>
      (filter === 'All posts' || d.design.topic.category === filter) &&
      (d.design.topic.name + ' ' + modelFor(d.design.topic, d.design.styleId).name)
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="page-tools">
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Search saved posters…"
            aria-label="Search saved posters"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="filter-pills">
          {['All posts', 'Services', 'Festivals', 'Hindu deities', 'Special days'].map((f) => (
            <button className={f === filter ? 'active' : ''} key={f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="draft-grid">
          {list.map((d) => (
            <article className="draft-card" key={d.id}>
              <button
                className="draft-image"
                style={{ aspectRatio: PORTRAIT.ratio.replace(':', '/') }}
                aria-label={`Edit saved ${d.design.topic.name} poster`}
                onClick={() => onOpen(d)}
              >
                <Poster design={d.design} small />
              </button>
              <div className="draft-details">
                <small>
                  {d.design.topic.category} <span>·</span> Draft
                </small>
                <h3>{d.design.topic.name}</h3>
                <p>{modelFor(d.design.topic, d.design.styleId).name}</p>
                {d.design.scheduledAt && (
                  <small className="scheduled-note">
                    Planned {new Date(d.design.scheduledAt).toLocaleString()}
                  </small>
                )}
                <div className="draft-bottom">
                  <button className="text-btn" onClick={() => onOpen(d)}>
                    Edit poster <ArrowRight size={13} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={`Delete ${d.design.topic.name} draft`}
                    onClick={() => setRemove(d)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-symbol">
            <LibraryBig size={30} />
          </span>
          <h2>{drafts.length ? 'No matching posters' : 'Your poster library starts here'}</h2>
          <p>
            {drafts.length
              ? 'Try a different category or search term.'
              : 'Save a draft in Poster Studio and it will be ready to edit here, on this device.'}
          </p>
          <button
            className="btn primary"
            onClick={
              drafts.length
                ? () => {
                    setQ('');
                    setFilter('All posts');
                  }
                : onNew
            }
          >
            {drafts.length ? 'Clear filters' : 'Create a poster'}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      {remove && (
        <Modal title="Delete this draft?" onClose={() => setRemove(null)}>
          <div className="modal-body">
            <p className="subtle">
              “{remove.design.topic.name}” will be removed from this device’s library. Published
              posts are not affected.
            </p>
            <div className="dialog-actions">
              <button className="btn" onClick={() => setRemove(null)}>
                Keep draft
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  onDelete(remove.id);
                  setRemove(null);
                }}
              >
                Delete draft
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export function BrandKit() {
  return (
    <div className="workspace-columns">
      <section className="panel settings-panel">
        <div className="settings-head">
          <span className="section-symbol">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2>Official brand identity</h2>
            <p>One signature, on every poster.</p>
          </div>
        </div>
        <div className="brand-display">
          <img src={BRAND.logo} alt="Official ASTRO SIVAM logo and wordmark" />
        </div>
        <div className="brand-source">
          <span className="source-badge">
            <LockKeyhole size={12} /> Locked identity
          </span>
          <a href={BRAND.logoSource} target="_blank" rel="noreferrer">
            Website original <ArrowUpRight size={13} />
          </a>
        </div>
        <dl className="identity-facts">
          <div>
            <dt>Brand name</dt>
            <dd>{BRAND.name}</dd>
          </div>
          <div>
            <dt>Website signature</dt>
            <dd>
              <a href={BRAND.site} target="_blank" rel="noreferrer">
                {BRAND.website}
              </a>
            </dd>
          </div>
          <div>
            <dt>Poster format</dt>
            <dd>
              {PORTRAIT.name} · {PORTRAIT.ratio} · {PORTRAIT.width} × {PORTRAIT.height}
            </dd>
          </div>
        </dl>
        <div className="info-note">
          <ShieldCheck size={17} />
          <span>
            The original logo and ASTRO SIVAM lettering sit directly on the artwork, without a white
            box. Changing the poster palette or typeface does not replace the signature.
          </span>
        </div>
      </section>
      <section className="panel settings-panel">
        <div className="settings-head">
          <span className="section-symbol">
            <BookOpen size={20} />
          </span>
          <div>
            <h2>Brand reference</h2>
            <p>From the official ASTRO SIVAM website.</p>
          </div>
        </div>
        <p className="body-copy">
          Personalized Vedic astrology reports, prepared by a Chennai-based priest team and
          delivered as a clear PDF.
        </p>
        <div className="fact-list">
          <div>
            <MapPin />
            <span>
              <small>BASED IN</small>Chennai, India
            </span>
          </div>
          <div>
            <Languages />
            <span>
              <small>REPORT LANGUAGES</small>English, Tamil & Hindi
            </span>
          </div>
          <div>
            <Radio />
            <span>
              <small>CALCULATION TRADITION</small>Sidereal · Chitra Paksha Lahiri
            </span>
          </div>
        </div>
        <h3 className="small-heading">Service collection</h3>
        <div className="tag-list">
          {services.slice(0, 8).map((s) => (
            <a href={SITE + s.path} target="_blank" rel="noreferrer" key={s.id}>
              {s.name}
              <ArrowUpRight size={10} />
            </a>
          ))}
        </div>
        <div className="source-footer">
          <Globe2 size={14} />
          <a href={SITE + '/about'} target="_blank" rel="noreferrer">
            About ASTRO SIVAM <ArrowUpRight size={12} />
          </a>
          <a href={SITE + '/services'} target="_blank" rel="noreferrer">
            Service source <ArrowUpRight size={12} />
          </a>
        </div>
      </section>
    </div>
  );
}
export function SetupGuide({ onClose }) {
  return (
    <Modal title="Set up Meta publishing" eyebrow="ACCOUNT CONNECTION" onClose={onClose}>
      <div className="modal-body">
        <div className="info-note">
          <LockKeyhole size={18} />
          <span>
            Publishing needs a Meta app on your live server. Do not enter app secrets into a caption
            or send them in chat.
          </span>
        </div>
        <ol className="step-list">
          <li>
            <span>1</span>
            <div>
              <strong>Prepare your accounts</strong>
              <p>
                Use a Facebook Page you manage. For Instagram, link a professional Instagram account
                to that Page.
              </p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Configure the server</strong>
              <p>
                Set <code>META_APP_ID</code>, <code>META_APP_SECRET</code>, and{' '}
                <code>PUBLIC_BASE_URL</code> in your deployment’s private environment. The base URL
                must be public HTTPS.
              </p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Authorize the connection</strong>
              <p>
                Register <code>/api/meta/callback</code> on your public URL as a valid OAuth
                redirect. Enable the Page and Instagram publishing permissions, then restart the
                server and select Connect Meta.
              </p>
            </div>
          </li>
        </ol>
        <a
          className="btn"
          href="https://developers.facebook.com/apps/"
          target="_blank"
          rel="noreferrer"
        >
          Open Meta for Developers <ExternalLink size={14} />
        </a>
        <p className="field-hint">
          The deployment guide in README.md lists the required permissions and app-review steps.
          Until then, download posters and copy their captions.
        </p>
      </div>
    </Modal>
  );
}
export function Accounts({ meta, refresh, notify, onSetup }) {
  const [disconnect, setDisconnect] = useState(false);
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    try {
      await api('/meta/disconnect', { method: 'POST', body: '{}' });
      await refresh();
      notify('Meta accounts disconnected from this workspace.');
      setDisconnect(false);
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  const connect = () => (meta.configured ? window.location.assign('/api/meta/connect') : onSetup());
  return (
    <div className="accounts-page">
      <div className="connection-banner">
        <div className="big-meta">
          <MetaIcon size={42} />
        </div>
        <div>
          <div className="eyebrow">SOCIAL CONNECTION</div>
          <h2>One workspace. Two channels.</h2>
          <p>
            Connect your Facebook Page and Instagram professional account to publish your poster,
            caption, and hashtags together.
          </p>
        </div>
      </div>
      <div className="channel-grid">
        {['instagram', 'facebook'].map((ch) => {
          const insta = ch === 'instagram';
          const linked = insta ? meta.account?.instagram : meta.connected;
          const Icon = insta ? Instagram : Facebook;
          return (
            <article className="panel channel-card" key={ch}>
              <div className="channel-top">
                <span className={'channel-logo ' + ch}>
                  <Icon size={25} />
                </span>
                <span className={'connection-status ' + (linked ? 'connected' : '')}>
                  <i />
                  {linked ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <h2>{insta ? 'Instagram' : 'Facebook'}</h2>
              <p>
                {linked
                  ? insta
                    ? '@' + meta.account.instagram
                    : meta.account.name
                  : insta
                    ? 'Publish to your professional feed.'
                    : 'Share a photo post to your Page.'}
              </p>
            </article>
          );
        })}
      </div>
      <div className="panel connection-settings">
        <div>
          <h3>{meta.connected ? 'Connected workspace' : 'Connect your Meta accounts'}</h3>
          <p>
            {meta.connected
              ? 'Only the authorized Page below can receive posts.'
              : 'You’ll approve access directly with Meta. Your password stays private.'}
          </p>
        </div>
        {meta.connected ? (
          <button className="btn" onClick={() => setDisconnect(true)}>
            <Unplug size={15} /> Disconnect
          </button>
        ) : (
          <button className="btn primary" onClick={connect}>
            <MetaIcon size={20} /> Connect Meta
          </button>
        )}
      </div>
      {meta.pages?.length > 0 && (
        <label className="field page-account">
          <span className="field-label">Publishing Page</span>
          <select
            value={meta.account?.id || ''}
            onChange={async (e) => {
              try {
                await api('/meta/page', {
                  method: 'POST',
                  body: JSON.stringify({ id: e.target.value }),
                });
                await refresh();
                notify('Publishing Page updated.');
              } catch (err) {
                notify(err.message);
              }
            }}
          >
            {meta.pages.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {!meta.configured && (
        <div className="info-note setup-note">
          <Info size={17} />
          <div>
            <strong>Server setup required</strong>
            <p>Add your Meta app credentials to enable the secure connection.</p>
          </div>
          <button className="text-btn" onClick={onSetup}>
            Setup guide <ArrowRight size={14} />
          </button>
        </div>
      )}
      {disconnect && (
        <Modal title="Disconnect Meta?" onClose={() => !busy && setDisconnect(false)}>
          <div className="modal-body">
            <p className="subtle">
              This removes account tokens from this workspace. Your published posts and saved
              designs stay unchanged.
            </p>
            <div className="dialog-actions">
              <button className="btn" onClick={() => setDisconnect(false)}>
                Cancel
              </button>
              <button className="btn primary" disabled={busy} onClick={remove}>
                Disconnect
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function History({ posts, onStudio }) {
  return posts.length ? (
    <div className="panel history-panel">
      {posts.map((p) => (
        <div key={p.channel + p.id} className="history-row">
          <span className={'channel-logo ' + p.channel}>
            {p.channel === 'instagram' ? <Instagram size={20} /> : <Facebook size={20} />}
          </span>
          <div>
            <strong>{p.title}</strong>
            <p>
              {p.account} · {new Date(p.date).toLocaleString()}
            </p>
            <small>Post ID: {p.id}</small>
          </div>
          <span className="success-badge">
            <Check size={13} /> Published
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-state">
      <span className="empty-symbol">
        <Send size={28} />
      </span>
      <h2>Your publishing record</h2>
      <p>
        Posts appear here once Facebook or Instagram confirms publication. Drafts stay in your
        Content Library.
      </p>
      <button className="btn primary" onClick={onStudio}>
        Open Poster Studio <ArrowRight size={15} />
      </button>
    </div>
  );
}
export function PublishDialog({ design, meta, onClose, onConnect, onSuccess, onDownload, notify }) {
  const [channels, setChannels] = useState(
    meta.connected
      ? meta.account?.instagram
        ? ['instagram', 'facebook']
        : ['facebook']
      : ['instagram', 'facebook'],
  );
  const [busy, setBusy] = useState(false),
    [results, setResults] = useState(null),
    [error, setError] = useState('');
  const [mode, setMode] = useState('now');
  const [localTime, setLocalTime] = useState('');
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  );
  const [scheduled, setScheduled] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const key = useRef(uid());
  const copy = [design.caption.trim(), design.hashtags.trim()].filter(Boolean).join('\n\n');
  const success = results?.every((r) => r.ok);
  async function refreshJobs() {
    if (!meta.connected) return;
    try {
      const r = await api('/schedule');
      setJobs(r.jobs);
      setScheduled((current) => (current ? r.jobs.find((job) => job.id === current.id) || current : null));
      setNotifications(r.notifications);
    } catch {
      // The dialog keeps its last known server state; it never invents a status.
    }
  }
  useEffect(() => {
    refreshJobs();
    const t = setInterval(refreshJobs, 10000);
    return () => clearInterval(t);
  }, [meta.connected]);
  async function publish() {
    if (!meta.connected) {
      onConnect();
      return;
    }
    if (!channels.length) {
      setError('Choose at least one channel.');
      return;
    }
    if (copy.length > 2200) {
      setError('Shorten the caption and hashtags to 2,200 characters before publishing.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const blob = await exportPoster(design);
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const r = await api('/publish', {
        method: 'POST',
        body: JSON.stringify({
          image,
          posterRevision: POSTER_REVISION,
          caption: copy,
          platforms: channels,
          pageId: meta.account.id,
          requestId: key.current,
          title: design.topic.name,
        }),
      });
      setResults(r.results);
      onSuccess(r.results.filter((v) => v.ok));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function schedule() {
    if (!meta.connected) {
      onConnect();
      return;
    }
    if (!channels.length) {
      setError('Choose at least one channel.');
      return;
    }
    if (!localTime) {
      setError('Choose the local date and time for publication.');
      return;
    }
    if (copy.length > 2200) {
      setError('Shorten the caption and hashtags to 2,200 characters before scheduling.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const blob = await exportPoster(design);
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const job = await api('/schedule', {
        method: 'POST',
        body: JSON.stringify({
          image,
          posterRevision: POSTER_REVISION,
          caption: copy,
          platforms: channels,
          pageId: meta.account.id,
          requestId: key.current,
          title: design.topic.name,
          localTime,
          timezone,
        }),
      });
      setScheduled(job);
      await refreshJobs();
      notify(`Server confirmed schedule ${job.status}: ${job.title}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function jobAction(id, action) {
    if (action === 'reconcile' && !window.confirm('Have you checked every destination in Meta? This records your review only; it does not verify or publish the post.')) return;
    try {
      const job = await api(`/schedule/${encodeURIComponent(id)}/${action}`, { method: 'POST', body: JSON.stringify(action === 'reconcile' ? { confirmedReview: true } : {}) });
      setScheduled(job);
      await refreshJobs();
      notify(`Publication job ${job.status}.`);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Modal
      title={
        scheduled
          ? `Server status: ${scheduled.status}`
          : results
            ? success
              ? 'Post published'
              : 'Publishing results'
            : 'Publish your post'
      }
      eyebrow="SOCIAL PUBLISHING"
      onClose={() => !busy && onClose()}
    >
      <div className="modal-body publish-body">
        {results ? (
          <>
            <div className={'result-symbol ' + (success ? 'success' : '')}>
              {success ? <CheckCircle2 size={36} /> : <CircleAlert size={36} />}
            </div>
            {results.map((r) => (
              <div className="publish-result" key={r.channel}>
                <strong>{r.channel === 'instagram' ? 'Instagram' : 'Facebook'}</strong>
                <span>{r.ok ? `Published · ID ${r.id}` : r.error}</span>
              </div>
            ))}
            <div className="dialog-actions">
              {!success && (
                <button
                  className="btn"
                  onClick={() => {
                    setChannels(results.filter((r) => !r.ok).map((r) => r.channel));
                    setResults(null);
                    key.current = uid();
                  }}
                >
                  Review failed channels
                </button>
              )}
              <button className="btn primary" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="publish-summary">
              <div style={{ aspectRatio: PORTRAIT.ratio.replace(':', '/') }}>
                <Poster design={design} />
              </div>
              <span>
                <small>{design.topic.category.toUpperCase()}</small>
                <h3>{design.topic.name}</h3>
                <p>{modelFor(design.topic, design.styleId).name}</p>
                <span className="source-badge">
                  <ImageIcon size={11} /> Official ASTRO SIVAM poster
                </span>
              </span>
            </div>
            <div className="publish-mode" role="group" aria-label="Publication mode">
              <button
                className={mode === 'now' ? 'selected' : ''}
                disabled={busy}
                onClick={() => setMode('now')}
              >
                <Send size={14} /> Now
              </button>
              <button
                className={mode === 'schedule' ? 'selected' : ''}
                disabled={busy}
                onClick={() => setMode('schedule')}
              >
                <CalendarClock size={14} /> Schedule
              </button>
            </div>
            <p className="publish-fineprint">
              The Daily Planner’s schedule note is only a saved draft. This section creates a real
              server-side publication job and reports the status Meta confirms.
            </p>
            <div className="section-label">Post to</div>
            <div className="publish-channels">
              {['instagram', 'facebook'].map((ch) => {
                const blocked = meta.connected && ch === 'instagram' && !meta.account?.instagram;
                const Icon = ch === 'instagram' ? Instagram : Facebook;
                return (
                  <button
                    key={ch}
                    disabled={busy || blocked}
                    title={
                      blocked ? 'Link an Instagram professional account to your Page' : undefined
                    }
                    className={channels.includes(ch) ? 'selected' : ''}
                    onClick={() => {
                      key.current = uid();
                      setChannels((a) => (a.includes(ch) ? a.filter((x) => x !== ch) : [...a, ch]));
                    }}
                  >
                    <Icon size={17} />
                    {ch === 'instagram' ? 'Instagram' : 'Facebook'}
                    <span>{channels.includes(ch) && <Check size={11} />}</span>
                  </button>
                );
              })}
            </div>
            <div className="section-label">
              Caption & hashtags
              <button
                className="small-tool"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(copy);
                    notify('Caption and hashtags copied.');
                  } catch {
                    notify('Select the post copy below and use your device’s Copy action.');
                  }
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <p className="publish-copy">{copy || 'No caption or hashtags.'}</p>
            {mode === 'schedule' && (
              <div className="schedule-fields">
                <label className="field">
                  <span>Local date and time</span>
                  <input
                    type="datetime-local"
                    value={localTime}
                    onChange={(e) => setLocalTime(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Timezone</span>
                  <input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </label>
              </div>
            )}
            {!!jobs.length && (
              <div className="schedule-jobs">
                <div className="section-label">
                  Server-confirmed jobs
                  <button className="small-tool" disabled={busy} onClick={refreshJobs}>
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
                {jobs.slice(0, 8).map((j) => (
                  <div className="schedule-job" key={j.id}>
                    <span className={'job-status ' + j.status}>{j.status}</span>
                    <span>
                      <strong>{j.title}</strong>
                      <small>
                        {j.platforms.join(' · ')} · {new Date(j.dueAt).toLocaleString()} · attempt{' '}
                        {j.attempts + (j.status === 'published' ? 1 : 0)}/{j.maxAttempts}
                        {j.lastError ? ` · ${j.lastError}` : ''}
                      </small>
                    </span>
                    {['scheduled', 'failed'].includes(j.status) && (
                      <button
                        className="icon-btn"
                        title="Cancel job"
                        aria-label="Cancel scheduled job"
                        disabled={busy}
                        onClick={() => jobAction(j.id, 'cancel')}
                      >
                        <Ban size={14} />
                      </button>
                    )}
                    {j.status === 'uncertain' && (
                      <button className="small-tool" disabled={busy} onClick={() => jobAction(j.id, 'reconcile')}>
                        Mark manually reviewed
                      </button>
                    )}
                    {j.retryAllowed && (
                      <button
                        className="icon-btn"
                        title="Retry job"
                        aria-label="Retry scheduled job"
                        disabled={busy}
                        onClick={() => jobAction(j.id, 'retry')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!!notifications.length && (
              <div className="schedule-notifications">
                {notifications.slice(0, 4).map((n) => (
                  <p key={n.id} className={n.level}>
                    {n.text}
                  </p>
                ))}
              </div>
            )}
            {scheduled && (
              <p className="server-confirmation" role="status">
                Server status for this poster: <strong>{scheduled.status}</strong>. No local claim is
                shown until the server updates it.
              </p>
            )}
            {!meta.connected && (
              <div className="info-note">
                <Link2 size={16} />
                <span>Connect Meta once to publish directly to your social channels.</span>
              </div>
            )}
            {error && (
              <p role="alert" className="error-note">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <button className="btn" disabled={busy} onClick={onDownload}>
                <Download size={15} /> Download
              </button>
              <button
                className="btn primary"
                disabled={busy || !channels.length || (mode === 'schedule' && !!scheduled)}
                onClick={mode === 'schedule' ? schedule : publish}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={15} className="spin" /> {mode === 'schedule' ? 'Scheduling…' : 'Publishing…'}
                  </>
                ) : !meta.connected ? (
                  <>
                    <MetaIcon size={19} /> Connect Meta
                  </>
                ) : mode === 'schedule' ? (
                  <>
                    <CalendarClock size={15} /> Schedule publication
                  </>
                ) : (
                  <>
                    <Send size={15} /> Publish now
                  </>
                )}
              </button>
            </div>
            <p className="publish-fineprint">
              {meta.connected
                ? 'Publishing as ' + meta.account.name
                : 'Nothing is posted without your confirmation.'}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
