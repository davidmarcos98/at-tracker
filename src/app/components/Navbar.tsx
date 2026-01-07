'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#000000',
    },
    primary: {
      main: '#1976d2',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', gap: 2, fontWeight: 'bold' }}>
            <Link href="/" style={{ textDecoration: 'none', fontWeight: 'bold'}}>
              <Button color="inherit" className='font-bold'><p className='font-bold'>Leaderboard</p></Button>
            </Link>
            <Link href="/maps" style={{ textDecoration: 'none', fontWeight: 'bold'}}>
              <Button color="inherit" className='font-bold'><p className='font-bold'>All maps</p></Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
