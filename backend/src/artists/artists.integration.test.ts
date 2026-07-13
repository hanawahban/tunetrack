import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { get, post, patch, del, login, registerAs, json } from '../test/app';

describe('Artists CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete an artist', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');

    const create = await post('/artists', { token, body: { name: 'Fleetwood Mac' } });
    expect(create.status).toBe(201);
    const artist = await json<{ id: number; name: string }>(create);
    expect(artist.name).toBe('Fleetwood Mac');

    const read = await get(`/artists/${artist.id}`, { token });
    expect(read.status).toBe(200);

    const update = await patch(`/artists/${artist.id}`, { token, body: { name: 'Fleetwood Mac (renamed)' } });
    expect(update.status).toBe(200);
    expect((await json<{ name: string }>(update)).name).toBe('Fleetwood Mac (renamed)');

    const remove = await del(`/artists/${artist.id}`, { token });
    expect(remove.status).toBe(200);

    const readAfterDelete = await get(`/artists/${artist.id}`, { token });
    expect(readAfterDelete.status).toBe(404);
  });

  test('missing required name -> 422 validation error', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await post('/artists', { token, body: {} });
    expect(res.status).toBe(422);
  });

  test('listener cannot create an artist -> 403', async () => {
    await registerAs('listener@test.com', 'LISTENER');
    const token = await login('listener@test.com', 'password123');
    const res = await post('/artists', { token, body: { name: 'Should Fail' } });
    expect(res.status).toBe(403);
  });

  test('reading a missing artist -> 404', async () => {
    await registerAs('listener2@test.com', 'LISTENER');
    const token = await login('listener2@test.com', 'password123');
    const res = await get('/artists/999999', { token });
    expect(res.status).toBe(404);
  });
});
