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
      // Create new player entry for the author
      return "Author not found in database";
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
        at: mapData.goldTime,
        gold: mapData.goldTime,
        silver: mapData.silverTime,
        bronze: mapData.bronzeTime,
        author: authorId,
        year,
        month,
        day,
        isTotd: true,
      })
      .where(eq(maps.mapUid, mapData.mapUid));

    return existingMap[0].id;
  } else {
    // Insert new map
    const result = await db
      .insert(maps)
      .values({
        name: mapData.name,
        mapId: mapData.mapId,
        mapUid: mapData.mapUid,
        tmxId: '', // Will need to be populated from another source
        author: authorId,
        at: mapData.goldTime,
        gold: mapData.goldTime,
        silver: mapData.silverTime,
        bronze: mapData.bronzeTime,
        year,
        month,
        day,
        isTotd: true,
        atCount: 0,
      })
      .returning({ id: maps.id });

    return result.length > 0 ? result[0].id : null;
  }
}
