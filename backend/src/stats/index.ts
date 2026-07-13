import { Elysia, t } from 'elysia';
import { authGuard } from '../auth/guard';
import { StatsService } from './service';
import { topArtistResponse } from './model';

export const statsRoutes = new Elysia({ prefix: '/stats', tags: ['Stats'] })
  .use(authGuard)
  .get(
    '/top-artists',
    ({ user }) => StatsService.topArtists(user.id),
    { response: { 200: t.Array(topArtistResponse) }, auth: true },
  );
