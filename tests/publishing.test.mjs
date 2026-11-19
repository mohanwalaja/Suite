import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/api.mjs';
import { readFileSync } from 'node:fs';
import { POSTER_REVISION } from '../shared/poster-spec.js';
const env = {
  META_APP_ID: 'sample-app',
  META_APP_SECRET: 'example-only',
  PUBLIC_BASE_URL: 'https://studio.example',
  META_GRAPH_VERSION: 'v23.0',
};
async function withApi(env, fetcher, run) {
  const app = createApi(env, fetcher);
  const server = await new Promise((r) => {
    const s = app.listen(0, '127.0.0.1', () => r(s));
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(url);
  } finally {
    await new Promise((r) => server.close(r));
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
