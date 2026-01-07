import { db } from '@/src/db/index';
import { entries, players } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Query to get count of AT entries per player, ordered by count descending
    const leaderboard = await db
      .select({
        playerId: entries.playerId,
        playerName: players.displayName,
        atCount: count(entries.id),
      })
      .from(entries)
      .innerJoin(players, eq(entries.playerId, players.accountId))
      .where(eq(entries.isAt, true))
      .groupBy(entries.playerId, players.displayName)
      .orderBy(desc(count(entries.id)))
      .limit(10);

    return Response.json({
      leaderboard,
      success: true,
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return Response.json(
      { error: 'Failed to fetch leaderboard', success: false },
      { status: 500 }
    );
  }
}
