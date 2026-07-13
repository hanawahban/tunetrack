import { t } from 'elysia';

export const notFoundResponse = t.Object({
  statusCode: t.Number(),
  message: t.String(),
  error: t.String(),
});
