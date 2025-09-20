import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

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
}

const TerminalComponent = forwardRef<TerminalHandle, TerminalComponentProps>(({ onTitleChange, sessionLogEnable, setSessionLog, sessionLog, fontSize }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const socket = useRef<Socket | null>(null);

  useImperativeHandle(ref, () => ({
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
  }));

  useEffect(() => {
    if (term.current) {
        term.current.options.fontSize = fontSize;
        fitAddon.current.fit();
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
    });

    (window as any).term = term.current;

    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    socket.current = io({ path: '/ssh/socket.io' });

    const resizeScreen = () => {
      fitAddon.current.fit();
      socket.current?.emit('resize', { cols: term.current!.cols, rows: term.current!.rows });
    };

    window.addEventListener('resize', resizeScreen, false);

    term.current.onData((data) => {
      socket.current?.emit('data', data);
      if (sessionLogEnable) {
        setSessionLog(sessionLog + data);
      }
    });

    socket.current.on('data', (data: string | Uint8Array) => {
      term.current?.write(data);
    });

    socket.current.on('connect', () => {
      socket.current?.emit('geometry', term.current!.cols, term.current!.rows);
    });

    socket.current.on('title', (data) => {
      onTitleChange(data);
    });

    // ... (rest of the socket event listeners)

    return () => {
      window.removeEventListener('resize', resizeScreen);
      socket.current?.disconnect();
      term.current?.dispose();
    };
  }, [sessionLogEnable, sessionLog, setSessionLog, onTitleChange, fontSize]);

  return <div id="terminal-container" className="terminal" ref={terminalRef}></div>;
});

export default TerminalComponent;