import { status } from 'elysia';

const ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
};

/** Mirrors Nest's default HttpException JSON shape ({statusCode, message, error}) for response parity. */
export function httpError(code: number, message: string) {
  return status(code, { statusCode: code, message, error: ERROR_NAMES[code] ?? 'Error' });
}
