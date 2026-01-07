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
      field: 'playerName',
      headerName: 'Player',
      flex: 1.5,
    },
    {
      field: 'atCount',
      headerName: 'AT Count',
      flex: 1.2,
      type: 'number',
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
        sx={{
          width: '100%',
          padding: 2,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Paper sx={{ padding: 3, width: '40%', '@media (max-width: 780px)': {width: '95%'}, margin: '0 auto' }}>
          <Typography variant="h4" component="h1" align="center" sx={{ marginBottom: 0}} gutterBottom>
            AT Leaderboard
          </Typography>
        </Paper>

        <Paper sx={{ height: 'auto', width: '30%', '@media (max-width: 780px)': {width: '95%'}, margin: '20px auto' }}>
            <DataGrid
                rows={leaderboard}
                columns={columns}
                getRowId={(row) => row.playerId}
                hideFooter={true}
                columnHeaderHeight={40}
                sx={{
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
