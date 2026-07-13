import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { patch, login, registerAs, json } from '../test/app';
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
});
