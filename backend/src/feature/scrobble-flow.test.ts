import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';

describe('feature: register -> login -> scrobble -> top-artists', () => {
  beforeEach(resetDb);

  test('a listener who scrobbles the same track 3x sees it ranked with count 3', async () => {
    // seed the catalog as a curator
    await registerAs('curator@test.com', 'CURATOR');
    const curatorToken = await login('curator@test.com', 'password123');

    const artistRes = await testApp.handle(
      new Request('http://localhost/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(curatorToken) },
        body: JSON.stringify({ name: 'Fleetwood Mac' }),
      }),
    );
    const artist = await artistRes.json();

    const albumRes = await testApp.handle(
      new Request('http://localhost/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(curatorToken) },
        body: JSON.stringify({ title: 'Rumours', artistId: artist.id }),
      }),
    );
    const album = await albumRes.json();

    const trackRes = await testApp.handle(
      new Request('http://localhost/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(curatorToken) },
        body: JSON.stringify({ title: 'Dreams', albumId: album.id }),
      }),
    );
    const track = await trackRes.json();

    // register a listener directly through the API (not via the registerAs shortcut, since
    // this is the flow the feature test is meant to exercise end-to-end)
    const registerRes = await testApp.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'listener@test.com', password: 'password123' }),
      }),
    );
    expect(registerRes.status).toBe(201);

    const loginRes = await testApp.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'listener@test.com', password: 'password123' }),
      }),
    );
    expect(loginRes.status).toBe(201);
    const { access_token } = await loginRes.json();

    for (let i = 0; i < 3; i++) {
      const res = await testApp.handle(
        new Request('http://localhost/scrobbles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
          body: JSON.stringify({ trackId: track.id }),
        }),
      );
      expect(res.status).toBe(201);
    }

    const topArtistsRes = await testApp.handle(
      new Request('http://localhost/stats/top-artists', {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    );
    expect(topArtistsRes.status).toBe(200);
    const topArtists = await topArtistsRes.json();
    expect(topArtists).toEqual([{ artistId: artist.id, name: artist.name, playCount: 3 }]);
  });
});
