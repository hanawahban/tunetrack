import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, login, registerAs, json } from '../test/app';

describe('feature: register -> login -> scrobble -> top-artists', () => {
  beforeEach(resetDb);

  test('a listener who scrobbles the same track 3x sees it ranked with count 3', async () => {
    // seed the catalog as a curator
    await registerAs('curator@test.com', 'CURATOR');
    const curatorToken = await login('curator@test.com', 'password123');

    const artist = await json<{ id: number; name: string }>(
      await post('/artists', { token: curatorToken, body: { name: 'Fleetwood Mac' } }),
    );
    const album = await json<{ id: number }>(
      await post('/albums', { token: curatorToken, body: { title: 'Rumours', artistId: artist.id } }),
    );
    const track = await json<{ id: number }>(
      await post('/tracks', { token: curatorToken, body: { title: 'Dreams', albumId: album.id } }),
    );

    // register a listener directly through the raw endpoints (not via the registerAs shortcut,
    // since this is the flow the feature test is meant to exercise end-to-end)
    const registerRes = await post('/auth/register', {
      body: { email: 'listener@test.com', password: 'password123' },
    });
    expect(registerRes.status).toBe(201);

    const loginRes = await post('/auth/login', {
      body: { email: 'listener@test.com', password: 'password123' },
    });
    expect(loginRes.status).toBe(201);
    const { access_token } = await json<{ access_token: string }>(loginRes);

    for (let i = 0; i < 3; i++) {
      const res = await post('/scrobbles', { token: access_token, body: { trackId: track.id } });
      expect(res.status).toBe(201);
    }

    const topArtistsRes = await get('/stats/top-artists', { token: access_token });
    expect(topArtistsRes.status).toBe(200);
    const topArtists = await json(topArtistsRes);
    expect(topArtists).toEqual([{ artistId: artist.id, name: artist.name, playCount: 3 }]);
  });
});
