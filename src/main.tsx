import { Global } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { App } from './App';
import { GlobalStyle } from './GlobalStyle';
import { theme } from './theme';
import { HelmetProvider } from 'react-helmet-async';
import './styles/aos-fix.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Global styles={GlobalStyle} />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Dispatch event for prerender plugin after React hydration
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.dispatchEvent(new Event('render-complete'));
    }, 1000);
  });
}