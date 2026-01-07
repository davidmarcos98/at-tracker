import { pgTable, serial, integer, varchar, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

export const players = pgTable('players', {
  displayName: varchar('display_name', { length: 255 }),
  accountId: varchar('account_id', { length: 255 }).notNull().primaryKey(),
  atCount: integer('at_count').notNull().default(0),
});

export const maps = pgTable('maps', {
  name: text('name').notNull(),
  mapId: varchar('map_id', { length: 255 }).notNull().unique(),
  mapUid: varchar('map_uid', { length: 255 }).notNull().unique().primaryKey(),
  tmxId: varchar('tmx_id', { length: 255 }).unique(),
  author: varchar('author_id', { length: 255 }).notNull().references(() => players.accountId),
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
  lastLeaderboardUpdate: timestamp('last_leaderboard_update').defaultNow(),
});

export const entries = pgTable('entries', {
  mapId: varchar('map_uid', { length: 255 }).notNull().references(() => maps.mapUid),
  playerId: varchar('player_id', { length: 255 }).notNull().references(() => players.accountId),
  time: integer('time').notNull(),
  rank: integer('rank').notNull(),
  date: timestamp('date').notNull(),
  isAt: boolean('is_at').notNull().default(true),
}, (t) => [unique('player_map').on(t.playerId, t.mapId)]);

export const mapsRelations = relations(players, ({ many }) => ({
    maps: many(maps),
}));

export const authorRelation = relations(maps, ({ one }) => ({
    authorPlayer: one(players, {
        fields: [maps.author],
        references: [players.accountId],
    }),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
    entryPlayer: one(players, {
        fields: [entries.playerId],
        references: [players.accountId],
    }),
}));





