import express from 'express';
import crypto from 'node:crypto';
import { imageSize } from 'image-size';
import { BRAND, PORTRAIT, POSTER_REVISION } from '../shared/poster-spec.js';
const hex = () => crypto.randomBytes(24).toString('hex');
export function createApi(env = process.env, fetcher = fetch) {
  const app = express();
  app.disable('x-powered-by');
  const sessions = new Map(),
    media = new Map();
  const version = /^v\d+\.\d+$/.test(env.META_GRAPH_VERSION || '')
    ? env.META_GRAPH_VERSION
    : 'v23.0';
  const base = (env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const ready = !!(env.META_APP_ID && env.META_APP_SECRET && /^https:\/\/[^/]+$/.test(base));
  const redirect = base + '/api/meta/callback';
  function cleanup() {
    const now = Date.now();
    for (const [k, v] of sessions) if (v.until < now) sessions.delete(k);
    for (const [k, v] of media) if (v.until < now) media.delete(k);
  }
  const timer = setInterval(cleanup, 60000);
  timer.unref();
  // Compatibility for bookmarks/older clients: the originals now ship with the app.
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
    next();
  });
  const publicPage = (p) =>
    p
      ? { id: p.id, name: p.name, instagram: p.ig?.username || null, instagramId: p.ig?.id || null }
      : null;
  const active = (s) => s.pages.find((p) => p.id === s.selected);
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
  async function graph(route, token, params, method = 'GET') {
    const u = new URL(`https://graph.facebook.com/${version}/${route}`);
    const opts = { method, headers: {}, signal: AbortSignal.timeout(25000) };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    if (method === 'GET') u.search = new URLSearchParams(params || {});
    else opts.body = params instanceof FormData ? params : new URLSearchParams(params || {});
    const r = await fetcher(u, opts);
    const data = await r.json();
    if (!r.ok || data.error) {
      const e = new Error(
        data.error?.error_user_msg ||
          'Meta could not complete this request. Check the account permissions and reconnect if needed.',
      );
      e.metaCode = data.error?.code;
      throw e;
    }
    return data;
  }
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
      } catch {
        /* A valid short-lived token can still complete the authorized connection. */
      }
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
      s.selected = s.pages[0]?.id || null;
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
    res.json({ account: publicPage(page) });
  });
  app.post('/api/meta/disconnect', (req, res) => {
    req.studio.pages = [];
    req.studio.selected = null;
    delete req.studio.oauth;
    res.json({ disconnected: true });
  });
  app.get('/api/publishing/history', (req, res) => res.json({ posts: req.studio.log }));
  app.post('/api/publish', async (req, res) => {
    const s = req.studio,
      p = active(s);
    if (!ready || !p)
      return res.status(409).json({
        error: 'Connect a Facebook Page or Instagram professional account before publishing.',
      });
    const { image, caption, platforms, requestId, title, pageId } = req.body || {};
    if (pageId !== p.id)
      return res.status(409).json({
        error:
          'Your publishing Page has changed. Refresh the account connection and review the destination again.',
      });
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
      return res.status(400).json({
        error:
          'Choose a channel and a JPEG poster, and keep the post copy within 2,200 characters.',
      });
    if (platforms.includes('instagram') && !p.ig?.id)
      return res
        .status(400)
        .json({ error: 'Link an Instagram professional account to this Facebook Page first.' });
    if (platforms.includes('instagram') && (caption.match(/#[\p{L}\p{N}_]+/gu) || []).length > 30)
      return res.status(400).json({ error: 'Use no more than 30 hashtags for Instagram.' });
    const bytes = Buffer.from(image.slice(23), 'base64');
    if (
      bytes.length > 6e6 ||
      bytes.length < 3 ||
      bytes[0] !== 255 ||
      bytes[1] !== 216 ||
      bytes[2] !== 255
    )
      return res.status(400).json({ error: 'Invalid JPEG image.' });
    if (req.body.posterRevision !== POSTER_REVISION) {
      return res
        .status(409)
        .json({
          error:
            'Reload Poster Studio to publish the current portrait with the transparent ASTRO SIVAM signature.',
        });
    }
    // Enforce the actual image size, not a caller-supplied aspect ratio or format name.
    try {
      const { type, width, height, orientation } = imageSize(bytes);
      if (
        type !== 'jpg' ||
        (orientation && orientation !== 1) ||
        width !== PORTRAIT.width ||
        height !== PORTRAIT.height
      ) {
        return res.status(400).json({
          error: `Publish a ${PORTRAIT.width} × ${PORTRAIT.height} portrait JPEG exported from Poster Studio.`,
        });
      }
    } catch {
      return res.status(400).json({
        error: 'Could not read the poster dimensions. Export a new poster and try again.',
      });
    }
    const done = s.requests.get(requestId);
    if (done)
      return done.pending
        ? res.status(409).json({ error: 'This post is already being published.' })
        : res.json(done);
    if (s.busy)
      return res.status(429).json({ error: 'Please wait for the current post to finish.' });
    s.busy = true;
    s.requests.set(requestId, { pending: true });
    const results = [];
    try {
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
        } catch (e) {
          results.push({ channel, ok: false, error: e.message || 'Publishing failed.' });
        }
      }
      const out = { results };
      s.requests.set(requestId, out);
      if (s.requests.size > 200) s.requests.delete(s.requests.keys().next().value);
      res.json(out);
    } finally {
      s.busy = false;
    }
  });
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
