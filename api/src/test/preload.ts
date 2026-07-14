import { mock } from 'bun:test';
import { testDb, ready } from './db';

await ready;

mock.module('../db', () => ({ db: testDb }));
