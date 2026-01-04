import { pgTable, serial, integer, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  displayName: varchar('display_name', { length: 255 }),
  accountId: varchar('account_id', { length: 255 }).notNull(),
});

export const maps = pgTable('maps', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  mapId: varchar('map_id', { length: 255 }).notNull().unique(),
  mapUid: varchar('map_uid', { length: 255 }).notNull().unique(),
  tmxId: varchar('tmx_id', { length: 255 }).notNull().unique(),
  author: integer('author').references(() => players.id),
  at: integer('at').notNull(),
  gold: integer('gold').notNull(),
  silver: integer('silver').notNull(),
  bronze: integer('bronze').notNull(),
  year: integer('year'),
  month: integer('month'),
  day: integer('day'),
  isTotd: boolean('is_totd').notNull().default(true),
  totdDate: timestamp('totd_date'),
  atCount: integer('at_count').notNull().default(0),
  laps: integer('laps').notNull().default(1),
  thumbnailUrl: text('thumbnail_url'),
  downloadUrl: text('download_url'),
});




