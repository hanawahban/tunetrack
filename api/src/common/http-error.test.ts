import { describe, expect, test } from 'bun:test';
import { httpError } from './http-error';

describe('httpError', () => {
  test('builds the Nest-style error shape for a known status', () => {
    const res = httpError(404, 'Artist 1 not found');
    expect(res).toEqual({
      code: 404,
      response: { statusCode: 404, message: 'Artist 1 not found', error: 'Not Found' },
    });
  });

  test.each([
    [400, 'Bad Request'],
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
    [409, 'Conflict'],
  ])('maps status %d to error name %s', (code, error) => {
    const res = httpError(code, 'x');
    expect(res.response.error).toBe(error);
  });

  test('falls back to "Error" for an unmapped status', () => {
    const res = httpError(418, "I'm a teapot");
    expect(res.response.error).toBe('Error');
  });
});
