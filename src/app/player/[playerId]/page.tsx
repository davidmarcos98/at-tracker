'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const { tmText } = require('tm-text');

interface PlayerMap {
  mapUid: string;
  mapId: string;
  name: string;
  author: string;
  medalAuthor: number;
  medalGold: number;
  medalSilver: number;
  medalBronze: number;
  year: number;
  month: number;
  day: number;
  isTotd: boolean;
  totdDate?: string;
  atCount: number;
  thumbnailUrl?: string;
  entryId?: number;
  time?: number;
  rank?: number;
  date?: string;
  isAt?: boolean;
}

interface PlayerData {
  displayName: string;
  accountId: string;
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

const getMedalColor = (medal: number | undefined) => {
  if (medal === undefined) return '#888888'; // Gray for no medal
  if (medal >= 4) return '#FFD700'; // Gold for AT
  if (medal === 3) return '#FFD700'; // Gold
  if (medal === 2) return '#C0C0C0'; // Silver
  if (medal === 1) return '#CD7F32'; // Bronze
  return '#888888'; // Gray
};

const getMedalName = (medal: number | undefined) => {
  if (medal === undefined) return 'None';
  if (medal >= 4) return 'Author Time';
  if (medal === 3) return 'Gold';
  if (medal === 2) return 'Silver';
  if (medal === 1) return 'Bronze';
  return 'None';
};

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [maps, setMaps] = useState<PlayerMap[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<PlayerMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [playerRank, setPlayerRank] = useState(0);
  const [totalMaps, setTotalMaps] = useState(0);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/player/${playerId}`);
        const result = await response.json();

        if (result.success) {
          setPlayer(result.player);
          setMaps(result.maps || []);
          setPlayerRank(result.playerRank);
          setTotalMaps(result.totalMaps);
        }
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  useEffect(() => {
    let filtered = maps;

    if (filter === 'complete') {
      filtered = maps.filter((map) => map.isAt);
    } else if (filter === 'incomplete') {
      filtered = maps.filter((map) => !map.isAt);
    }

    setFilteredMaps(filtered);
  }, [filter, maps]);

  const completedMaps = maps.filter((m) => m.isAt).length;
  const missingMaps = maps.length - completedMaps;

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Map Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params: any) => (
        <div dangerouslySetInnerHTML={{ __html: tmText(params.value).htmlify() }} />
      ),
    },
    {
      field: 'mapUid',
      headerName: 'Map URL',
      flex: 2,
      minWidth: 200,
      renderCell: (params: any) => (
        <a href={`https://trackmania.io/#/leaderboard/${params.value}`} target="_blank">map</a>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueGetter: (params: any, row: PlayerMap) => {
        return `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
      },
    },
    {
      field: 'medalAuthor',
      headerName: 'Author Time',
      flex: 1,
      minWidth: 100,
      valueGetter: (params: any, row: PlayerMap) => {
        return `${parseTime(row.medalAuthor)}`;
      },
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      minWidth: 100,
      valueGetter: (params: any, row: PlayerMap) => {
        if (row.time === null || row.time === undefined) return 'Not played';
        const differenceToAt = row.time - row.medalAuthor;

        return `${parseTime(row.time)} (${differenceToAt > 0 ? '+' : '-'}${parseTimeDifference(Math.abs(differenceToAt))})`;
      },
    },
  ];

  function parseTime(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  function parseTimeDifference(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const secs = seconds % 60;
    
    return `${String(secs).padStart(1, '0')}.${String(millis).padStart(3, '0')}`;
  }

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100%',
          padding: 2,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : player ? (
          <>
            <Paper sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {player.displayName || 'Unknown Player'}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 2,
                  marginTop: 2,
                }}
              >
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Author Time Count
                    </Typography>
                    <Typography variant="h5">{player.atCount}</Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Leaderboard Rank
                    </Typography>
                    <Typography variant="h5">#{playerRank}</Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Maps Progress
                    </Typography>
                    <Typography variant="h5">
                      {completedMaps}/{totalMaps}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {missingMaps} incomplete
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>

            <Paper sx={{ padding: 2, marginBottom: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Maps</Typography>
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={(event, newFilter) => {
                    if (newFilter !== null) {
                      setFilter(newFilter);
                    }
                  }}
                  size="small"
                >
                  <ToggleButton value="all">All ({maps.length})</ToggleButton>
                  <ToggleButton value="complete">Complete ({completedMaps})</ToggleButton>
                  <ToggleButton value="incomplete">Incomplete ({missingMaps})</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Paper>

            <Paper sx={{ height: '600px', width: '100%' }}>
              <DataGrid
                rows={filteredMaps}
                columns={columns}
                getRowId={(row) => row.mapUid}
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                }}
              />
            </Paper>
          </>
        ) : (
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              Player not found
            </Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
