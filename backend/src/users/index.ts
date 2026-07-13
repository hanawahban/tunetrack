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
      const target = await UsersService.findById(params.id);
      if (!target) return httpError(404, `User ${params.id} not found`);
      if (target.role === 'ADMIN') {
        return httpError(403, "Cannot change another admin's role");
      }
      const updated = await UsersService.updateRole(params.id, body.role);
      return status(200, toUserResponse(updated!));
    },
    {
      params: userIdParam,
      body: updateRoleBody,
      response: { 200: userResponse, 404: notFoundResponse, 403: notFoundResponse },
      roles: ['ADMIN'],
    },
  );
