import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { patch, post, login, registerAs, json } from '../test/app';
import type { Role } from '../db/schema';

describe('PATCH /users/:id/role', () => {
  beforeEach(resetDb);

  test.each([
    ['no token', null, 401],
    ['listener token', 'LISTENER', 403],
    ['curator token', 'CURATOR', 403],
  ] as const)('%s -> %d', async (_label, requesterRole, expected) => {
    const target = await registerAs('target@test.com', 'LISTENER');
    let token: string | undefined;
    if (requesterRole) {
      await registerAs('requester@test.com', requesterRole);
      token = await login('requester@test.com', 'password123');
    }
    const res = await patch(`/users/${target.id}/role`, { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(expected);
  });

  test('admin token, missing user -> 404', async () => {
    await registerAs('admin1@test.com', 'ADMIN');
    const token = await login('admin1@test.com', 'password123');
    const res = await patch('/users/999999/role', { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(404);
  });

  test('admin token, existing user -> 200 and role updated', async () => {
    await registerAs('admin2@test.com', 'ADMIN');
    const target = await registerAs('target3@test.com', 'LISTENER');
    const token = await login('admin2@test.com', 'password123');
    const res = await patch(`/users/${target.id}/role`, { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(200);
    const body = await json<{ role: Role }>(res);
    expect(body.role).toBe('CURATOR');
  });

  test('an admin cannot demote themselves -> 403', async () => {
    const admin = await registerAs('self-admin@test.com', 'ADMIN');
    const token = await login('self-admin@test.com', 'password123');
    const res = await patch(`/users/${admin.id}/role`, { token, body: { role: 'LISTENER' } });
    expect(res.status).toBe(403);
  });

  test('an admin cannot demote another admin -> 403', async () => {
    await registerAs('admin3@test.com', 'ADMIN');
    const otherAdmin = await registerAs('admin4@test.com', 'ADMIN');
    const token = await login('admin3@test.com', 'password123');
    const res = await patch(`/users/${otherAdmin.id}/role`, { token, body: { role: 'LISTENER' } });
    expect(res.status).toBe(403);
  });

  test('a role change takes effect on the next request without re-login', async () => {
    await registerAs('admin5@test.com', 'ADMIN');
    const adminToken = await login('admin5@test.com', 'password123');
    const listener = await registerAs('promoted@test.com', 'LISTENER');
    const listenerToken = await login('promoted@test.com', 'password123');

    // a LISTENER can't create an artist yet
    const before = await post('/artists', { token: listenerToken, body: { name: 'Too Early' } });
    expect(before.status).toBe(403);

    const promote = await patch(`/users/${listener.id}/role`, {
      token: adminToken,
      body: { role: 'CURATOR' },
    });
    expect(promote.status).toBe(200);

    // same (already-issued) token, no re-login -- the guard re-fetches the role per request
    const after = await post('/artists', { token: listenerToken, body: { name: 'Now Allowed' } });
    expect(after.status).toBe(201);
  });
});
