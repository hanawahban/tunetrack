import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, login, registerAs, json } from '../test/app';

describe('GET /scrobbles/recent', () => {
  beforeEach(resetDb);

  test('nests track -> album -> artist on each scrobble', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const curatorToken = await login('curator@test.com', 'password123');

    const artist = await json<{ id: number }>(
      await post('/artists', { token: curatorToken, body: { name: 'Fleetwood Mac' } }),
    );
    const album = await json<{ id: number }>(
      await post('/albums', { token: curatorToken, body: { title: 'Rumours', artistId: artist.id } }),
    );
    const track = await json<{ id: number }>(
      await post('/tracks', { token: curatorToken, body: { title: 'Dreams', albumId: album.id } }),
    );

    await registerAs('listener@test.com', 'LISTENER');
    const listenerToken = await login('listener@test.com', 'password123');

    const scrobbleRes = await post('/scrobbles', { token: listenerToken, body: { trackId: track.id } });
    expect(scrobbleRes.status).toBe(201);

    const recentRes = await get('/scrobbles/recent', { token: listenerToken });
    expect(recentRes.status).toBe(200);
    const body = await json<{
      items: { track: { id: number; album: { id: number; artist: { id: number } } } }[];
      nextCursor: string | null;
    }>(recentRes);
    const scrobble = body.items[0]!;
    expect(scrobble.track.id).toBe(track.id);
    expect(scrobble.track.album.id).toBe(album.id);
    expect(scrobble.track.album.artist.id).toBe(artist.id);
  });

  test('scrobbling a non-existent track -> 404', async () => {
    await registerAs('listener2@test.com', 'LISTENER');
    const token = await login('listener2@test.com', 'password123');
    const res = await post('/scrobbles', { token, body: { trackId: 999999 } });
    expect(res.status).toBe(404);
  });
});
