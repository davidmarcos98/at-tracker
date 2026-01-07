import 'dotenv/config';

import { db } from '@/src/db/index';
import { entries, maps, players } from '@/db/schema';

import { nadeoClient } from '@/src/lib/nadeo';
import { asc, and, eq,inArray, sql } from 'drizzle-orm';

async function fetchLeaderboardsForTotdMaps() {
    const mapsToFetch = await db.select().from(maps).orderBy(asc(maps.lastLeaderboardUpdate))
    const playersToCheck = [
        "3bb0d130-637d-46a6-9c19-87fe4bda3c52",
        "4da5e1c9-bc7e-4d6f-82de-a891dd1ddec6",
        "d6706f9f-8e24-402b-a57e-aaf098999c79",
        "8bbc6ce3-7a8a-4275-88c3-e1b0a94e0871",
        "0866046e-d9fd-4181-9b73-d9890aacc5e8",
        "04b139f8-02b9-43bb-9312-39a2cea0a48c",
        "8f08302a-f670-463b-9f71-fbfacffb8bd1",
        "b2aaf54a-2577-4f6b-86a6-cd45779db291",
        "d110d3dc-5dd3-4714-82ae-15633a0e78d3",
        "edb9dfe7-d7cf-4add-8a5e-d992fa2a35bb",
        "8ba5bc33-23c5-429e-8058-b7052a8671d7",
        "4a983dc3-a938-4564-8a1c-8be20779f069",
        "4a13477e-5b7a-4a74-85ce-f8157565e577",
        "0b33f132-27b3-4875-9aab-7e121f1d2b70",
        "de5258ed-2c15-46be-8354-961e300d745b",
        "794a286c-44d9-4276-83ce-431cba7bab74",
        "957c9eb3-228b-4244-8e6c-834f7300dca5",
        "0716708a-93d5-4a30-9b2d-0f9dea7d05f0",
        "d12d8253-9d86-4883-80e5-72268163b64d",
        "0cf03ab8-4e41-40fd-963e-d206a574762f",
        "bb52ccd2-9073-4102-9244-49ae09e8d81f",
        "1cb0a300-eb5b-4043-9383-e5db200e57e3",
        "1ed6e24f-d4f1-4e8b-a1de-408e594a0091",
        "e2f42d3d-873f-4706-bf37-636a6296c7f0",
        "01fe5b11-5ada-48a0-9da7-367e153ac3ad",
        "a06bf942-b2c8-4e3e-9fa8-b421fe5bb451",
        "6b9a48bf-a0b4-452a-9151-1e3b53133faf",
        "a6ae76c9-9030-4a7b-b533-cacfd6e85cb2",
        "1f79e3c4-7405-4f3b-89a1-33e643ccf0e6",
        "02a246c7-9f24-4dcd-b1fc-f94c502ed43c",
        "d0c472a0-3435-42c0-8c05-e88bc652d1c1",
        "02fde1ae-d96e-4850-a035-045cf8d62d8c",
        "3552887e-a795-45e3-8f96-09ae42d9f5d4",
        "7f36b9a1-c368-49b5-8ffa-2d7d9b9f02a6",
        "8f18d62e-1943-4734-8a09-d52eab71f3a3",
        "e8f35258-b507-487d-b470-52587d1445a6",
        "ae28d21f-9088-4879-8997-667744d974d9",
        "3b417a4c-c190-4951-90f4-6454e4475740",
        "ba023a24-6fa2-4142-a299-4f85eb2e017f",
        "85153284-39e3-49f6-8a88-750984250829",
        "6e07a8a6-b63e-4264-8f4d-bd73ba87184e",
        "0e9517aa-275e-4b1c-b434-d747112b2000",
        "d134b72b-6eeb-48d8-b5c3-7c9ce9c6c8c5",
        "da4642f9-6acf-43fe-88b6-b120ff1308ba",
        "6396db1b-d454-47e5-b069-e3cdfbbe6f1d",
        "1456fca8-32b5-479c-adfb-45965ca14229",
        "eb1bb528-0b56-4fba-a450-256ce2d55182",
        "6c26b761-bd62-42b5-8190-e3e732c2b937",
        "967a0fbc-3d3a-47d6-8b11-d0877f0223a8",
    ];

    //const missingMaps = await Promise.all(playersToCheck.map(async (player) => await db.select().from(entries).where(eq(entries.playerId, player))));

    for (const map of mapsToFetch) {
        //if (missingMaps.every(maplist => maplist.map(m => m.mapId).includes(map.mapUid))) {
        //    continue;
        //}
        console.log(`Fetching leaderboard for TOTD map: ${map.mapUid}, ${map.atCount} ATs [${mapsToFetch.indexOf(map)}/${mapsToFetch.length}]`);
        const leaderboard = await nadeoClient.getUserRecordsOnMap(playersToCheck, map.mapId, map.medalAuthor);

        let insertData = leaderboard.map(entry => ({
            mapId: map.mapUid,
            playerId: entry.accountId,
            time: entry.time,
            rank: -1,
            date: new Date(Date.parse(entry.timestamp)),
            isAt: entry.isAT,
        }));

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
    }
    for (const player of playersToCheck) {
        let atEntries = await db.$count(entries, and(eq(entries.playerId, player), eq(entries.isAt, true)));
        await db.update(players).set({atCount: atEntries}).where(eq(players.accountId, player));
    }

    return process.exit(1)
}

fetchLeaderboardsForTotdMaps();