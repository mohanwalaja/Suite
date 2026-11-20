import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/api.mjs';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POSTER_REVISION } from '../shared/poster-spec.js';
const env = {
  META_APP_ID: 'sample-app',
  META_APP_SECRET: 'example-only',
  PUBLIC_BASE_URL: 'https://studio.example',
  META_GRAPH_VERSION: 'v23.0',
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
    if (p === 'oauth/access_token') return Response.json({ access_token: 'token' });
    if (p === 'me/accounts') return Response.json({ data: [{ id: 'page1', name: 'Page', access_token: 'page-token', instagram_business_account: { id: 'ig1', username: 'test' } }] });
    if (p === 'page1/photos') { facebookPosts++; return Response.json({ post_id: 'fb-ok' }); }
    if (p === 'ig1/media') { instagramCreates++; throw new Error('Network timeout'); }
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
        if (job.status === 'failed') break;
      }
      assert.equal(job.status, 'failed');
      assert.equal(job.retryAllowed, false);
      assert.equal(job.results.find((r) => r.channel === 'facebook').ok, true);
      assert.equal(job.results.find((r) => r.channel === 'instagram').ok, false);
      const retry = await fetch(url + `/api/schedule/${job.id}/retry`, { method: 'POST', headers: { cookie, origin: env.PUBLIC_BASE_URL, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(retry.status, 409);
      assert.equal(facebookPosts, 1);
      assert.equal(instagramCreates, 1);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
