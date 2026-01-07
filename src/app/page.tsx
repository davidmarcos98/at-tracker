'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  atCount: number;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const result = await response.json();
        if (result.success && result.leaderboard) {
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

  const columns: GridColDef[] = [
    {
      field: 'rank',
      headerName: 'Rank',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      valueGetter: (params: any, row: any, col: any) => {
        const index = leaderboard.indexOf(row);
        return index + 1;
      },
    },
    {
      field: 'displayName',
      headerName: 'Player',
      flex: 1.5,
      valueGetter: (params: any, row: any, col: any) => {
        return {value: row.displayName, accountId: row.accountId } 
      },
      renderCell: (params: any) => (
        <a
          href={`/player/${params.value.accountId}`}
          rel="noopener noreferrer"
          style={{ color: "white", textDecoration: 'none' }}
        >
          {params.value.value}
        </a>
      ),
    },
    {
      field: 'atCount',
      headerName: 'AT Count',
      flex: 1.2,
      type: 'number',
      renderCell: (params: any) => {
        return (
          <div className='inline-flex items-center gap-2'>
            <p className='font-bold'>
              {params.value}
            </p>
            <img style={{ height: "30px", width: "30px" }} src="/medal_author.png">
            </img>
          </div>
        )
      }
    },
  ];

  const theme = isDark ? darkTheme : lightTheme;
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
    <ThemeProvider theme={theme}>
      <Box
        display="flex-inline"
        justifyContent="center"
        alignItems="center"
        className="mb-[20px]"
        sx={{
          width: '100%',
          padding: 2,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Paper sx={{ padding: 3, width: '30%', '@media (max-width: 780px)': {width: '95%'}, margin: '0 auto' }}>
          <h4 className='font-black text-center text-4xl'>
            AT Leaderboard
          </h4>
        </Paper>

        <Paper sx={{ height: 'auto', width: '30%', '@media (max-width: 780px)': {width: '95%'}, margin: '20px auto' }}>
            <DataGrid
                rows={leaderboard}
                columns={columns}
                getRowId={(row) => row.accountId}
                hideFooter={true}
                columnHeaderHeight={40}
                sx={{
                    fontSize: '1rem',
                '& .MuiDataGrid-root': {
                    border: 'none',
                },
                }}
            />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
