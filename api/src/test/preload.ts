import { afterAll, mock } from 'bun:test';
import { client, testDb, ready } from './db';

await ready;

mock.module('../db', () => ({ db: testDb }));

afterAll(() => client.close());
