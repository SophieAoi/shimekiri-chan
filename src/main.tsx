import '@fontsource-variable/playfair-display';
import '@fontsource-variable/inter';
// Latin only: the script face is used for the "Shimekiri" wordmark and nothing else.
import '@fontsource/great-vibes/latin-400.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
