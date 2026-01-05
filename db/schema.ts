import { pgTable, serial, integer, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

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
  medalAuthor: integer('medal_author').notNull(),
  medalGold: integer('medal_gold').notNull(),
  medalSilver: integer('medal_silver').notNull(),
  medalBronze: integer('medal_bronze').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  day: integer('day').notNull(),
  isTotd: boolean('is_totd').notNull().default(true),
  totdDate: timestamp('totd_date'),
  atCount: integer('at_count').notNull().default(0),
  laps: integer('laps').notNull().default(1),
  thumbnailUrl: text('thumbnail_url'),
  downloadUrl: text('download_url'),
});

export const mapsRelations = relations(players, ({ many }) => ({
    maps: many(maps),
}));

export const authorRelation = relations(maps, ({ one }) => ({
    authorPlayer: one(players, {
        fields: [maps.author],
        references: [players.id],
    }),
}));



