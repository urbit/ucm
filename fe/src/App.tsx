import { useEffect, useState } from 'react';
import './App.css';
import useStore from './logic/store';
import Router from './Router';
import { LoadingScreen } from './ui/Components';
import { createTheme, ThemeProvider, styled, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from './ui/shared-theme/AppTheme';

function App() {
  // data loading
  const { init, loading } = useStore(['init', 'loading']);
  useEffect(() => {
    init();
  }, []);
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      {loading ? <LoadingScreen /> : <Router />}
    </AppTheme>
  );
}

export default App;
