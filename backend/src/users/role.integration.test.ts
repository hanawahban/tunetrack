import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp, login, authed, registerAs } from '../test/app';
import type { Role } from '../db/schema';

function patchRole(id: number, role: Role, token?: string) {
  return testApp.handle(
    new Request(`http://localhost/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? authed(token) : {}) },
      body: JSON.stringify({ role }),
    }),
  );
}

describe('PATCH /users/:id/role', () => {
  beforeEach(resetDb);

  test('no token -> 401', async () => {
    const res = await patchRole(1, 'CURATOR');
    expect(res.status).toBe(401);
  });

  test('listener token -> 403', async () => {
    await registerAs('listener@test.com', 'LISTENER');
    const target = await registerAs('target1@test.com', 'LISTENER');
    const token = await login('listener@test.com', 'password123');
    const res = await patchRole(target.id, 'CURATOR', token);
    expect(res.status).toBe(403);
  });

  test('curator token -> 403', async () => {
    await registerAs('curator@test.com', 'CURATOR');
    const target = await registerAs('target2@test.com', 'LISTENER');
    const token = await login('curator@test.com', 'password123');
    const res = await patchRole(target.id, 'CURATOR', token);
    expect(res.status).toBe(403);
  });

  test('admin token, missing user -> 404', async () => {
    await registerAs('admin1@test.com', 'ADMIN');
    const token = await login('admin1@test.com', 'password123');
    const res = await patchRole(999999, 'CURATOR', token);
    expect(res.status).toBe(404);
  });

  test('admin token, existing user -> 200 and role updated', async () => {
    await registerAs('admin2@test.com', 'ADMIN');
    const target = await registerAs('target3@test.com', 'LISTENER');
    const token = await login('admin2@test.com', 'password123');
    const res = await patchRole(target.id, 'CURATOR', token);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.role).toBe('CURATOR');
  });
});
