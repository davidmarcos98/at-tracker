import { db } from './index';
import { maps, players } from '@/db/schema';
import { TotdMap } from '@/src/lib/nadeo';
import { eq } from 'drizzle-orm';

/**
 * Save or update a TOTD map in the database
 */
export async function saveTotdMap(mapData: TotdMap) {
  let authorId = null;
  // Check if author exists
  if (mapData.authorAccountId) {
    const existingAuthor = await db
      .select()
      .from(players)
      .where(eq(players.accountId, mapData.authorAccountId))
      .limit(1);

    if (existingAuthor.length > 0) {
      authorId = existingAuthor[0].id;
    } else {
      // TODO what do we do with missing players?
      authorId = 6747883 // Unknown user
    }
  }

  const year = mapData.year;
  const month = mapData.month;
  const day = mapData.day;

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
        medalAuthor: mapData.goldTime,
        medalGold: mapData.goldTime,
        medalSilver: mapData.silverTime,
        medalBronze: mapData.bronzeTime,
        author: authorId,
        year,
        month,
        day,
        isTotd: true,
        atCount: mapData.atCount,
      })
      .where(eq(maps.mapUid, mapData.mapUid));

    return existingMap[0].id;
  } else {
    // Insert new map
    const result = await db
      .insert(maps)
      .values({ // @ts-ignore why is it red nobody knows
        name: mapData.name, 
        mapId: mapData.mapId,
        mapUid: mapData.mapUid,
        tmxId: '', // Will need to be populated from another source
        author: authorId,
        medalAuthor: mapData.goldTime,
        medalGold: mapData.goldTime,
        medalSilver: mapData.silverTime,
        medalBronze: mapData.bronzeTime,
        year,
        month,
        day,
        isTotd: true,
        atCount: mapData.atCount,
      })
      .returning({ id: maps.id });

    return result.length > 0 ? result[0].id : null;
  }
}
