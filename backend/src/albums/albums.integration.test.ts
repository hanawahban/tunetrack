import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';

async function createArtist(token: string, name = 'Fleetwood Mac') {
  const res = await testApp.handle(
    new Request('http://localhost/artists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authed(token) },
      body: JSON.stringify({ name }),
    }),
  );
  return res.json();
}

describe('Albums CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete an album nested under its artist', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');
    const artist = await createArtist(token);

    const create = await testApp.handle(
      new Request('http://localhost/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ title: 'Rumours', artistId: artist.id }),
      }),
    );
    expect(create.status).toBe(201);
    const album = await create.json();
    expect(album.title).toBe('Rumours');

    const read = await testApp.handle(
      new Request(`http://localhost/albums/${album.id}`, { headers: authed(token) }),
    );
    expect(read.status).toBe(200);
    expect((await read.json()).artist.id).toBe(artist.id);

    const update = await testApp.handle(
      new Request(`http://localhost/albums/${album.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ releaseYear: 1977 }),
      }),
    );
    expect(update.status).toBe(200);
    expect((await update.json()).releaseYear).toBe(1977);

    const remove = await testApp.handle(
      new Request(`http://localhost/albums/${album.id}`, { method: 'DELETE', headers: authed(token) }),
    );
    expect(remove.status).toBe(200);
  });

  test('creating an album for a non-existent artist -> 404', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ title: 'Orphan Album', artistId: 999999 }),
      }),
    );
    expect(res.status).toBe(404);
  });

  test('missing required title -> 422 validation error', async () => {
    await registerAs('curator3@test.com', 'CURATOR');
    const token = await login('curator3@test.com', 'password123');
    const artist = await createArtist(token);
    const res = await testApp.handle(
      new Request('http://localhost/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ artistId: artist.id }),
      }),
    );
    expect(res.status).toBe(422);
  });
});
