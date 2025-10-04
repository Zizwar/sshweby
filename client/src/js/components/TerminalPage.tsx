import React, { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useTranslation } from 'react-i18next';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import VirtualKeyboard from './terminal/VirtualKeyboard';
import Toolbar from './terminal/Toolbar';
import StatusBar from './terminal/StatusBar';
import '../contexts/i18n';

const TerminalPageContent = () => {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const socket = useRef<Socket | null>(null);

  const [fontSize, setFontSize] = useState(settings.terminal.fontSize);
  const [sessionLogEnable, setSessionLogEnable] = useState(false);
  const [loggedData, setLoggedData] = useState(false);
  const [sessionLog, setSessionLog] = useState('');
  const [sessionFooter, setSessionFooter] = useState('');
  const [logDate, setLogDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [allowReauth, setAllowReauth] = useState(false);
  const [allowReplay, setAllowReplay] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(settings.ui.virtualKeyboard);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [websocketConnected, setWebsocketConnected] = useState(false);

  // إنشاء التيرمينال مرة واحدة فقط
  useEffect(() => {
    if (!terminalRef.current) return;

    term.current = new Terminal({
      cursorBlink: true,
      fontSize: fontSize,
      fontFamily: 'monospace',
      theme: {
        background: '#282A36',
        foreground: '#F8F8F2',
        cursor: '#F8F8F0'
      },
      cols: 80,
      rows: 24
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    socket.current = io({ path: '/ssh/socket.io' });

    socket.current.on('connect', () => {
      console.log('✅ متصل بالسيرفر');
      setWebsocketConnected(true);
      setConnectionStatus('connected');
      setIsConnected(true);
    });

    socket.current.on('data', (data) => {
      term.current?.write(data);
    });

    socket.current.on('status', (data) => {
      setStatus(data);
      if (data.includes('SSH')) {
        setIsConnected(true);
        setConnectionStatus('connected');
      }
    });

    socket.current.on('footer', (data) => setSessionFooter(data));

    socket.current.on('ssherror', (data) => {
      setStatus(data);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    socket.current.on('disconnect', (err) => {
      console.log('❌ انقطع الاتصال');
      setStatus(`WEBSOCKET SERVER DISCONNECTED: ${err}`);
      setWebsocketConnected(false);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.current.on('error', (err) => {
      setStatus(`ERROR: ${err}`);
      setConnectionStatus('error');
    });

    socket.current.on('allowreauth', (data) => setAllowReauth(data));
    socket.current.on('allowreplay', (data) => setAllowReplay(data));

    term.current.onData((data) => {
      socket.current?.emit('data', data);
    });

    const handleResize = () => {
      if (term.current && fitAddon.current && socket.current) {
        fitAddon.current.fit();
        socket.current.emit('resize', {
          cols: term.current.cols,
          rows: term.current.rows
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.current?.disconnect();
      term.current?.dispose();
    };
  }, []);

  // تحديث حجم الخط فقط
  useEffect(() => {
    if (term.current && fitAddon.current) {
      term.current.options.fontSize = fontSize;
      setTimeout(() => {
        fitAddon.current.fit();
        if (socket.current) {
          socket.current.emit('resize', {
            cols: term.current!.cols,
            rows: term.current!.rows
          });
        }
      }, 50);
    }
  }, [fontSize]);

  const handleKeyClick = useCallback((key: string, type = 'key') => {
    if (!socket.current || !isConnected) return;

    let finalKey = key;

    switch (type) {
      case 'key':
        finalKey = key;
        break;
      case 'control':
        const controlCode = key.charCodeAt(0) - 64;
        finalKey = String.fromCharCode(controlCode);
        break;
      case 'special':
        switch (key) {
          case 'ArrowUp': finalKey = '\x1b[A'; break;
          case 'ArrowDown': finalKey = '\x1b[B'; break;
          case 'ArrowRight': finalKey = '\x1b[C'; break;
          case 'ArrowLeft': finalKey = '\x1b[D'; break;
          case 'Home': finalKey = '\x1bOH'; break;
          case 'End': finalKey = '\x1bOF'; break;
          case 'PageUp': finalKey = '\x1b[5~'; break;
          case 'PageDown': finalKey = '\x1b[6~'; break;
          case 'Delete': finalKey = '\x1b[3~'; break;
          case 'Tab': finalKey = '\t'; break;
          case 'Enter': finalKey = '\r'; break;
          case 'Escape': finalKey = '\x1b'; break;
          case 'Backspace': finalKey = '\x7f'; break;
          default: finalKey = key;
        }
        break;
    }

    socket.current.emit('data', finalKey);
  }, [isConnected]);

  const handleFontSizeChange = useCallback((newSize: number) => {
    setFontSize(newSize);
    updateSetting('terminal', 'fontSize', newSize);
  }, [updateSetting]);

  const toggleKeyboard = useCallback(() => {
    const newState = !showKeyboard;
    setShowKeyboard(newState);
    updateSetting('ui', 'virtualKeyboard', newState);
  }, [showKeyboard, updateSetting]);

  const toggleLog = () => {
    if (sessionLogEnable) {
      setSessionLogEnable(false);
      setLoggedData(true);
      const currentDate = new Date();
      setSessionLog(`${sessionLog}\r\n\r\nLog End for ${sessionFooter}: ${currentDate.toString()}\r\n`);
      setLogDate(currentDate);
    } else {
      setSessionLogEnable(true);
      setLoggedData(true);
      const currentDate = new Date();
      setSessionLog(`Log Start for ${sessionFooter}: ${currentDate.toString()}\r\n\r\n`);
      setLogDate(currentDate);
    }
  };

  const downloadLog = () => {
    if (loggedData && logDate) {
      const myFile = `WebSSH2-${logDate.toISOString()}.log`;
      const blob = new Blob([sessionLog], { type: 'text/plain' });
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = myFile;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  };

  const sendCtrlC = () => {
    if (term.current) {
      term.current.write('\u0003');
    }
  };

  const clearScreen = () => {
    if (term.current) {
      term.current.write('\u000C');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const showConnectionInfo = () => {
    alert('Connection Info:\n' + status);
  };

  const useAndroidKeyboard = () => {
    const androidInput = document.getElementById('android-input') as HTMLInputElement;
    const androidContainer = document.getElementById('android-keyboard-container');

    if (androidInput && androidContainer) {
      androidContainer.style.display = 'flex';
      androidInput.focus();
    }
  };

  const hideAndroidKeyboard = () => {
    const androidContainer = document.getElementById('android-keyboard-container');
    if (androidContainer) {
      androidContainer.style.display = 'none';
    }
  };

  const sendAndroidInput = () => {
    const androidInput = document.getElementById('android-input') as HTMLInputElement;
    if (androidInput && androidInput.value && socket.current) {
      socket.current.emit('data', androidInput.value);
      androidInput.value = '';
      hideAndroidKeyboard();
    }
  };

  const handleAndroidKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendAndroidInput();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hideAndroidKeyboard();
    }
  };

  const reauthSession = () => {
    socket.current?.emit('control', 'reauth');
    window.location.href = '/ssh/reauth';
  };

  const replayCredentials = () => {
    socket.current?.emit('control', 'replayCredentials');
  };

  const terminalHeight = showKeyboard ? 'calc(100vh - 350px)' : 'calc(100vh - 80px)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#1e1e1e',
      overflow: 'hidden'
    }}>
      {/* Android Keyboard Input Container */}
      <div
        id="android-keyboard-container"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '500px',
          backgroundColor: '#2d2d2d',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 1500,
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            id="android-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
            onKeyDown={handleAndroidKeyDown}
            placeholder={t('type_command')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '16px',
              backgroundColor: '#1e1e1e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              outline: 'none'
            }}
          />
          <button
            onClick={sendAndroidInput}
            style={{
              padding: '10px 16px',
              fontSize: '16px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ↵
          </button>
          <button
            onClick={hideAndroidKeyboard}
            style={{
              padding: '10px 12px',
              fontSize: '16px',
              backgroundColor: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center'
        }}>
          {t('press_enter_send')} • {t('press_esc_close')}
        </div>
      </div>

      <Toolbar
        fontSize={fontSize}
        setFontSize={handleFontSizeChange}
        toggleLog={toggleLog}
        downloadLog={downloadLog}
        sessionLogEnable={sessionLogEnable}
        loggedData={loggedData}
        sendCtrlC={sendCtrlC}
        clearScreen={clearScreen}
        toggleFullscreen={toggleFullscreen}
        showConnectionInfo={showConnectionInfo}
        useAndroidKeyboard={useAndroidKeyboard}
        showKeyboard={showKeyboard}
        toggleKeyboard={toggleKeyboard}
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        websocketConnected={websocketConnected}
      />

      <div
        ref={terminalRef}
        style={{
          flex: 1,
          minHeight: 0,
          padding: '10px',
          backgroundColor: '#282A36'
        }}
      />

      {showKeyboard && (
        <VirtualKeyboard
          handleKeyClick={handleKeyClick}
          isConnected={isConnected}
          terminalHandle={{ current: null }}
        />
      )}

      <StatusBar
        status={status}
        footer={sessionFooter}
        allowReauth={allowReauth}
        allowReplay={allowReplay}
        reauthSession={reauthSession}
        replayCredentials={replayCredentials}
        connectionStatus={connectionStatus}
        isConnected={isConnected}
        websocketConnected={websocketConnected}
      />
    </div>
  );
};

const TerminalPage = () => {
  return (
    <SettingsProvider>
      <TerminalPageContent />
    </SettingsProvider>
  );
};

export default TerminalPage;
