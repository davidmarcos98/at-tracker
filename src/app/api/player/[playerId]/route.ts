import { db } from '@/src/db/index';
import { entries, maps, players } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const { playerId } = await Promise.resolve(params);

    // Get player info
    const player = await db
      .select()
      .from(players)
      .where(eq(players.accountId, playerId))
      .limit(1);

    if (player.length === 0) {
      return Response.json(
        { error: 'Player not found', success: false },
        { status: 404 }
      );
    }

    // Get all maps with player's entry info
    const playerMapsData = await db
      .select({
        mapUid: maps.mapUid,
        mapId: maps.mapId,
        name: maps.name,
        author: maps.author,
        medalAuthor: maps.medalAuthor,
        medalGold: maps.medalGold,
        medalSilver: maps.medalSilver,
        medalBronze: maps.medalBronze,
        year: maps.year,
        month: maps.month,
        day: maps.day,
        isTotd: maps.isTotd,
        totdDate: maps.totdDate,
        atCount: maps.atCount,
        thumbnailUrl: maps.thumbnailUrl,
        time: entries.time,
        rank: entries.rank,
        date: entries.date,
        isAt: entries.isAt,
      })
      .from(maps)
      .leftJoin(entries, and(eq(entries.mapId, maps.mapUid), eq(entries.playerId, playerId)))
      .orderBy(maps.year, maps.month, maps.day);

    // Count total maps
    const totalMaps = await db.select({ count: sql<number>`count(*)` }).from(maps);

    // Get player's leaderboard rank
    const rankResult = await db
      .select()
      .from(players)
      .orderBy(desc(players.atCount))
      .limit(25);
    const rankResultPlayers = rankResult.map((player, i) => {return {accountId: player.accountId, rank: i+1}}).filter(player => player.accountId == playerId);
 
    const playerRank = rankResultPlayers[0].rank;

    return Response.json({
      success: true,
      player: player[0],
      playerRank,
      totalMaps: totalMaps[0]?.count || 0,
      maps: playerMapsData,
    });
  } catch (error) {
    console.error('Failed to fetch player data:', error);
    return Response.json(
      { error: 'Failed to fetch player data', success: false },
      { status: 500 }
    );
  }
}
