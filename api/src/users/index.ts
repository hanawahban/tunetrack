import { Elysia, status } from 'elysia';
import { httpError } from '../common/http-error';
import { notFoundResponse } from '../common/model';
import { authGuard } from '../auth/guard';
import { userResponse, toUserResponse } from '../auth/current-user';
import { UsersService } from './service';
import { updateRoleBody, userIdParam } from './model';

export const usersRoutes = new Elysia({ prefix: '/users', tags: ['Users'] })
  .use(authGuard)
  .patch(
    '/:id/role',
    async ({ params, body }) => {
      const result = await UsersService.updateRole(params.id, body.role);
      if (result.outcome === 'not_found') return httpError(404, `User ${params.id} not found`);
      if (result.outcome === 'forbidden') return httpError(403, "Cannot change another admin's role");
      return status(200, toUserResponse(result.user));
    },
    {
      params: userIdParam,
      body: updateRoleBody,
      response: { 200: userResponse, 404: notFoundResponse, 403: notFoundResponse },
      roles: ['ADMIN'],
    },
  );
