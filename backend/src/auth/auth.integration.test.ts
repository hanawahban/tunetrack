import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { testApp } from '../test/app';

function register(email: string, password = 'password123') {
  return testApp.handle(
    new Request('http://localhost/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
}

function loginRaw(email: string, password: string) {
  return testApp.handle(
    new Request('http://localhost/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
}

describe('POST /auth/register', () => {
  beforeEach(resetDb);

  test('201 on success, defaults to LISTENER', async () => {
    const res = await register('new@test.com');
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.role).toBe('LISTENER');
    expect(body.email).toBe('new@test.com');
    expect(body.password).toBeUndefined();
  });

  test('409 on duplicate email', async () => {
    await register('dupe@test.com');
    const res = await register('dupe@test.com');
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  beforeEach(resetDb);

  test('401 on wrong password', async () => {
    await register('login@test.com');
    const res = await loginRaw('login@test.com', 'wrong-password');
    expect(res.status).toBe(401);
  });

  test('401 for an email that was never registered', async () => {
    const res = await loginRaw('nobody@test.com', 'password123');
    expect(res.status).toBe(401);
  });

  test('201 + access_token on success', async () => {
    await register('login2@test.com');
    const res = await loginRaw('login2@test.com', 'password123');
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.access_token).toBe('string');
  });
});
