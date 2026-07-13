import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';

describe('GET /scrobbles/recent', () => {
  beforeEach(resetDb);

  test('nests track -> album -> artist on each scrobble', async () => {
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

    await registerAs('listener@test.com', 'LISTENER');
    const listenerToken = await login('listener@test.com', 'password123');

    const scrobbleRes = await testApp.handle(
      new Request('http://localhost/scrobbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(listenerToken) },
        body: JSON.stringify({ trackId: track.id }),
      }),
    );
    expect(scrobbleRes.status).toBe(201);

    const recentRes = await testApp.handle(
      new Request('http://localhost/scrobbles/recent', { headers: authed(listenerToken) }),
    );
    expect(recentRes.status).toBe(200);
    const [scrobble] = await recentRes.json();
    expect(scrobble.track.id).toBe(track.id);
    expect(scrobble.track.album.id).toBe(album.id);
    expect(scrobble.track.album.artist.id).toBe(artist.id);
  });

  test('scrobbling a non-existent track -> 404', async () => {
    await registerAs('listener2@test.com', 'LISTENER');
    const token = await login('listener2@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/scrobbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ trackId: 999999 }),
      }),
    );
    expect(res.status).toBe(404);
  });
});
