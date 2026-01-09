'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MapsTable from '@/src/app/components/MapsTable';

const { tmText } = require('tm-text');

interface PlayerMap {
  id: number;
  name: string;
  mapUid: string;
  atCount: number;
  year?: number;
  month?: number;
  day?: number;
  authorPlayer?: {
    displayName: string;
  };
}

export default function Home() {
  const [maps, setMaps] = useState<PlayerMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch('/api/nadeo/totdAtCountRaw');
        const result = await response.json();
        if (result.tracks) {
          result.tracks.forEach((map: any) => {
            map.name = tmText(map.name).htmlify();
            map.id = map.mapUid;
          });
          setMaps(result.tracks.sort((a: PlayerMap, b: PlayerMap) => a.atCount - b.atCount));
        }
      } catch (error) {
        console.error('Failed to fetch maps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

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
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueGetter: (params: any, row: PlayerMap) => {
        if (row.year && row.month && row.day) {
          return `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
        }
        return 'N/A';
      },
    },
    {
      field: 'author',
      headerName: 'Author',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params: any, row: PlayerMap) => row.authorPlayer?.displayName || 'Unknown',
    },
    {
      field: 'atCount',
      headerName: 'AT Count',
      flex: 1,
      minWidth: 120,
      type: 'number',
    },
    {
      field: 'mapUid',
      headerName: 'Link',
      flex: 0.8,
      minWidth: 80,
      sortable: false,
      renderCell: (params: any) => (
        <a
          href={`https://trackmania.io/#/leaderboard/${params.value}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: isDark ? '#60a5fa' : '#2563eb', textDecoration: 'underline' }}
        >
          View
        </a>
      ),
    },
  ];

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
    <div className="w-[98%] md:w-[75%] p-4 min-h-screen" style={{ margin: 'auto', paddingBottom: "50px" }}>
      <MapsTable maps={maps as any} playerMaps={false}/>
    </div>
  );
}