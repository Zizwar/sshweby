import React, { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import TerminalComponent, { TerminalHandle } from './terminal/TerminalComponent';
import VirtualKeyboard from './terminal/VirtualKeyboard';
import Toolbar from './terminal/Toolbar';
import StatusBar from './terminal/StatusBar';
import '../contexts/i18n';

const TerminalPageContent = () => {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(settings.terminal.fontSize);
  const [sessionLogEnable, setSessionLogEnable] = useState(false);
  const [loggedData, setLoggedData] = useState(false);
  const [sessionLog, setSessionLog] = useState('');
  const [sessionFooter, setSessionFooter] = useState('');
  const [logDate, setLogDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [allowReauth, setAllowReauth] = useState(false);
  const [allowReplay, setAllowReplay] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(settings.ui.virtualKeyboard);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const terminalRef = useRef<TerminalHandle>(null);

  useEffect(() => {
    const newSocket = io({ path: '/ssh/socket.io' });
    setSocket(newSocket);
    setWebsocketConnected(true);

    newSocket.on('connect', () => {
      setWebsocketConnected(true);
      setConnectionStatus('connected');
      setIsConnected(true);
    });

    newSocket.on('status', (data) => {
      setStatus(data);
      if (data.includes('SSH')) {
        setIsConnected(true);
        setConnectionStatus('connected');
      }
    });

    newSocket.on('footer', (data) => setSessionFooter(data));

    newSocket.on('ssherror', (data) => {
      setStatus(data);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', (err) => {
      setStatus(`WEBSOCKET SERVER DISCONNECTED: ${err}`);
      setWebsocketConnected(false);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      newSocket.io.reconnection(false);
    });

    newSocket.on('error', (err) => {
      setStatus(`ERROR: ${err}`);
      setConnectionStatus('error');
    });

    newSocket.on('allowreauth', (data) => setAllowReauth(data));
    newSocket.on('allowreplay', (data) => setAllowReplay(data));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleKeyClick = useCallback((key: string, type = 'key') => {
    if (!socket || !isConnected) return;

    let finalKey = key;

    switch (type) {
      case 'key':
        finalKey = key;
        break;
      case 'control':
        // تحويل أوامر التحكم إلى أكواد ASCII
        const controlCode = key.charCodeAt(0) - 64;
        finalKey = String.fromCharCode(controlCode);
        break;
      case 'special':
        // مفاتيح خاصة
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

    socket.emit('data', finalKey);
  }, [socket, isConnected]);

  const handleTitleChange = (title: string) => {
    document.title = title;
  };

  // تحديث حجم الخط مع حفظ الإعدادات
  const handleFontSizeChange = useCallback((newSize: number) => {
    setFontSize(newSize);
    updateSetting('terminal', 'fontSize', newSize);
  }, [updateSetting]);

  // تبديل عرض الكيبورد
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
      setSessionLog(
        `${sessionLog}\r\n\r\nLog End for ${sessionFooter}: ${currentDate.toString()}\r\n`
      );
      setLogDate(currentDate);
    } else {
      setSessionLogEnable(true);
      setLoggedData(true);
      const currentDate = new Date();
      setSessionLog(
        `Log Start for ${sessionFooter}: ${currentDate.toString()}\r\n\r\n`
      );
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
      terminalRef.current?.sendCtrlC();
  }

  const clearScreen = () => {
      terminalRef.current?.clearScreen();
  }

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
    if (androidInput) {
      androidInput.style.position = 'fixed';
      androidInput.style.bottom = '80px';
      androidInput.style.left = '50%';
      androidInput.style.transform = 'translateX(-50%)';
      androidInput.style.opacity = '1';
      androidInput.style.pointerEvents = 'auto';
      androidInput.style.zIndex = '1500';
      androidInput.focus();
    }
  };

  const reauthSession = () => {
    socket!.emit('control', 'reauth');
    window.location.href = '/ssh/reauth';
  };

  const replayCredentials = () => {
    socket!.emit('control', 'replayCredentials');
  };

  const terminalHeight = showKeyboard ? 'calc(100vh - 320px)' : 'calc(100vh - 120px)';

  return (
    <div className="terminal-container">
      <input
        type="text"
        id="android-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text"
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

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
        className="terminal-viewport"
        style={{
          height: terminalHeight,
          minHeight: '200px'
        }}
      >
        <TerminalComponent
          ref={terminalRef}
          onTitleChange={handleTitleChange}
          sessionLogEnable={sessionLogEnable}
          setSessionLog={setSessionLog}
          sessionLog={sessionLog}
          fontSize={fontSize}
        />
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          handleKeyClick={handleKeyClick}
          isConnected={isConnected}
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
