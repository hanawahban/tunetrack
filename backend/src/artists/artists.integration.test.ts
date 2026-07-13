import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';

describe('Artists CRUD', () => {
  beforeEach(resetDb);

  test('curator can create, read, update, delete an artist', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const token = await login('curator@test.com', 'password123');

    const create = await testApp.handle(
      new Request('http://localhost/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ name: 'Fleetwood Mac' }),
      }),
    );
    expect(create.status).toBe(201);
    const artist = await create.json();
    expect(artist.name).toBe('Fleetwood Mac');

    const read = await testApp.handle(
      new Request(`http://localhost/artists/${artist.id}`, { headers: authed(token) }),
    );
    expect(read.status).toBe(200);

    const update = await testApp.handle(
      new Request(`http://localhost/artists/${artist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ name: 'Fleetwood Mac (renamed)' }),
      }),
    );
    expect(update.status).toBe(200);
    expect((await update.json()).name).toBe('Fleetwood Mac (renamed)');

    const remove = await testApp.handle(
      new Request(`http://localhost/artists/${artist.id}`, {
        method: 'DELETE',
        headers: authed(token),
      }),
    );
    expect(remove.status).toBe(200);

    const readAfterDelete = await testApp.handle(
      new Request(`http://localhost/artists/${artist.id}`, { headers: authed(token) }),
    );
    expect(readAfterDelete.status).toBe(404);
  });

  test('missing required name -> 422 validation error', async () => {
    await registerAs('curator2@test.com', 'CURATOR');
    const token = await login('curator2@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(422);
  });

  test('listener cannot create an artist -> 403', async () => {
    await registerAs('listener@test.com', 'LISTENER');
    const token = await login('listener@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authed(token) },
        body: JSON.stringify({ name: 'Should Fail' }),
      }),
    );
    expect(res.status).toBe(403);
  });

  test('reading a missing artist -> 404', async () => {
    await registerAs('listener2@test.com', 'LISTENER');
    const token = await login('listener2@test.com', 'password123');
    const res = await testApp.handle(
      new Request('http://localhost/artists/999999', { headers: authed(token) }),
    );
    expect(res.status).toBe(404);
  });
});
