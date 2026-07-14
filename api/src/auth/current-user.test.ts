import { describe, expect, test } from 'bun:test';
import { toUserResponse } from './current-user';

describe('toUserResponse', () => {
  test('serializes the createdAt Date to an ISO string, keeps other fields as-is', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const result = toUserResponse({ id: 1, email: 'a@test.com', role: 'CURATOR', createdAt });
    expect(result).toEqual({
      id: 1,
      email: 'a@test.com',
      role: 'CURATOR',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
