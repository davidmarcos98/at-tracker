'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Table, TableHeader, TableColumn, TableRow, TableCell, TableBody, Link } from '@heroui/react';

interface LeaderboardEntry {
  accountId: string;
  displayName: string;
  atCount: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const result = await response.json();
        if (result.success && result.leaderboard) {
          console.log(result.leaderboard)
          setLeaderboard(result.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
      >
          <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="w-[98%] md:w-[60%] p-4 min-h-screen" style={{ margin: 'auto', paddingBottom: '50px' }}>
      <Table>
        <TableHeader>
          <TableColumn key={"rank"} align='center'>
            Rank
          </TableColumn>
          <TableColumn key={"player"} align='center'>
            Player
          </TableColumn>
          <TableColumn key={"atcount"} align='center'>
            AT Count
          </TableColumn>
        </TableHeader>
        <TableBody items={leaderboard} emptyContent="No data found">
          {(player) => (
            <TableRow key={player.accountId}>
              <TableCell className='text-md'>
                {leaderboard.indexOf(player) + 1}
              </TableCell>
              <TableCell className='text-md'>
                <Link isBlock color='foreground' showAnchorIcon href={`/player/${player.accountId}`}>
                  {player.displayName}
                </Link>
              </TableCell>
              <TableCell className='text-md'>
                <div className='inline-flex items-center gap-2'>
                  <p className='font-bold'>
                    {player.atCount}
                  </p>
                  <img style={{ height: "30px", width: "30px" }} src="/medal_author.png">
                  </img>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
