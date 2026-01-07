import 'dotenv/config';

import { db } from '@/src/db/index';
import { entries, maps, players } from '@/db/schema';

import { nadeoClient } from '@/src/lib/nadeo';
import { asc, desc, eq, sql } from 'drizzle-orm';

async function fetchLeaderboardsForTotdMaps() {
    const mapsToFetch = await db.select().from(maps).orderBy(asc(maps.lastLeaderboardUpdate)).limit(1000)

    for (const map of mapsToFetch) {
        console.log(`Fetching leaderboard for TOTD map: ${map.mapUid}, ${map.atCount} ATs`);
        const leaderboard = await nadeoClient.getLeaderboardUpToAuthorMedal(map.mapUid, map.medalAuthor, map.atCount);
        // Here you would save the leaderboard data to your database
        let insertData = leaderboard.map(entry => ({
            mapId: map.mapUid,
            playerId: entry.accountId,
            time: entry.score,
            rank: entry.position,
            date: new Date(entry.timestamp * 1000),
            isAt: true,
        }));
        let playersData = leaderboard.map(entry => ({accountId: entry.accountId, displayName: "Unknown"}));
        // Ensures all players exist, even if unknown displayname
        await db.insert(players).values(playersData).onConflictDoNothing();

        const result = await db
              .insert(entries)
              .values(insertData)
              .onConflictDoUpdate({
                target: [entries.mapId, entries.playerId],
                set: {
                    time: sql`excluded.time`,
                    rank: sql`excluded.rank`,
                }
              });

        await db
            .update(maps)
            .set({
                lastLeaderboardUpdate: new Date(),
            })
            .where(eq(maps.mapUid, map.mapUid));


        console.log(`Inserted ${insertData.length} leaderboard entries for map ${map.name}`);
    }

    return process.exit(1)
}

fetchLeaderboardsForTotdMaps();