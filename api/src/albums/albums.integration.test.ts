import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, patch, del, login, registerAs, json } from '../test/app';

async function createArtist(token: string, name = 'Fleetwood Mac') {
  const res = await post('/artists', { token, body: { name } });
  return json<{ id: number; name: string }>(res);
}

describe('Albums CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete an album nested under its artist', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');
    const artist = await createArtist(token);

    const create = await post('/albums', { token, body: { title: 'Rumours', artistId: artist.id } });
    expect(create.status).toBe(201);
    const album = await json<{ id: number; title: string }>(create);
    expect(album.title).toBe('Rumours');

    const read = await get(`/albums/${album.id}`, { token });
    expect(read.status).toBe(200);
    expect((await json<{ artist: { id: number } }>(read)).artist.id).toBe(artist.id);

    const update = await patch(`/albums/${album.id}`, { token, body: { releaseYear: 1977 } });
    expect(update.status).toBe(200);
    expect((await json<{ releaseYear: number }>(update)).releaseYear).toBe(1977);

    const remove = await del(`/albums/${album.id}`, { token });
    expect(remove.status).toBe(200);
  });

  test('creating an album with a genre round-trips it', async () => {
    await registerAs('curator4@test.com', 'CURATOR');
    const token = await login('curator4@test.com', 'password123');
    const artist = await createArtist(token);
    const res = await post('/albums', { token, body: { title: 'Rumours', artistId: artist.id, genre: 'Rock' } });
    expect(res.status).toBe(201);
    expect((await json<{ genre: string | null }>(res)).genre).toBe('Rock');
  });

  test('creating an album without a genre defaults to null', async () => {
    await registerAs('curator5@test.com', 'CURATOR');
    const token = await login('curator5@test.com', 'password123');
    const artist = await createArtist(token);
    const res = await post('/albums', { token, body: { title: 'Rumours', artistId: artist.id } });
    expect(res.status).toBe(201);
    expect((await json<{ genre: string | null }>(res)).genre).toBeNull();
  });

  test('updating an album can set its genre', async () => {
    await registerAs('curator6@test.com', 'CURATOR');
    const token = await login('curator6@test.com', 'password123');
    const artist = await createArtist(token);
    const created = await json<{ id: number }>(
      await post('/albums', { token, body: { title: 'Rumours', artistId: artist.id } }),
    );
    const res = await patch(`/albums/${created.id}`, { token, body: { genre: 'Jazz' } });
    expect(res.status).toBe(200);
    expect((await json<{ genre: string | null }>(res)).genre).toBe('Jazz');
  });

  test('creating an album for a non-existent artist -> 404', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await post('/albums', { token, body: { title: 'Orphan Album', artistId: 999999 } });
    expect(res.status).toBe(404);
  });

  test('missing required title -> 422 validation error', async () => {
    await registerAs('curator3@test.com', 'CURATOR');
    const token = await login('curator3@test.com', 'password123');
    const artist = await createArtist(token);
    const res = await post('/albums', { token, body: { artistId: artist.id } });
    expect(res.status).toBe(422);
  });
});
