import { t } from 'elysia';

export const updateRoleBody = t.Object({
  role: t.Union([t.Literal('ADMIN'), t.Literal('CURATOR'), t.Literal('LISTENER')]),
});

export const userIdParam = t.Object({
  id: t.Number(),
});
