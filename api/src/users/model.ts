import { t } from 'elysia';
import { roleResponse } from '../auth/current-user';

export const updateRoleBody = t.Object({
  role: roleResponse,
});

export const userIdParam = t.Object({
  id: t.Number(),
});
