import { eq } from 'drizzle-orm';
import { db } from '../db';
import { artists } from '../db/schema';

export async function createArtist(name: string) {
  const [artist] = await db.insert(artists).values({ name }).returning();
  return artist!;
}

export function findAllArtists() {
  return db.query.artists.findMany({ with: { albums: true } });
}

export function findArtistById(id: number) {
  return db.query.artists.findFirst({ where: eq(artists.id, id), with: { albums: true } });
}

export async function updateArtist(id: number, name: string | undefined) {
  const [updated] = await db.update(artists).set({ name }).where(eq(artists.id, id)).returning();
  return updated;
}

export async function removeArtist(id: number) {
  const [deleted] = await db.delete(artists).where(eq(artists.id, id)).returning();
  return deleted;
}
