import { db } from '@/src/db/index';
import { maps } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const filterMonth = searchParams.get("month");
  const filterYear = searchParams.get("year");

  let whereClause = undefined;
  if (filterYear) {
    if (filterMonth) {
      whereClause = and(eq(maps.year, filterYear as unknown as number), eq(maps.month, filterMonth as unknown as number))
    } else {
      whereClause = eq(maps.year, filterYear as unknown as number)
    }
  }
  const data = await db.query.maps.findMany({
    where: whereClause,
    columns: {
      author: false,
      thumbnailUrl: false,
      downloadUrl: false,
      isTotd: false,
      laps: false,
      tmxId: false,
    },
    with: {
      authorPlayer: {
        columns: {
          displayName: true,
        }
      }
    }
  });

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
    
}
