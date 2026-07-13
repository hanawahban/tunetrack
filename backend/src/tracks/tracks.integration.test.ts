import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';

async function createArtistAndAlbum(token: string) {
  const artistRes = await testApp.handle(
    new Request('http://localhost/artists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authed(token) },
      body: JSON.stringify({ name: 'Fleetwood Mac' }),
    }),
  );
  const artist = await artistRes.json();
  const albumRes = await testApp.handle(
    new Request('http://localhost/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authed(token) },
      body: JSON.stringify({ title: 'Rumours', artistId: artist.id }),
    }),
  );
  return albumRes.json();
}

describe('Tracks CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete a track nested under its album', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');
    const album = await createArtistAndAlbum(token);

    const create = await testApp.handle(
      new Request('http://localhost/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ title: 'Dreams', albumId: album.id }),
      }),
    );
    expect(create.status).toBe(201);
    const track = await create.json();

    const read = await testApp.handle(
      new Request(`http://localhost/tracks/${track.id}`, { headers: authed(token) }),
    );
    expect(read.status).toBe(200);
    expect((await read.json()).album.id).toBe(album.id);

    const update = await testApp.handle(
      new Request(`http://localhost/tracks/${track.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ title: 'Dreams (renamed)' }),
      }),
    );
    expect(update.status).toBe(200);
    expect((await update.json()).title).toBe('Dreams (renamed)');

    const remove = await testApp.handle(
      new Request(`http://localhost/tracks/${track.id}`, { method: 'DELETE', headers: authed(token) }),
    );
    expect(remove.status).toBe(200);
  });

  test('creating a track for a non-existent album -> 404', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ title: 'Orphan Track', albumId: 999999 }),
      }),
    );
    expect(res.status).toBe(404);
  });
});
