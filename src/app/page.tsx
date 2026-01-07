'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const { tmText } = require('tm-text');

interface Map {
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

export default function Home() {
  const [maps, setMaps] = useState<Map[]>([]);
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
          setMaps(result.tracks.sort((a: Map, b: Map) => a.atCount - b.atCount));
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
      valueGetter: (params: any, row: Map) => {
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
      valueGetter: (params: any, row: Map) => row.authorPlayer?.displayName || 'Unknown',
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

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: isDark ? '#000000' : '#f3f4f6',
          p: 4,
        }}
      >
        <Box sx={{ maxWidth: '75%', mx: 'auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem', color: isDark ? '#fff' : '#000' }}>
            Trackmania Maps
          </h1>
          <p style={{ marginBottom: '1.5rem', color: isDark ? '#9ca3af' : '#6b7280' }}>
            Total: {maps.length} maps
          </p>

          <Box
            sx={{
              height: "auto",
              bgcolor: isDark ? '#1a1a1a' : '#fff',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <DataGrid
              rows={maps.sort((a: Map, b: Map) => a.atCount - b.atCount)}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              sx={{
                fontSize: '0.9rem',
                '& .MuiDataGrid-root': {
                  border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                },
                '& .MuiDataGrid-virtualScroller': {
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                },
                '& .MuiDataGrid-scrollbarContent': {
                  display: 'none',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}