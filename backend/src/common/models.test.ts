import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { sharedModels } from './models';

describe('sharedModels', () => {
  test('registers AlbumResponse, AlbumSummary, TrackResponse, and Role as named components/schemas', async () => {
    const app = new Elysia().use(swagger()).use(sharedModels);
    const res = await app.handle(new Request('http://localhost/swagger/json'));
    const spec = (await res.json()) as { components?: { schemas?: Record<string, unknown> } };
    const schemaNames = Object.keys(spec.components?.schemas ?? {});

    expect(schemaNames).toContain('AlbumResponse');
    expect(schemaNames).toContain('AlbumSummary');
    expect(schemaNames).toContain('TrackResponse');
    expect(schemaNames).toContain('Role');
  });
});
