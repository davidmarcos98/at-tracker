import { db } from './index';
import { maps, players } from '@/db/schema';
import { TotdMap } from '@/src/lib/nadeo';
import { eq } from 'drizzle-orm';

/**
 * Save or update a TOTD map in the database
 */
export async function saveTotdMap(mapData: TotdMap) {

  const year = mapData.year;
  const month = mapData.month;
  const day = mapData.day;

  // Check if player with authorAccountId exists
  const authorPlayer = await db
    .select()
    .from(players)
    .where(eq(players.accountId, mapData.authorAccountId))
    .limit(1);
  if (authorPlayer.length === 0) {
    mapData.authorAccountId = "000000"
  }

  // Check if map already exists
  const existingMap = await db
    .select()
    .from(maps)
    .where(eq(maps.mapUid, mapData.mapUid))
    .limit(1);

  if (existingMap.length > 0) {
    // Update existing map
    await db
      .update(maps)
      .set({
        name: mapData.name,
        medalAuthor: mapData.at,
        medalGold: mapData.goldTime,
        medalSilver: mapData.silverTime,
        medalBronze: mapData.bronzeTime,
        author: mapData.authorAccountId,
        year,
        month,
        day,
        isTotd: true,
        atCount: mapData.atCount,
      })
      .where(eq(maps.mapUid, mapData.mapUid));

    return existingMap[0].mapUid;
  } else {
    // Insert new map
    const result = await db
      .insert(maps)
      .values({ // @ts-ignore why is it red nobody knows
        name: mapData.name, 
        mapId: mapData.mapId,
        mapUid: mapData.mapUid,
        author: mapData.authorAccountId,
        medalAuthor: mapData.at,
        medalGold: mapData.goldTime,
        medalSilver: mapData.silverTime,
        medalBronze: mapData.bronzeTime,
        year,
        month,
        day,
        isTotd: true,
        atCount: mapData.atCount,
      })
      .returning({ id: maps.mapUid });

    return result.length > 0 ? result[0].id : null;
  }
}
