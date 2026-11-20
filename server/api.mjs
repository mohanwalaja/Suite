import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import { BRAND, PORTRAIT, POSTER_REVISION } from '../shared/poster-spec.js';

const hex = () => crypto.randomBytes(24).toString('hex');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Encrypt each Meta Page token with AES-256-GCM; bind ciphertext to its session and Page.
// A missing key disables Meta connection rather than writing credentials in plaintext.
function tokenCipher(env) {
  const text = env.STUDIO_TOKEN_KEY || '';
  if (!text) return null;
  if (!/^[a-fA-F0-9]{64}$/.test(text))
    throw new Error('STUDIO_TOKEN_KEY must be exactly 64 hexadecimal characters.');
  const key = Buffer.from(text, 'hex');
  return {
    encrypt(token, sessionId, pageId) {
      const iv = crypto.randomBytes(12);
      const c = crypto.createCipheriv('aes-256-gcm', key, iv);
      c.setAAD(Buffer.from(JSON.stringify([sessionId, pageId])));
      const data = Buffer.concat([c.update(token, 'utf8'), c.final()]);
      return { version: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64') };
    },
    decrypt(box, sessionId, pageId) {
      try {
        if (box?.version !== 1) throw new Error();
        const iv = Buffer.from(box.iv, 'base64');
        const tag = Buffer.from(box.tag, 'base64');
        if (iv.length !== 12 || tag.length !== 16) throw new Error();
        const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
        d.setAAD(Buffer.from(JSON.stringify([sessionId, pageId])));
        d.setAuthTag(tag);
        return Buffer.concat([d.update(Buffer.from(box.data, 'base64')), d.final()]).toString('utf8');
      } catch {
        throw new Error('Unable to decrypt stored Meta credentials. Verify the server encryption key and state integrity.');
      }
    },
  };
}

// Persistent state uses atomic replacement; credentials are encrypted before serialization.
function createStore(env, cipher) {
  const dir = path.resolve(env.STUDIO_DATA_DIR || '.data');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const mediaDir = path.join(dir, 'media');
  fs.mkdirSync(mediaDir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, 'studio-state.json');
  let state = { sessions: {}, jobs: [], notifications: [] };
  if (fs.existsSync(file)) {
    let loaded;
    try { loaded = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { throw new Error('Studio state cannot be read; restore a valid backup before starting.'); }
    state = {
      sessions: loaded.sessions && typeof loaded.sessions === 'object' ? loaded.sessions : {},
      jobs: Array.isArray(loaded.jobs) ? loaded.jobs : [],
      notifications: Array.isArray(loaded.notifications) ? loaded.notifications : [],
    };
    for (const [id, session] of Object.entries(state.sessions)) {
      for (const page of session.pages || []) {
        if (page.token) throw new Error('Legacy plaintext Meta credentials detected. Remove the legacy state securely and reconnect, or migrate it offline before startup.');
        if (page.tokenEncrypted) {
          if (!cipher) throw new Error('STUDIO_TOKEN_KEY is required to open stored Meta credentials.');
          page.token = cipher.decrypt(page.tokenEncrypted, id, page.id);
          delete page.tokenEncrypted;
        }
      }
    }
  }
  const save = () => {
    const safeSessions = Object.fromEntries(Object.entries(state.sessions).map(([id, session]) => [id, {
      ...session,
      pages: (session.pages || []).map(({ token, ...page }) => {
        if (token && !cipher) throw new Error('Meta credential encryption is not configured.');
        return { ...page, ...(token ? { tokenEncrypted: cipher.encrypt(token, id, page.id) } : {}) };
      }),
    }]));
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ ...state, sessions: safeSessions }), { mode: 0o600 });
    fs.renameSync(tmp, file);
    try {
      fs.chmodSync(file, 0o600);
    } catch {}
  };
  return { state, save, mediaDir, file };
}

const zonedParts = (ts, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ts));
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  return [get('year'), get('month'), get('day'), get('hour'), get('minute'), get('second')];
};

// Convert a wall-clock time in an IANA timezone to a UTC timestamp, rejecting DST gaps.
function zonedTimeToUtc(local, timeZone) {
  if (typeof local !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    throw Error('Choose a local date and time for the publication.');
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone }).format();
  } catch {
    throw Error('Choose a valid IANA timezone for the publication.');
  }
  const [y, mo, d, h, mi] = local.split(/[-T:]/).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(guess)) throw Error('Choose a valid local date and time.');
  const offsetAt = (ts) => {
    const [yy, mm, dd, hh, min] = zonedParts(ts, timeZone);
    return Date.UTC(yy, mm - 1, dd, hh, min) - Math.floor(ts / 60000) * 60000;
  };
  const ts = guess - offsetAt(guess);
  const [yy, mm, dd, hh, min] = zonedParts(ts, timeZone);
  if (yy !== y || mm !== mo || dd !== d || hh !== h || min !== mi)
    throw Error('That local time does not exist in the chosen timezone.');
  return ts;
}

// An exclusive data-directory lease prevents concurrent processes from reading stale
// state or publishing the same job. A crash leaves a lease requiring operator review;
// it is never automatically stolen while another worker might still be running.
function acquireLease(env) {
  const dir = path.resolve(env.STUDIO_DATA_DIR || '.data');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const lock = path.join(dir, '.writer-lock');
  try { fs.mkdirSync(lock, { mode: 0o700 }); }
  catch (e) {
    if (e.code === 'EEXIST') throw new Error('Studio data directory is already locked. Stop the other server; after a crash, verify no server is using this directory before removing .writer-lock.');
    throw e;
  }
  let held = true;
  const release = () => {
    if (!held) return;
    held = false;
    fs.rmSync(lock, { recursive: true, force: true });
    process.off('exit', release);
  };
  process.once('exit', release);
  return release;
}

export function createApi(env = process.env, fetcher = fetch) {
  const app = express();
  app.disable('x-powered-by');
  const cipher = tokenCipher(env);
  const release = acquireLease(env);
  let store;
  try { store = createStore(env, cipher); }
  catch (e) { release(); throw e; }
  const sessions = new Map(
    Object.entries(store.state.sessions).map(([id, s]) => [
      id,
      { ...s, requests: new Map(), busy: false },
    ]),
  );
  const media = new Map();
  const jobs = store.state.jobs;
  const notifications = store.state.notifications;
  const minLead = Number.isFinite(Number(env.SCHEDULE_MIN_LEAD_MS))
    ? Number(env.SCHEDULE_MIN_LEAD_MS)
    : 120000;
  const tickMs = Number.isFinite(Number(env.SCHEDULER_TICK_MS))
    ? Number(env.SCHEDULER_TICK_MS)
    : 15000;
  const maxAttempts = 3;

  const saveState = () => {
    store.state.sessions = Object.fromEntries(
      [...sessions].map(([id, s]) => [
        id,
        {
          id,
          pages: s.pages || [],
          permissions: s.permissions || [],
          selected: s.selected || null,
          log: s.log || [],
          until: s.until || 0,
          ...(s.oauth ? { oauth: s.oauth } : {}),
        },
      ]),
    );
    store.save();
  };
  const notify = (sessionId, level, text, jobId = null) => {
    notifications.unshift({
      id: hex(),
      sessionId,
      level,
      text,
      jobId,
      at: new Date().toISOString(),
    });
    if (notifications.length > 200) notifications.length = 200;
    saveState();
  };
  const publicJob = (j) => ({
    id: j.id,
    title: j.title,
    platforms: j.platforms,
    localTime: j.localTime,
    timezone: j.timezone,
    dueAt: j.dueAt,
    status: j.status,
    attempts: j.attempts,
    maxAttempts: j.maxAttempts,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    publishedAt: j.publishedAt || null,
    lastError: j.lastError || null,
    retryAllowed: !j.publishAttempted && ['failed', 'cancelled'].includes(j.status),
    reconciliation: j.reconciliation || null,
    results: j.results || [],
  });

  const version = /^v\d+\.\d+$/.test(env.META_GRAPH_VERSION || '')
    ? env.META_GRAPH_VERSION
    : 'v23.0';
  const base = (env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const ready = !!(cipher && env.META_APP_ID && env.META_APP_SECRET && /^https:\/\/[^/]+$/.test(base));
  const redirect = base + '/api/meta/callback';

  function cleanup() {
    const now = Date.now();
    for (const [k, v] of sessions) if (v.until < now) sessions.delete(k);
    for (const [k, v] of media) if (v.until < now) media.delete(k);
  }
  const timer = setInterval(cleanup, 60000);
  timer.unref();

  async function graph(route, token, params, method = 'GET') {
    const u = new URL(`https://graph.facebook.com/${version}/${route}`);
    const opts = { method, headers: {}, signal: AbortSignal.timeout(25000) };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    if (method === 'GET') u.search = new URLSearchParams(params || {});
    else opts.body = params instanceof FormData ? params : new URLSearchParams(params || {});
    const r = await fetcher(u, opts);
    const data = await r.json();
    if (!r.ok || data.error) {
      const e = new Error('Meta could not complete this request. Check the account permissions and reconnect if needed.');
      e.metaCode = data.error?.code;
      throw e;
    }
    return data;
  }

  const publicPage = (p) =>
    p
      ? { id: p.id, name: p.name, instagram: p.ig?.username || null, instagramId: p.ig?.id || null }
      : null;
  const active = (s) => s.pages.find((p) => p.id === s.selected);

  // The only place that talks to Meta for a publication. Immediate publishing and the
  // scheduler call the same function, so a scheduled post is never a simulated one.
  async function sendToMeta(p, bytes, caption, platforms, title, s) {
    const results = [];
    for (const channel of new Set(platforms)) {
      try {
        let id;
        if (channel === 'facebook') {
          const form = new FormData();
          form.append('source', new Blob([bytes], { type: 'image/jpeg' }), 'poster.jpg');
          form.append('message', caption);
          const out = await graph(`${p.id}/photos`, p.token, form, 'POST');
          id = out.post_id || out.id;
        } else {
          const file = hex() + '.jpg';
          media.set(file, { bytes, until: Date.now() + 3600000 });
          const container = await graph(
            `${p.ig.id}/media`,
            p.token,
            { image_url: base + '/media/' + file, caption },
            'POST',
          );
          let finished = false;
          for (let i = 0; i < 16; i++) {
            const stat = await graph(container.id, p.token, { fields: 'status_code' });
            if (stat.status_code === 'FINISHED') {
              finished = true;
              break;
            }
            if (['ERROR', 'EXPIRED'].includes(stat.status_code))
              throw Error(
                'Instagram could not process this image. Check that the public image URL is reachable.',
              );
            await new Promise((r) => setTimeout(r, 2000));
          }
          if (!finished)
            throw Error(
              'Instagram is still processing. No publish command was sent. Please try again later.',
            );
          const out = await graph(
            `${p.ig.id}/media_publish`,
            p.token,
            { creation_id: container.id },
            'POST',
          );
          id = out.id;
        }
        if (!id)
          throw Error('Meta did not confirm a post ID. Check the destination before retrying.');
        const result = {
          channel,
          ok: true,
          id,
          account: channel === 'instagram' ? p.ig.username : p.name,
          date: new Date().toISOString(),
          title: String(title || `${BRAND.name} poster`).slice(0, 100),
        };
        results.push(result);
        s.log.unshift(result);
        s.log = s.log.slice(0, 150);
        saveState();
      } catch (e) {
        // Transport or provider errors can contain credentials or URLs: never return them.
        results.push({ channel, ok: false, error: 'Meta publication could not be confirmed. Check the destination before retrying.' });
      }
    }
    return results;
  }

  function validatePost(req) {
    const p = active(req.studio);
    if (!ready || !p)
      return { error: 'Connect a Facebook Page or Instagram professional account before publishing.', status: 409 };
    const { image, caption, platforms, requestId, title, pageId } = req.body || {};
    const needed = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
    if (Array.isArray(platforms) && platforms.includes('instagram')) needed.push('instagram_basic', 'instagram_content_publish');
    if (needed.some((permission) => !req.studio.permissions?.includes(permission)))
      return { error: 'Required Meta permissions have not been confirmed. Reconnect and grant the requested permissions.', status: 409 };
    if (pageId !== p.id)
      return {
        error: 'Your publishing Page has changed. Refresh the account connection and review the destination again.',
        status: 409,
      };
    if (
      typeof requestId !== 'string' ||
      !/^[\w-]{8,100}$/.test(requestId) ||
      !Array.isArray(platforms) ||
      !platforms.length ||
      platforms.length > 2 ||
      platforms.some((v) => !['facebook', 'instagram'].includes(v)) ||
      typeof caption !== 'string' ||
      caption.length > 2200 ||
      typeof image !== 'string' ||
      !image.startsWith('data:image/jpeg;base64,')
    )
      return {
        error: 'Choose a channel and a JPEG poster, and keep the post copy within 2,200 characters.',
        status: 400,
      };
    if (platforms.includes('instagram') && !p.ig?.id)
      return { error: 'Link an Instagram professional account to this Facebook Page first.', status: 400 };
    if (platforms.includes('instagram') && (caption.match(/#[\p{L}\p{N}_]+/gu) || []).length > 30)
      return { error: 'Use no more than 30 hashtags for Instagram.', status: 400 };
    const bytes = Buffer.from(image.slice(23), 'base64');
    if (bytes.length > 6e6 || bytes.length < 3 || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255)
      return { error: 'Invalid JPEG image.', status: 400 };
    if (req.body.posterRevision !== POSTER_REVISION)
      return {
        error: 'Reload Poster Studio to publish the current portrait with the transparent ASTRO SIVAM signature.',
        status: 409,
      };
    try {
      const { type, width, height, orientation } = imageSize(bytes);
      if (
        type !== 'jpg' ||
        (orientation && orientation !== 1) ||
        width !== PORTRAIT.width ||
        height !== PORTRAIT.height
      )
        return {
          error: `Publish a ${PORTRAIT.width} × ${PORTRAIT.height} portrait JPEG exported from Poster Studio.`,
          status: 400,
        };
    } catch {
      return { error: 'Could not read the poster dimensions. Export a new poster and try again.', status: 400 };
    }
    return { page: p, bytes, caption, platforms, requestId, title: String(title || `${BRAND.name} poster`).slice(0, 100) };
  }

  app.get('/api/brand/:kind', (req, res) => {
    const kind = req.params.kind;
    if (kind !== 'icon' && kind !== 'logo') return res.sendStatus(404);
    return res.redirect(BRAND[kind]);
  });
  app.get('/media/:id', (req, res) => {
    const item = media.get(req.params.id);
    if (!item || item.until < Date.now()) return res.sendStatus(404);
    res
      .set({ 'Cache-Control': 'private,no-store', 'X-Content-Type-Options': 'nosniff' })
      .type('jpeg')
      .send(item.bytes);
  });
  app.use('/api', express.json({ limit: '8mb' }), (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.headers.origin;
      let same = true;
      try {
        if (origin) same = base ? origin === base : new URL(origin).host === req.headers.host;
      } catch {
        same = false;
      }
      if (!same || req.headers['sec-fetch-site'] === 'cross-site' || !req.is('application/json'))
        return res.status(403).json({ error: 'Use this action inside your workspace.' });
    }
    const sid = (req.headers.cookie || '').match(
      /(?:^|;\s*)astro_session=([a-f0-9]{48})(?:;|$)/,
    )?.[1];
    let s = sid && sessions.get(sid);
    if (!s || s.until < Date.now()) {
      const id = hex();
      s = { id, pages: [], selected: null, log: [], requests: new Map(), until: 0 };
      sessions.set(id, s);
      res.cookie('astro_session', id, {
        httpOnly: true,
        sameSite: 'lax',
        secure: !!base || req.secure || req.headers['x-forwarded-proto'] === 'https',
        maxAge: 7 * 86400000,
        path: '/',
      });
    }
    s.until = Date.now() + 7 * 86400000;
    req.studio = s;
    saveState();
    next();
  });

  app.get('/api/meta/status', (req, res) =>
    res.json({
      configured: ready,
      connected: !!active(req.studio),
      account: publicPage(active(req.studio)),
      pages: req.studio.pages.map(publicPage),
      callback: ready ? redirect : null,
    }),
  );
  app.get('/api/meta/connect', (req, res) => {
    if (!ready)
      return res
        .status(503)
        .json({ error: 'Configure the Meta app and public HTTPS URL on the server first.' });
    const state = hex();
    req.studio.oauth = { state, until: Date.now() + 600000 };
    saveState();
    const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
    url.search = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: redirect,
      state,
      response_type: 'code',
      scope:
        'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
    });
    res.redirect(url.href);
  });
  app.get('/api/meta/callback', async (req, res) => {
    const s = req.studio,
      flow = s.oauth;
    delete s.oauth;
    const back = (result) => res.redirect('/?meta=' + result);
    if (!flow || flow.until < Date.now() || req.query.state !== flow.state) return back('expired');
    if (!req.query.code || req.query.error) return back('cancelled');
    try {
      const token = await graph(
        'oauth/access_token',
        null,
        {
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: redirect,
          code: req.query.code,
        },
        'POST',
      );
      let access = token.access_token;
      try {
        const t = await graph(
          'oauth/access_token',
          null,
          {
            grant_type: 'fb_exchange_token',
            client_id: env.META_APP_ID,
            client_secret: env.META_APP_SECRET,
            fb_exchange_token: access,
          },
          'POST',
        );
        access = t.access_token || access;
      } catch {}
      const permissionResponse = await graph('me/permissions', access, {});
      if (!Array.isArray(permissionResponse.data)) throw new Error('Permissions unavailable');
      const permissions = permissionResponse.data
        .filter((p) => p.status === 'granted' && typeof p.permission === 'string')
        .map((p) => p.permission);
      if (!['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'].every((p) => permissions.includes(p)))
        throw new Error('Required permissions not granted');
      let after,
        pages = [];
      for (let i = 0; i < 10; i++) {
        const result = await graph('me/accounts', access, {
          fields: 'id,name,access_token,instagram_business_account{id,username}',
          limit: '100',
          ...(after ? { after } : {}),
        });
        pages.push(...result.data);
        if (!result.paging?.next) break;
        after = result.paging.cursors?.after;
        if (!after) break;
      }
      s.pages = pages
        .filter((p) => p.access_token)
        .map((p) => ({
          id: p.id,
          name: p.name,
          token: p.access_token,
          ig: p.instagram_business_account,
        }));
      s.permissions = permissions;
      s.selected = s.pages[0]?.id || null;
      saveState();
      return back(s.selected ? 'connected' : 'no-pages');
    } catch {
      return back('failed');
    }
  });
  app.post('/api/meta/page', (req, res) => {
    const page = req.studio.pages.find((p) => p.id === req.body.id);
    if (!page)
      return res.status(400).json({ error: 'Select a Page authorized for this workspace.' });
    req.studio.selected = page.id;
    saveState();
    res.json({ account: publicPage(page) });
  });
  app.post('/api/meta/disconnect', (req, res) => {
    req.studio.pages = [];
    req.studio.permissions = [];
    req.studio.selected = null;
    delete req.studio.oauth;
    saveState();
    res.json({ disconnected: true });
  });

  app.get('/api/publishing/history', (req, res) => res.json({ posts: req.studio.log }));

  // Immediate publication: unchanged API contract, now sharing Meta publishing with the
  // scheduler so both paths produce real, server-confirmed post IDs.
  app.post('/api/publish', async (req, res) => {
    const s = req.studio;
    const check = validatePost(req);
    if (check.error) return res.status(check.status).json({ error: check.error });
    const { bytes, caption, platforms, requestId, title } = check;
    const done = s.requests.get(requestId);
    if (done)
      return done.pending
        ? res.status(409).json({ error: 'This post is already being published.' })
        : res.json(done);
    if (s.busy) return res.status(429).json({ error: 'Please wait for the current post to finish.' });
    s.busy = true;
    s.requests.set(requestId, { pending: true });
    try {
      const results = await sendToMeta(check.page, bytes, caption, platforms, title, s);
      const out = { results };
      s.requests.set(requestId, out);
      if (s.requests.size > 200) s.requests.delete(s.requests.keys().next().value);
      saveState();
      res.json(out);
    } finally {
      s.busy = false;
    }
  });

  // Server-side scheduling. Saving a planner note never calls this endpoint; only an
  // explicit "Schedule publication" action creates a job, and only the server confirms it.
  app.post('/api/schedule', (req, res) => {
    const check = validatePost(req);
    if (check.error) return res.status(check.status).json({ error: check.error });
    const { localTime, timezone } = req.body || {};
    let dueAt;
    try {
      dueAt = zonedTimeToUtc(localTime, timezone);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    if (!Number.isFinite(dueAt) || dueAt < Date.now() + minLead)
      return res
        .status(400)
        .json({ error: 'Choose a publication time at least two minutes from now.' });
    const existing = jobs.find((j) => j.id === check.requestId);
    if (existing) {
      if (existing.sessionId !== req.studio.id)
        return res.status(409).json({ error: 'This request ID is already in use.' });
      return res.json(publicJob(existing));
    }
    const fingerprint = sha(
      [check.page.id, [...check.platforms].sort().join(','), sha(check.caption), dueAt].join('|'),
    );
    if (
      jobs.some(
        (j) => j.fingerprint === fingerprint && ['scheduled', 'publishing'].includes(j.status),
      )
    )
      return res
        .status(409)
        .json({ error: 'An identical post is already scheduled for that exact time.' });
    const id = check.requestId;
    const file = path.join(store.mediaDir, id + '.jpg');
    try {
      fs.writeFileSync(file, check.bytes, { mode: 0o600 });
    } catch {
      return res.status(500).json({ error: 'The scheduled poster could not be stored safely.' });
    }
    const job = {
      id,
      sessionId: req.studio.id,
      pageId: check.page.id,
      platforms: [...new Set(check.platforms)],
      caption: check.caption,
      title: check.title,
      localTime,
      timezone,
      dueAt,
      imageFile: path.basename(file),
      fingerprint,
      status: 'scheduled',
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      nextAttemptAt: dueAt,
      lastError: null,
      results: [],
    };
    jobs.push(job);
    saveState();
    res.status(201).json(publicJob(job));
  });

  app.get('/api/schedule', (req, res) => {
    const mine = jobs.filter((j) => j.sessionId === req.studio.id);
    res.json({
      jobs: mine.map(publicJob),
      notifications: notifications
        .filter((n) => n.sessionId === req.studio.id)
        .slice(0, 50)
        .map(({ id, level, text, jobId, at }) => ({ id, level, text, jobId, at })),
    });
  });

  app.post('/api/schedule/:id/cancel', (req, res) => {
    const job = jobs.find((j) => j.id === req.params.id && j.sessionId === req.studio.id);
    if (!job) return res.status(404).json({ error: 'Scheduled post not found.' });
    if (!['scheduled', 'failed'].includes(job.status))
      return res.status(409).json({ error: 'Only waiting or failed posts can be cancelled.' });
    job.status = 'cancelled';
    job.updatedAt = new Date().toISOString();
    saveState();
    res.json(publicJob(job));
  });

  // Human reconciliation is an acknowledgement, not a Meta-confirmed publication.
  // It never changes a job to published and never initiates a retry.
  app.post('/api/schedule/:id/reconcile', (req, res) => {
    const job = jobs.find((j) => j.id === req.params.id && j.sessionId === req.studio.id);
    if (!job) return res.status(404).json({ error: 'Scheduled post not found.' });
    if (job.status !== 'uncertain') return res.status(409).json({ error: 'Only uncertain jobs can be reviewed.' });
    if (req.body?.confirmedReview !== true)
      return res.status(400).json({ error: 'Confirm that each destination was checked manually.' });
    job.status = 'reviewed';
    job.reconciliation = { reviewedAt: new Date().toISOString(), method: 'manual-destination-check', outcome: 'not-verified-by-server' };
    job.updatedAt = job.reconciliation.reviewedAt;
    notify(job.sessionId, 'warning', 'Uncertain publication marked reviewed by the user; no Meta publication status was verified.', job.id);
    res.json(publicJob(job));
  });

  app.post('/api/schedule/:id/retry', (req, res) => {
    const job = jobs.find((j) => j.id === req.params.id && j.sessionId === req.studio.id);
    if (!job) return res.status(404).json({ error: 'Scheduled post not found.' });
    if (job.status !== 'failed' && job.status !== 'cancelled')
      return res.status(409).json({ error: 'Only cancelled or failed posts can be retried.' });
    if (job.publishAttempted)
      return res.status(409).json({ error: 'Publication may have reached Meta. Check each destination before creating a new job; automatic retry is disabled to prevent duplicate posts.' });
    if (!active(req.studio))
      return res.status(409).json({ error: 'Reconnect your Meta account before retrying.' });
    job.status = 'scheduled';
    job.attempts = 0;
    job.lastError = null;
    job.nextAttemptAt = Date.now();
    job.updatedAt = new Date().toISOString();
    saveState();
    res.json(publicJob(job));
  });

  let processing = false;
  let closing = false;
  async function processDueJobs() {
    if (processing) return;
    processing = true;
    try {
      const now = Date.now();
      const due = jobs
        .filter((j) => j.status === 'scheduled' && j.nextAttemptAt <= now)
        .sort((a, b) => a.nextAttemptAt - b.nextAttemptAt);
      for (const job of due) {
        if (job.status !== 'scheduled') continue;
        const s = sessions.get(job.sessionId),
          p = s && s.pages.find((x) => x.id === job.pageId);
        const required = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', ...(job.platforms.includes('instagram') ? ['instagram_basic', 'instagram_content_publish'] : [])];
        if (!ready || !p || s.until < Date.now() || required.some((permission) => !s.permissions?.includes(permission)) || (job.platforms.includes('instagram') && !p.ig?.id)) {
          job.status = 'failed';
          job.lastError = 'Reconnect your Meta account to resume this scheduled post.';
          job.updatedAt = new Date().toISOString();
          notify(job.sessionId, 'error', job.lastError, job.id);
          continue;
        }
        let bytes;
        try {
          bytes = fs.readFileSync(path.join(store.mediaDir, job.imageFile));
        } catch {
          job.status = 'failed';
          job.lastError = 'The scheduled poster file is missing. Recreate the schedule.';
          job.updatedAt = new Date().toISOString();
          notify(job.sessionId, 'error', job.lastError, job.id);
          continue;
        }
        job.status = 'publishing';
        // Once a request is sent its outcome may be ambiguous (timeout, crash, or partial
        // channel success). Never repeat it automatically without checking Meta first.
        job.publishAttempted = true;
        job.updatedAt = new Date().toISOString();
        saveState();
        const results = await sendToMeta(p, bytes, job.caption, job.platforms, job.title, s);
        if (results.length && results.every((r) => r.ok)) {
          job.status = 'published';
          job.publishedAt = new Date().toISOString();
          job.results = results;
          job.lastError = null;
          notify(
            job.sessionId,
            'success',
            `Scheduled post published: ${job.title}`,
            job.id,
          );
        } else {
          job.attempts += 1;
          job.results = results;
          job.lastError =
            results.find((r) => !r.ok)?.error || 'Meta did not confirm the scheduled post.';
          job.status = 'uncertain';
          job.lastError += ' Check each destination before creating another job; the outcome may be uncertain.';
          notify(job.sessionId, 'error', `Scheduled post needs review: ${job.lastError}`, job.id);
          job.updatedAt = new Date().toISOString();
        }
        saveState();
      }
    } finally {
      processing = false;
      if (closing) release();
    }
  }
  for (const job of jobs) {
    if (job.status === 'publishing') {
      job.status = 'uncertain';
      job.publishAttempted = true;
      job.lastError = 'Server restarted during publication. Check each destination before creating another job; the outcome is unknown.';
      job.updatedAt = new Date().toISOString();
      notify(job.sessionId, 'error', job.lastError, job.id);
    }
  }
  const scheduler = setInterval(processDueJobs, Math.max(1000, tickMs));
  scheduler.unref();
  processDueJobs();
  app.shutdown = () => {
    closing = true;
    clearInterval(timer);
    clearInterval(scheduler);
    // Never release the lease while a Meta request is still in flight.
    if (!processing) release();
  };
  const listen = app.listen.bind(app);
  app.listen = (...args) => {
    const server = listen(...args);
    server.once('close', app.shutdown);
    return server;
  };

  app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown workspace endpoint.' }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
      error:
        err.type === 'entity.too.large'
          ? 'The image is too large.'
          : 'The request could not be completed.',
    });
  });
  return app;
}
