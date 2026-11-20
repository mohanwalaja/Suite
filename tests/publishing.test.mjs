import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/api.mjs';
import { readFileSync, mkdtempSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POSTER_REVISION } from '../shared/poster-spec.js';
const permissions = () => Response.json({ data: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'].map(permission => ({ permission, status: 'granted' })) });
const env = {
  META_APP_ID: 'sample-app',
  META_APP_SECRET: 'example-only',
  PUBLIC_BASE_URL: 'https://studio.example',
  META_GRAPH_VERSION: 'v23.0',
  STUDIO_TOKEN_KEY: 'a3'.repeat(32),
};
async function withApi(env, fetcher, run) {
  const temporary = env.STUDIO_DATA_DIR ? null : mkdtempSync(path.join(tmpdir(), 'astro-api-test-'));
  const app = createApi({ ...env, STUDIO_DATA_DIR: env.STUDIO_DATA_DIR || temporary }, fetcher);
  const server = await new Promise((r) => {
    const s = app.listen(0, '127.0.0.1', () => r(s));
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(url);
  } finally {
    await new Promise((r) => server.close(r));
    if (temporary) rmSync(temporary, { recursive: true, force: true });
  }
}
test('unconfigured workspace never claims connection or publishes', async () => {
  await withApi(
    {},
    () => {
      throw Error('Graph should not be called');
    },
    async (url) => {
      const s = await fetch(url + '/api/meta/status');
      assert.deepEqual(await s.json(), {
        configured: false,
        connected: false,
        account: null,
        pages: [],
        callback: null,
      });
      assert.match(s.headers.get('set-cookie'), /HttpOnly/);
      const r = await fetch(url + '/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      assert.equal(r.status, 409);
      assert.equal((await fetch(url + '/api/meta/connect')).status, 503);
    },
  );
});
test('authorized session publishes both channels and keeps server tokens private (mocked Graph)', async () => {
  let posts = 0;
  const fakeGraph = async (u, o) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    let data;
    if (p === 'oauth/access_token') data = { access_token: 'test-user-token' };
    else if (p === 'me/accounts')
      data = {
        data: [
          {
            id: 'page1',
            name: 'Test Page',
            access_token: 'test-page-token',
            instagram_business_account: { id: 'ig1', username: 'test_studio' },
          },
        ],
      };
    else if (p === 'page1/photos') {
      assert.ok(o.body instanceof FormData);
      assert.equal(o.body.get('message'), 'Test caption #Test');
      data = { id: 'photo', post_id: 'post1' };
      posts++;
    } else if (p === 'ig1/media') {
      const source = o.body.get('image_url');
      assert.match(source, /^https:\/\/studio\.example\/media\/.+\.jpg$/);
      data = { id: 'container1' };
    } else if (p === 'container1') data = { status_code: 'FINISHED' };
    else if (p === 'ig1/media_publish') {
      data = { id: 'published1' };
      posts++;
    } else throw Error('Unexpected Graph route');
    return Response.json(data);
  };
  await withApi(env, fakeGraph, async (url) => {
    const oauth = await fetch(url + '/api/meta/connect', { redirect: 'manual' });
    const cookie = oauth.headers.get('set-cookie').split(';')[0];
    const state = new URL(oauth.headers.get('location')).searchParams.get('state');
    const cb = await fetch(url + `/api/meta/callback?state=${state}&code=sample`, {
      redirect: 'manual',
      headers: { cookie },
    });
    assert.equal(cb.headers.get('location'), '/?meta=connected');
    const st = await (await fetch(url + '/api/meta/status', { headers: { cookie } })).json();
    assert.equal(st.connected, true);
    assert.equal(st.account.instagram, 'test_studio');
    assert.ok(!JSON.stringify(st).includes('test-page-token'));
    assert.equal((await (await fetch(url + '/api/meta/status')).json()).connected, false);
    const body = JSON.stringify({
      requestId: 'poster-test-123',
      pageId: 'page1',
      platforms: ['facebook', 'instagram'],
      image:
        'data:image/jpeg;base64,' +
        readFileSync(new URL('./fixtures/branded-portrait.jpg', import.meta.url)).toString(
          'base64',
        ),
      posterRevision: POSTER_REVISION,
      caption: 'Test caption #Test',
      title: 'Test poster',
    });
    const request = (payload = body) =>
      fetch(url + '/api/publish', {
        method: 'POST',
        headers: { cookie, 'Content-Type': 'application/json', origin: env.PUBLIC_BASE_URL },
        body: payload,
      });
    assert.equal(
      (await request(JSON.stringify({ ...JSON.parse(body), posterRevision: 'official-lockup-1' })))
        .status,
      409,
    );
    // The JPEG bytes decide its dimensions, not a caller-supplied portrait label.
    for (const name of ['branded-square.jpg', 'wide.jpg']) {
      const image =
        'data:image/jpeg;base64,' +
        readFileSync(new URL('./fixtures/' + name, import.meta.url)).toString('base64');
      const unsupported = await request(
        JSON.stringify({ ...JSON.parse(body), image, format: 'portrait' }),
      );
      assert.equal(unsupported.status, 400);
      assert.match((await unsupported.json()).error, /1080 × 1350 portrait/);
    }
    assert.equal(posts, 0);
    const out = await (await request()).json();
    assert.ok(out.results.every((r) => r.ok));
    assert.equal(posts, 2);
    assert.deepEqual(await (await request()).json(), out);
    assert.equal(posts, 2);
    assert.equal(
      (await (await fetch(url + '/api/publishing/history', { headers: { cookie } })).json()).posts
        .length,
      2,
    );
    await fetch(url + '/api/meta/disconnect', {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(
      (await (await fetch(url + '/api/meta/status', { headers: { cookie } })).json()).connected,
      false,
    );
  });
});

const scheduleEnv = (dir) => ({
  ...env,
  STUDIO_DATA_DIR: dir,
  SCHEDULER_TICK_MS: '50',
  SCHEDULE_MIN_LEAD_MS: '-120000',
});
const poster = () =>
  'data:image/jpeg;base64,' +
  readFileSync(new URL('./fixtures/branded-portrait.jpg', import.meta.url)).toString('base64');
async function connect(url, fetcher, existing = '') {
  const oauth = await fetch(url + '/api/meta/connect', {
    redirect: 'manual',
    ...(existing ? { headers: { cookie: existing } } : {}),
  });
  const cookie = existing || oauth.headers.get('set-cookie').split(';')[0];
  const state = new URL(oauth.headers.get('location')).searchParams.get('state');
  await fetch(url + `/api/meta/callback?state=${state}&code=sample`, {
    redirect: 'manual',
    headers: { cookie },
  });
  return cookie;
}
const scheduleBody = (overrides = {}) => ({
  requestId: 'scheduled-poster-001',
  pageId: 'page1',
  platforms: ['facebook'],
  image: poster(),
  posterRevision: POSTER_REVISION,
  caption: 'Scheduled caption #Test',
  title: 'Scheduled poster',
  localTime: new Date().toISOString().slice(0, 16),
  timezone: 'UTC',
  ...overrides,
});
const scheduleRequest = (url, cookie, body) =>
  fetch(url + '/api/schedule', {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json', origin: env.PUBLIC_BASE_URL },
    body: JSON.stringify(body),
  });

test('server-side scheduling confirms, persists, deduplicates and actually publishes', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-schedule-'));
  let posts = 0;
  const fakeGraph = async (u, o) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    let data;
    if (p === 'oauth/access_token') data = { access_token: 'test-user-token' };
    else if (p === 'me/accounts')
      data = {
        data: [
          {
            id: 'page1',
            name: 'Test Page',
            access_token: 'test-page-token',
            instagram_business_account: { id: 'ig1', username: 'test_studio' },
          },
        ],
      };
    else if (p === 'page1/photos') {
      assert.equal(o.body.get('message'), 'Scheduled caption #Test');
      data = { id: 'photo', post_id: 'scheduled-post' };
      posts++;
    } else throw Error('Unexpected Graph route: ' + p);
    return Response.json(data);
  };
  let firstCookie = '';
  try {
    const app = createApi(scheduleEnv(dir), fakeGraph);
    const server = await new Promise((r) => {
      const s = app.listen(0, '127.0.0.1', () => r(s));
    });
    const url = `http://127.0.0.1:${server.address().port}`;
    try {
      const cookie = await connect(url, fakeGraph);
      firstCookie = cookie;
      const body = scheduleBody();
      const created = await scheduleRequest(url, cookie, body);
      assert.equal(created.status, 201);
      const job = await created.json();
      assert.equal(job.status, 'scheduled');
      assert.equal(job.platforms[0], 'facebook');
      assert.equal(job.timezone, 'UTC');
      assert.equal(posts, 0, 'saving a schedule must not publish immediately');
      assert.ok(!JSON.stringify(job).includes('test-page-token'));
      assert.deepEqual(await (await scheduleRequest(url, cookie, body)).json(), job);
      const duplicate = await scheduleRequest(url, cookie, scheduleBody({ requestId: 'other-schedule-002' }));
      assert.equal(duplicate.status, 409);
      let current = job;
      for (let i = 0; i < 60 && current.status !== 'published'; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const list = await (await fetch(url + '/api/schedule', { headers: { cookie } })).json();
        current = list.jobs.find((j) => j.id === job.id);
      }
      assert.equal(current.status, 'published');
      assert.equal(posts, 1);
      assert.equal(current.results[0].id, 'scheduled-post');
      const list = await (await fetch(url + '/api/schedule', { headers: { cookie } })).json();
      assert.ok(list.notifications.some((n) => n.level === 'success' && n.jobId === job.id));
    } finally {
      await new Promise((r) => server.close(r));
    }
    // A fresh server instance reads the same jobs from disk; status survives restarts.
    const app2 = createApi(scheduleEnv(dir), fakeGraph);
    const server2 = await new Promise((r) => {
      const s = app2.listen(0, '127.0.0.1', () => r(s));
    });
    try {
      const url2 = `http://127.0.0.1:${server2.address().port}`;
      const cookie = await connect(url2, fakeGraph, firstCookie);
      const list = await (await fetch(url2 + '/api/schedule', { headers: { cookie } })).json();
      const job = list.jobs.find((j) => j.id === 'scheduled-poster-001');
      assert.ok(job);
      assert.equal(job.status, 'published');
      assert.ok(!JSON.stringify(list).includes('test-page-token'));
    } finally {
      await new Promise((r) => server2.close(r));
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('scheduling rejects invalid timezone, past time and disconnected workspaces', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-schedule-bad-'));
  try {
    const connectGraph = async (u) => {
      const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
      if (p === 'oauth/access_token') return Response.json({ access_token: 'test-user-token' });
      if (p === 'me/accounts')
        return Response.json({
          data: [
            {
              id: 'page1',
              name: 'Test Page',
              access_token: 'test-page-token',
              instagram_business_account: { id: 'ig1', username: 'test_studio' },
            },
          ],
        });
      throw Error('Unexpected Graph route: ' + p);
    };
    await withApi(
      scheduleEnv(dir),
      connectGraph,
      async (url) => {
        assert.equal((await scheduleRequest(url, '', scheduleBody())).status, 409);
        const oauth = await fetch(url + '/api/meta/connect', { redirect: 'manual' });
        const cookie = oauth.headers.get('set-cookie').split(';')[0];
        const state = new URL(oauth.headers.get('location')).searchParams.get('state');
        await fetch(url + `/api/meta/callback?state=${state}&code=sample`, {
          redirect: 'manual',
          headers: { cookie },
        });
        const badZone = await scheduleRequest(
          url,
          cookie,
          scheduleBody({ requestId: 'bad-zone-001', timezone: 'Mars/Olympus' }),
        );
        assert.equal(badZone.status, 400);
        assert.match((await badZone.json()).error, /timezone/i);
        const past = await scheduleRequest(
          url,
          cookie,
          scheduleBody({ requestId: 'past-post-001', localTime: '2020-01-01T09:00' }),
        );
        assert.equal(past.status, 400);
        assert.match((await past.json()).error, /two minutes/i);
      },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('ambiguous and partially successful scheduled publications are not retried automatically', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-schedule-uncertain-'));
  let facebookPosts = 0;
  let instagramCreates = 0;
  const fakeGraph = async (u) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    if (p === 'oauth/access_token') return Response.json({ access_token: 'token' });
    if (p === 'me/accounts') return Response.json({ data: [{ id: 'page1', name: 'Page', access_token: 'page-token', instagram_business_account: { id: 'ig1', username: 'test' } }] });
    if (p === 'page1/photos') { facebookPosts++; return Response.json({ post_id: 'fb-ok' }); }
    if (p === 'ig1/media') { instagramCreates++; throw new Error('Network timeout page-token'); }
    throw Error('Unexpected route: ' + p);
  };
  try {
    await withApi(scheduleEnv(dir), fakeGraph, async (url) => {
      const cookie = await connect(url, fakeGraph);
      const response = await scheduleRequest(url, cookie, scheduleBody({ requestId: 'uncertain-job-001', platforms: ['facebook', 'instagram'] }));
      assert.equal(response.status, 201);
      let job;
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const list = await (await fetch(url + '/api/schedule', { headers: { cookie } })).json();
        job = list.jobs[0];
        if (job.status === 'uncertain') break;
      }
      assert.equal(job.status, 'uncertain');
      assert.equal(job.retryAllowed, false);
      assert.doesNotMatch(JSON.stringify(job), /page-token/);
      assert.equal(job.results.find((r) => r.channel === 'facebook').ok, true);
      assert.equal(job.results.find((r) => r.channel === 'instagram').ok, false);
      const retry = await fetch(url + `/api/schedule/${job.id}/retry`, { method: 'POST', headers: { cookie, origin: env.PUBLIC_BASE_URL, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(retry.status, 409);
      const reconcile = await fetch(url + `/api/schedule/${job.id}/reconcile`, { method: 'POST', headers: { cookie, origin: env.PUBLIC_BASE_URL, 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmedReview: true }) });
      assert.equal(reconcile.status, 200);
      const reviewed = await reconcile.json();
      assert.equal(reviewed.status, 'reviewed');
      assert.equal(reviewed.reconciliation.outcome, 'not-verified-by-server');
      assert.equal(reviewed.retryAllowed, false);
      assert.equal(facebookPosts, 1);
      assert.equal(instagramCreates, 1);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('credentials are encrypted at rest, survive restart, and reject wrong keys and tampering', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-token-'));
  const config = { ...env, STUDIO_DATA_DIR: dir };
  const fake = async (u) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    if (p === 'oauth/access_token') return Response.json({ access_token: 'private-user-token' });
    if (p === 'me/accounts') return Response.json({ data: [{ id: 'page1', name: 'Page', access_token: 'private-page-token' }] });
    throw Error('Unexpected route');
  };
  try {
    let cookie;
    await withApi(config, fake, async (url) => {
      cookie = await connect(url, fake);
      const raw = readFileSync(path.join(dir, 'studio-state.json'), 'utf8');
      assert.doesNotMatch(raw, /private-page-token|private-user-token/);
      assert.match(raw, /tokenEncrypted/);
    });
    await withApi(config, fake, async (url) => {
      const status = await (await fetch(url + '/api/meta/status', { headers: { cookie } })).json();
      assert.equal(status.connected, true);
      assert.doesNotMatch(JSON.stringify(status), /private-page-token|private-user-token/);
    });
    assert.throws(() => createApi({ ...config, STUDIO_TOKEN_KEY: 'b4'.repeat(32) }, fake), /Unable to decrypt/);
    const file = path.join(dir, 'studio-state.json');
    const stored = JSON.parse(readFileSync(file, 'utf8'));
    const page = Object.values(stored.sessions).find(s => s.pages?.length).pages[0];
    page.tokenEncrypted.tag = Buffer.alloc(16).toString('base64');
    writeFileSync(file, JSON.stringify(stored));
    assert.throws(() => createApi(config, fake), /Unable to decrypt/);
    assert.throws(() => createApi({ ...config, STUDIO_TOKEN_KEY: 'not-a-key' }, fake), /64 hexadecimal/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('missing encryption key disables Meta and a second process cannot open the same store', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-lock-'));
  try {
    await withApi({ ...env, STUDIO_DATA_DIR: dir, STUDIO_TOKEN_KEY: '' }, () => { throw Error('unexpected'); }, async (url) => {
      const status = await (await fetch(url + '/api/meta/status')).json();
      assert.equal(status.configured, false);
      assert.equal((await fetch(url + '/api/meta/connect')).status, 503);
      const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import { createApi } from './server/api.mjs'; try { createApi({STUDIO_DATA_DIR: process.argv[1]}); process.exit(9); } catch (e) { if (!e.message.includes('already locked')) process.exit(8); }`, dir], { cwd: process.cwd(), encoding: 'utf8' });
      assert.equal(child.status, 0, child.stderr);
    });
    const app = createApi({ STUDIO_DATA_DIR: dir });
    app.shutdown();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a future scheduled job is preserved across a server restart without publishing', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-pending-'));
  let posts = 0;
  const fake = async (u) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    if (p === 'oauth/access_token') return Response.json({ access_token: 'user' });
    if (p === 'me/accounts') return Response.json({ data: [{ id: 'page1', name: 'Page', access_token: 'page' }] });
    posts++;
    throw Error('should not publish future job');
  };
  try {
    let cookie;
    await withApi(scheduleEnv(dir), fake, async (url) => {
      cookie = await connect(url, fake);
      const localTime = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      const r = await scheduleRequest(url, cookie, scheduleBody({ requestId: 'pending-restart-01', localTime }));
      assert.equal(r.status, 201);
    });
    await withApi(scheduleEnv(dir), fake, async (url) => {
      const list = await (await fetch(url + '/api/schedule', { headers: { cookie } })).json();
      assert.equal(list.jobs[0].id, 'pending-restart-01');
      assert.equal(list.jobs[0].status, 'scheduled');
      assert.equal(posts, 0);
      const cancel = await fetch(url + '/api/schedule/pending-restart-01/cancel', { method: 'POST', headers: { cookie, origin: env.PUBLIC_BASE_URL, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal((await cancel.json()).status, 'cancelled');
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Meta connection fails closed when required permissions were declined', async () => {
  const fake = async (u) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'oauth/access_token') return Response.json({ access_token: 'user' });
    if (p === 'me/permissions') return Response.json({ data: [{ permission: 'pages_show_list', status: 'granted' }, { permission: 'pages_manage_posts', status: 'declined' }] });
    throw Error('Page fetch must not occur');
  };
  await withApi(env, fake, async (url) => {
    const oauth = await fetch(url + '/api/meta/connect', { redirect: 'manual' });
    const cookie = oauth.headers.get('set-cookie').split(';')[0];
    const state = new URL(oauth.headers.get('location')).searchParams.get('state');
    const response = await fetch(url + `/api/meta/callback?state=${state}&code=x`, { redirect: 'manual', headers: { cookie } });
    assert.equal(response.headers.get('location'), '/?meta=failed');
    assert.equal((await (await fetch(url + '/api/meta/status', { headers: { cookie } })).json()).connected, false);
  });
});

test('legacy plaintext credentials are rejected rather than silently persisted', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-legacy-'));
  try {
    writeFileSync(path.join(dir, 'studio-state.json'), JSON.stringify({ sessions: { legacy: { pages: [{ id: 'page1', token: 'legacy-secret' }] } }, jobs: [], notifications: [] }));
    assert.throws(() => createApi({ ...env, STUDIO_DATA_DIR: dir }), /Legacy plaintext/);
    assert.throws(() => createApi({ ...env, STUDIO_DATA_DIR: dir }), /Legacy plaintext/, 'failed startup releases the lock');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('missing scheduled media fails before attempting Meta and notifies the owner', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'astro-missing-media-'));
  let posts = 0;
  const fake = async (u) => {
    const p = u.pathname.replace('/v23.0/', '');
    if (p === 'me/permissions') return permissions();
    if (p === 'oauth/access_token') return Response.json({ access_token: 'user' });
    if (p === 'me/accounts') return Response.json({ data: [{ id: 'page1', name: 'Page', access_token: 'page' }] });
    posts++;
    throw Error('unexpected publication');
  };
  try {
    await withApi(scheduleEnv(dir), fake, async (url) => {
      const cookie = await connect(url, fake);
      const created = await scheduleRequest(url, cookie, scheduleBody({ requestId: 'missing-media-001' }));
      assert.equal(created.status, 201);
      unlinkSync(path.join(dir, 'media', 'missing-media-001.jpg'));
      let list;
      for (let i = 0; i < 50; i++) {
        await new Promise((r) => setTimeout(r, 100));
        list = await (await fetch(url + '/api/schedule', { headers: { cookie } })).json();
        if (list.jobs[0].status === 'failed') break;
      }
      assert.equal(list.jobs[0].status, 'failed');
      assert.match(list.jobs[0].lastError, /missing/i);
      assert.ok(list.notifications.some((n) => n.level === 'error'));
      assert.equal(posts, 0);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
