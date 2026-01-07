import { db } from '@/src/db/index';
import { entries, players } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Query to get count of AT entries per player, ordered by count descending
    const leaderboard = await db.select().from(players).orderBy(desc(players.atCount)).limit(25)
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
