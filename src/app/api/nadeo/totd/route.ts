import { nadeoClient } from '@/src/lib/nadeo';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let maps: any[] = [];

    if (startDate && endDate) {
      // Fetch TOTD maps for a date range
      //maps = await nadeoClient.getTotdMaps(new Date(startDate), new Date(endDate));
    } else {
      // Fetch current TOTD map
      const map = await nadeoClient.getTotdMapsCurrentMonth();
      maps = [map];
    }

    return NextResponse.json({
      success: true,
      ...maps[0],
      count: maps[0].data.length,
    });
  } catch (error) {
    console.error('Error fetching TOTD maps:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch TOTD maps',
      },
      { status: 500 }
    );
  }
}
