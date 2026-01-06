import 'dotenv/config';

import { db } from '@/src/db/index';
import { maps } from '@/db/schema';

import { nadeoClient } from '@/src/lib/nadeo';
import { asc, eq } from 'drizzle-orm';

async function fetchLeaderboardsForTotdMaps() {
    const mapsToFetch = await db.select().from(maps).where(eq(maps.mapUid, "iaG1S5iES9orl0bMCc9NKp_BVtb")).orderBy(asc(maps.atCount)).limit(1)

    console.log(mapsToFetch)
    for (const map of mapsToFetch) {
        console.log(`Fetching leaderboard for TOTD map: ${map.mapUid}, ${map.atCount} ATs`);
        const leaderboard = await nadeoClient.getLeaderboardUpToAuthorMedal(map.mapUid, map.medalAuthor);
        console.log(leaderboard);
        // Here you would save the leaderboard data to your database
    }

    return process.exit(1)
}

fetchLeaderboardsForTotdMaps();