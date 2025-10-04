import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { ClipboardAddon } from '@xterm/addon-clipboard';

interface TerminalComponentProps {
  onTitleChange: (title: string) => void;
  sessionLogEnable: boolean;
  setSessionLog: (log: string) => void;
  sessionLog: string;
  fontSize: number;
}

export interface TerminalHandle {
  sendCtrlC: () => void;
  clearScreen: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  getCurrentFontSize: () => number;
  search: (term: string) => boolean;
  findNext: () => boolean;
  findPrevious: () => boolean;
  setTheme: (theme: any) => void;
  displayDisconnectedKeyPress: (key: string) => void;
}

const TerminalComponent = forwardRef<TerminalHandle, TerminalComponentProps>(({ onTitleChange, sessionLogEnable, setSessionLog, sessionLog, fontSize }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const searchAddon = useRef(new SearchAddon());
  const webLinksAddon = useRef(new WebLinksAddon());
  const webglAddon = useRef(new WebglAddon());
  const clipboardAddon = useRef(new ClipboardAddon());
  const socket = useRef<Socket | null>(null);

  useImperativeHandle(ref, () => ({
    // ... (existing methods)
    displayDisconnectedKeyPress: (key: string) => {
      if (term.current) {
        term.current.write(key);
        setTimeout(() => {
          term.current?.write('\b'.repeat(key.length));
        }, 100);
      }
    },
    sendCtrlC: () => {
      if (term.current) {
        term.current.write('\u0003');
      }
    },
    clearScreen: () => {
      if (term.current) {
        term.current.write('\u000C');
      }
    },
    increaseFontSize: () => {
      if (term.current) {
        const currentSize = term.current.options.fontSize || 14;
        const newSize = Math.min(currentSize + 2, 24);
        term.current.options.fontSize = newSize;
        setTimeout(() => {
          fitAddon.current.fit();
          if (socket.current) {
            socket.current.emit('resize', {
              cols: term.current!.cols,
              rows: term.current!.rows
            });
          }
        }, 50);
        return newSize;
      }
      return fontSize;
    },
    decreaseFontSize: () => {
      if (term.current) {
        const currentSize = term.current.options.fontSize || 14;
        const newSize = Math.max(currentSize - 2, 8);
        term.current.options.fontSize = newSize;
        setTimeout(() => {
          fitAddon.current.fit();
          if (socket.current) {
            socket.current.emit('resize', {
              cols: term.current!.cols,
              rows: term.current!.rows
            });
          }
        }, 50);
        return newSize;
      }
      return fontSize;
    },
    resetFontSize: () => {
      if (term.current) {
        term.current.options.fontSize = 14;
        setTimeout(() => {
          fitAddon.current.fit();
          if (socket.current) {
            socket.current.emit('resize', {
              cols: term.current!.cols,
              rows: term.current!.rows
            });
          }
        }, 50);
        return 14;
      }
      return 14;
    },
    getCurrentFontSize: () => {
      return term.current?.options.fontSize || fontSize;
    },
    search: (term: string) => {
      if (searchAddon.current) {
        return searchAddon.current.findNext(term);
      }
      return false;
    },
    findNext: () => {
      if (searchAddon.current) {
        return searchAddon.current.findNext('', { incremental: true });
      }
      return false;
    },
    findPrevious: () => {
      if (searchAddon.current) {
        return searchAddon.current.findPrevious('', { incremental: true });
      }
      return false;
    },
    setTheme: (theme: any) => {
      if (term.current) {
        term.current.options.theme = theme;
      }
    },
  }));

  useEffect(() => {
    if (term.current && fitAddon.current) {
        term.current.options.fontSize = fontSize;
        // إعطاء وقت للتيرمنال للتكيف مع حجم الخط الجديد
        setTimeout(() => {
          fitAddon.current.fit();
          // إرسال أبعاد جديدة للخادم
          if (socket.current) {
            socket.current.emit('resize', {
              cols: term.current!.cols,
              rows: term.current!.rows
            });
          }
        }, 50);
    }
  }, [fontSize]);

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    term.current = new Terminal({
      cursorBlink: true,
      macOptionIsMeta: true,
      fontSize: fontSize,
      fontFamily: '"Cascadia Code", "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
      fontWeight: 'normal',
      fontWeightBold: 'bold',
      lineHeight: 1.2,
      letterSpacing: 0,
      allowTransparency: true,
      theme: {
        foreground: '#F8F8F2',
        background: '#282A36',
        cursor: '#F8F8F0',
        cursorAccent: '#282A36',
        selectionBackground: '#44475A',
        black: '#21222C',
        red: '#FF5555',
        green: '#50FA7B',
        yellow: '#F1FA8C',
        blue: '#BD93F9',
        magenta: '#FF79C6',
        cyan: '#8BE9FD',
        white: '#F8F8F2',
        brightBlack: '#6272A4',
        brightRed: '#FF6E6E',
        brightGreen: '#69FF94',
        brightYellow: '#FFFFA5',
        brightBlue: '#D6ACFF',
        brightMagenta: '#FF92DF',
        brightCyan: '#A4FFFF',
        brightWhite: '#FFFFFF'
      },
      scrollback: 10000,
      tabStopWidth: 8,
      rightClickSelectsWord: true,
      convertEol: false,
      disableStdin: false,
      screenReaderMode: false,
      cols: 80,
      rows: 24
    });

    (window as any).term = term.current;

    // تحميل الإضافات
    term.current.loadAddon(fitAddon.current);
    term.current.loadAddon(searchAddon.current);
    term.current.loadAddon(webLinksAddon.current);
    term.current.loadAddon(clipboardAddon.current);

    // محاولة تحميل WebGL addon مع fallback
    try {
      term.current.loadAddon(webglAddon.current);
    } catch (error) {
      console.warn('WebGL addon not supported, falling back to canvas rendering');
    }

    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    socket.current = io({ path: '/ssh/socket.io' });

    const resizeScreen = () => {
      if (term.current && fitAddon.current) {
        fitAddon.current.fit();
        if (socket.current && socket.current.connected) {
          socket.current.emit('resize', {
            cols: term.current!.cols,
            rows: term.current!.rows
          });
        }
      }
    };

    const observer = new ResizeObserver(resizeScreen);
    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    window.addEventListener('orientationchange', resizeScreen, false);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', resizeScreen);
      socket.current?.disconnect();
      term.current?.dispose();
    };
  }, [sessionLogEnable, sessionLog, setSessionLog, onTitleChange, fontSize]);

  return <div id="terminal-container" className="terminal" ref={terminalRef}></div>;
});

export default TerminalComponent;