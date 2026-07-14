import { relations } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('Role', ['ADMIN', 'CURATOR', 'LISTENER']);
export type Role = (typeof roleEnum.enumValues)[number];

export const artists = pgTable('Artist', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
});

export const albums = pgTable('Album', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  releaseYear: integer('releaseYear'),
  imageUrl: text('imageUrl'),
  genre: text('genre'),
  artistId: integer('artistId')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
});

export const tracks = pgTable('Track', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  albumId: integer('albumId')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
});

export const users = pgTable(
  'User',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    role: roleEnum('role').notNull().default('LISTENER'),
    createdAt: timestamp('createdAt', { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('User_email_key').on(table.email)],
);

export const scrobbles = pgTable(
  'Scrobble',
  {
    id: serial('id').primaryKey(),
    userId: integer('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    trackId: integer('trackId')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    playedAt: timestamp('playedAt', { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [index('Scrobble_userId_playedAt_idx').on(table.userId, table.playedAt)],
);

export const artistsRelations = relations(artists, ({ many }) => ({
  albums: many(albums),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, { fields: [albums.artistId], references: [artists.id] }),
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  album: one(albums, { fields: [tracks.albumId], references: [albums.id] }),
  scrobbles: many(scrobbles),
}));

export const usersRelations = relations(users, ({ many }) => ({
  scrobbles: many(scrobbles),
}));

export const scrobblesRelations = relations(scrobbles, ({ one }) => ({
  user: one(users, { fields: [scrobbles.userId], references: [users.id] }),
  track: one(tracks, { fields: [scrobbles.trackId], references: [tracks.id] }),
}));

export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type User = typeof users.$inferSelect;
export type Scrobble = typeof scrobbles.$inferSelect;
