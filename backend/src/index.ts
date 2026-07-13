import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './auth/routes';
import { artistsRoutes } from './artists';
import { albumsRoutes } from './albums';
import { tracksRoutes } from './tracks';
import { scrobblesRoutes } from './scrobbles';
import { usersRoutes } from './users';

const app = new Elysia()
  .use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' }))
  .use(
    swagger({
      path: '/api/docs',
      documentation: {
        info: {
          title: 'TuneTrack API',
          description: 'Last.fm-style music scrobbling API',
          version: '1.0',
        },
        components: {
          securitySchemes: {
            bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    }),
  )
  .get('/health', () => ({ status: 'ok' }))
  .use(authRoutes)
  .use(artistsRoutes)
  .use(albumsRoutes)
  .use(tracksRoutes)
  .use(scrobblesRoutes)
  .use(usersRoutes)
  .listen(process.env.PORT ?? 3000);

const spec = await app
  .handle(new Request(`http://localhost/api/docs/json`))
  .then((res) => res.json());

const docsDir = join(process.cwd(), 'docs');
mkdirSync(docsDir, { recursive: true });
writeFileSync(join(docsDir, 'openapi.json'), JSON.stringify(spec, null, 2));

console.log(`🦊 TuneTrack API running at ${app.server?.hostname}:${app.server?.port}`);
