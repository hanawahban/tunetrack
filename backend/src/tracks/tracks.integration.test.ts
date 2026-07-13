import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, patch, del, login, registerAs, json } from '../test/app';

async function createArtistAndAlbum(token: string) {
  const artist = await json<{ id: number }>(await post('/artists', { token, body: { name: 'Fleetwood Mac' } }));
  const album = await post('/albums', { token, body: { title: 'Rumours', artistId: artist.id } });
  return json<{ id: number }>(album);
}

describe('Tracks CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete a track nested under its album', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');
    const album = await createArtistAndAlbum(token);

    const create = await post('/tracks', { token, body: { title: 'Dreams', albumId: album.id } });
    expect(create.status).toBe(201);
    const track = await json<{ id: number }>(create);

    const read = await get(`/tracks/${track.id}`, { token });
    expect(read.status).toBe(200);
    expect((await json<{ album: { id: number } }>(read)).album.id).toBe(album.id);

    const update = await patch(`/tracks/${track.id}`, { token, body: { title: 'Dreams (renamed)' } });
    expect(update.status).toBe(200);
    expect((await json<{ title: string }>(update)).title).toBe('Dreams (renamed)');

    const remove = await del(`/tracks/${track.id}`, { token });
    expect(remove.status).toBe(200);
  });

  test('creating a track for a non-existent album -> 404', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await post('/tracks', { token, body: { title: 'Orphan Track', albumId: 999999 } });
    expect(res.status).toBe(404);
  });
});
