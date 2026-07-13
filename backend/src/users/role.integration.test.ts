import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { patch, post, login, registerAs, json } from '../test/app';
import type { Role } from '../db/schema';

describe('PATCH /users/:id/role', () => {
  beforeEach(resetDb);

  test.each([
    ['no token', null, 'LISTENER', 401],
    ['listener token', 'LISTENER', 'LISTENER', 403],
    ['curator token', 'CURATOR', 'LISTENER', 403],
    ['admin demoting self', 'ADMIN', 'SELF', 403],
    ['admin demoting admin', 'ADMIN', 'ADMIN', 403],
  ] as const)('%s -> %d', async (_label, requesterRole, targetKind, expected) => {
    let token: string | undefined;
    let requesterId: number | undefined;
    if (requesterRole) {
      const requester = await registerAs('requester@test.com', requesterRole);
      requesterId = requester.id;
      token = await login('requester@test.com', 'password123');
    }

    let targetId: number;
    if (targetKind === 'SELF') {
      targetId = requesterId!;
    } else if (targetKind === 'ADMIN') {
      const otherAdmin = await registerAs('other-admin@test.com', 'ADMIN');
      targetId = otherAdmin.id;
    } else {
      const target = await registerAs('target@test.com', 'LISTENER');
      targetId = target.id;
    }

    const res = await patch(`/users/${targetId}/role`, { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(expected);
  });

  test('admin token, missing user -> 404', async () => {
    await registerAs('admin1@test.com', 'ADMIN');
    const token = await login('admin1@test.com', 'password123');
    const res = await patch('/users/999999/role', { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(404);
  });

  test('admin token, existing (non-admin) user -> 200 and role updated', async () => {
    await registerAs('admin2@test.com', 'ADMIN');
    const target = await registerAs('target3@test.com', 'LISTENER');
    const token = await login('admin2@test.com', 'password123');
    const res = await patch(`/users/${target.id}/role`, { token, body: { role: 'CURATOR' } });
    expect(res.status).toBe(200);
    const body = await json<{ role: Role }>(res);
    expect(body.role).toBe('CURATOR');
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
