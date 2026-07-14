import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, login, registerAs, json } from '../test/app';

async function createArtistWithAlbum(token: string, artistName: string) {
  const artist = await json<{ id: number; name: string }>(
    await post('/artists', { token, body: { name: artistName } }),
  );
  const album = await json<{ id: number }>(
    await post('/albums', { token, body: { title: `${artistName} album`, artistId: artist.id } }),
  );
  return { artist, album };
}

async function createTrack(token: string, albumId: number, title: string) {
  return json<{ id: number }>(await post('/tracks', { token, body: { title, albumId } }));
}

function scrobble(token: string, trackId: number) {
  return post('/scrobbles', { token, body: { trackId } });
}

function getTopArtists(token: string) {
  return get('/stats/top-artists', { token });
}

describe('GET /stats/top-artists', () => {
  beforeEach(resetDb);

  test('returns [] when the user has no scrobbles', async () => {
    await registerAs('empty@test.com', 'CURATOR');
    const token = await login('empty@test.com', 'password123');
    const res = await getTopArtists(token);
    expect(res.status).toBe(200);
    expect(await json<unknown[]>(res)).toEqual([]);
  });

  test('sums play counts per artist across multiple tracks and sorts descending', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const curatorToken = await login('curator@test.com', 'password123');

    const { artist: artistA, album: albumA } = await createArtistWithAlbum(curatorToken, 'Artist A');
    const trackA1 = await createTrack(curatorToken, albumA.id, 'Track A1');
    const trackA2 = await createTrack(curatorToken, albumA.id, 'Track A2');

    const { artist: artistB, album: albumB } = await createArtistWithAlbum(curatorToken, 'Artist B');
    const trackB1 = await createTrack(curatorToken, albumB.id, 'Track B1');

    await registerAs('listener@test.com', 'LISTENER');
    const listenerToken = await login('listener@test.com', 'password123');

    // Artist A: 2 plays across two different tracks. Artist B: 1 play.
    await scrobble(listenerToken, trackA1.id);
    await scrobble(listenerToken, trackA2.id);
    await scrobble(listenerToken, trackB1.id);

    const res = await getTopArtists(listenerToken);
    expect(res.status).toBe(200);
    const body = await json<{ artistId: number; playCount: number }[]>(res);

    const artistAEntry = body.find((a) => a.artistId === artistA.id)!;
    const artistBEntry = body.find((a) => a.artistId === artistB.id)!;
    expect(artistAEntry.playCount).toBe(2);
    expect(artistBEntry.playCount).toBe(1);
    expect(body.indexOf(artistAEntry)).toBeLessThan(body.indexOf(artistBEntry));
  });
});
