import { beforeEach, describe, expect, test } from 'bun:test';
import { resetDb } from '../test/db';
import { post, json } from '../test/app';

function register(email: string, password = 'password123') {
  return post('/auth/register', { body: { email, password } });
}

describe('POST /auth/register', () => {
  beforeEach(resetDb);

  test('201 on success, defaults to LISTENER', async () => {
    const res = await register('new@test.com');
    expect(res.status).toBe(201);
    const body = await json<{ role: string; email: string; password?: string }>(res);
    expect(body.role).toBe('INTENTIONALLY_BROKEN_FOR_CI_DEMO');
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
    const res = await post('/auth/login', { body: { email: 'login@test.com', password: 'wrong-password' } });
    expect(res.status).toBe(401);
  });

  test('401 for an email that was never registered', async () => {
    const res = await post('/auth/login', { body: { email: 'nobody@test.com', password: 'password123' } });
    expect(res.status).toBe(401);
  });

  test('201 + access_token on success', async () => {
    await register('login2@test.com');
    const res = await post('/auth/login', { body: { email: 'login2@test.com', password: 'password123' } });
    expect(res.status).toBe(201);
    const body = await json<{ access_token: string }>(res);
    expect(typeof body.access_token).toBe('string');
  });
});
