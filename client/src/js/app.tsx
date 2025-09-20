
import React from 'react';
import { createRoot } from 'react-dom/client';
import TerminalPage from './components/TerminalPage';

// Import CSS
import '../css/style.css';
import '../css/virtual-keyboard.css';
import '../css/terminal-ui.css';
import '@xterm/xterm/css/xterm.css';

// Import i18n
import './contexts/i18n';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <TerminalPage />
  </React.StrictMode>
);
