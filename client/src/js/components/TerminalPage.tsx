import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faBars, faClipboard, faDownload, faKey, faCog } from '@fortawesome/free-solid-svg-icons';

library.add(faBars, faClipboard, faDownload, faKey, faCog);
dom.watch();

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const socket = useRef<Socket | null>(null);

  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [sessionLogEnable, setSessionLogEnable] = useState(false);
  const [loggedData, setLoggedData] = useState(false);
  const [sessionLog, setSessionLog] = useState('');
  const [sessionFooter, setSessionFooter] = useState('');
  const [logDate, setLogDate] = useState<Date | null>(null);
  const [allowReplay, setAllowReplay] = useState(false);
  const [allowReauth, setAllowReauth] = useState(false);

  useEffect(() => {
    term.current = new Terminal({ fontSize });
    (window as any).term = term.current;

    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current!);
    fitAddon.current.fit();

    socket.current = io({ path: '/ssh/socket.io' });

    const resizeScreen = () => {
      fitAddon.current.fit();
      socket.current!.emit('resize', { cols: term.current!.cols, rows: term.current!.rows });
    };

    window.addEventListener('resize', resizeScreen, false);

    term.current.onData((data) => {
      socket.current!.emit('data', data);
      if (sessionLogEnable) {
        setSessionLog(sessionLog + data);
      }
    });

    socket.current.on('data', (data: string | Uint8Array) => {
      term.current!.write(data);
    });

    socket.current.on('connect', () => {
      socket.current!.emit('geometry', term.current!.cols, term.current!.rows);
    });

    socket.current.on('setTerminalOpts', (data) => {
      term.current!.options = data;
    });

    socket.current.on('title', (data) => {
      document.title = data;
    });

    socket.current.on('status', (data) => {
      const status = document.getElementById('status');
      if (status) status.innerHTML = data;
    });

    socket.current.on('ssherror', (data) => {
      const status = document.getElementById('status');
      if (status) {
        status.innerHTML = data;
        status.style.backgroundColor = 'red';
      }
    });

    socket.current.on('headerBackground', (data) => {
      const header = document.getElementById('header');
      if (header) header.style.backgroundColor = data;
    });

    socket.current.on('header', (data) => {
      const header = document.getElementById('header');
      if (header && data) {
        header.innerHTML = data;
        header.style.display = 'block';
        const terminalContainer = document.getElementById('terminal-container');
        if (terminalContainer) terminalContainer.style.height = 'calc(100% - 38px)';
        resizeScreen();
      }
    });

    socket.current.on('footer', (data) => {
      setSessionFooter(data);
      const footer = document.getElementById('footer');
      if (footer) footer.innerHTML = data;
    });

    socket.current.on('statusBackground', (data) => {
      const status = document.getElementById('status');
      if (status) status.style.backgroundColor = data;
    });

    socket.current.on('allowreplay', (data) => {
      setAllowReplay(data);
    });

    socket.current.on('allowreauth', (data) => {
      setAllowReauth(data);
    });

    socket.current.on('disconnect', (err) => {
      const status = document.getElementById('status');
      if (status) {
        status.style.backgroundColor = 'red';
        status.innerHTML = `WEBSOCKET SERVER DISCONNECTED: ${err}`;
      }
      socket.current!.io.reconnection(false);
    });

    socket.current.on('error', (err) => {
      const status = document.getElementById('status');
      if (status) {
        status.style.backgroundColor = 'red';
        status.innerHTML = `ERROR: ${err}`;
      }
    });

    return () => {
      window.removeEventListener('resize', resizeScreen);
      socket.current!.disconnect();
      term.current!.dispose();
    };
  }, []);

  useEffect(() => {
    if (term.current) {
      term.current.options.fontSize = fontSize;
      fitAddon.current.fit();
    }
  }, [fontSize]);

  const handleKeyClick = (key: any) => {
    if (!term.current || !socket.current) return;

    if (key.key) {
      switch (key.key) {
        case 'Escape':
          socket.current.emit('data', '\x1b');
          break;
        case 'Tab':
          socket.current.emit('data', '\t');
          break;
        case 'ArrowUp':
          socket.current.emit('data', '\x1b[A');
          break;
        case 'ArrowDown':
          socket.current.emit('data', '\x1b[B');
          break;
        case 'ArrowLeft':
          socket.current.emit('data', '\x1b[D');
          break;
        case 'ArrowRight':
          socket.current.emit('data', '\x1b[C');
          break;
        case 'Enter':
          socket.current.emit('data', '\r');
          break;
        case 'Backspace':
          socket.current.emit('data', '\b');
          break;
        case 'Control':
          setCtrlActive(!ctrlActive);
          setAltActive(false);
          break;
        case 'Alt':
          setAltActive(!altActive);
          setCtrlActive(false);
          break;
      }
    } else if (key.char) {
      let charToSend = key.char;
      if (ctrlActive) {
        switch (charToSend.toLowerCase()) {
          case 'c':
            socket.current.emit('data', '\x03');
            break;
          case 'a':
            socket.current.emit('data', '\x01');
            break;
          case 'x':
            socket.current.emit('data', '\x18');
            break;
          case 'v':
            socket.current.emit('data', '\x16');
            break;
          case 'z':
            socket.current.emit('data', '\x1a');
            break;
          case 'd':
            socket.current.emit('data', '\x04');
            break;
          default:
            socket.current.emit('data', charToSend);
        }
        setCtrlActive(false);
      } else if (altActive) {
        socket.current.emit('data', '\x1b' + charToSend);
        setAltActive(false);
      } else {
        socket.current.emit('data', charToSend);
      }
    }
    term.current.focus();
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
    const status = document.getElementById('status');
    if (status) {
      alert('Connection Info:\n' + status.textContent);
    }
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

  const toggleLog = () => {
    if (sessionLogEnable) {
      setSessionLogEnable(false);
      setLoggedData(true);
      const currentDate = new Date();
      setSessionLog(
        `${sessionLog}\r\n\r\nLog End for ${sessionFooter}: ${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()} @ ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}\r\n`
      );
      setLogDate(currentDate);
    } else {
      setSessionLogEnable(true);
      setLoggedData(true);
      const currentDate = new Date();
      setSessionLog(
        `Log Start for ${sessionFooter}: ${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()} @ ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}\r\n\r\n`
      );
      setLogDate(currentDate);
    }
    term.current!.focus();
  };

  const downloadLog = () => {
    if (loggedData) {
      const myFile = `WebSSH2-${logDate!.getFullYear()}${logDate!.getMonth() + 1}${logDate!.getDate()}_${logDate!.getHours()}${logDate!.getMinutes()}${logDate!.getSeconds()}.log`;
      const blob = new Blob([
        sessionLog.replace(
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[\]()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><;]/g,
          ''
        ),
      ], {
        type: 'text/plain',
      });
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = myFile;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
    term.current!.focus();
  };

  const reauthSession = () => {
    socket.current!.emit('control', 'reauth');
    window.location.href = '/ssh/reauth';
  };

  const replayCredentials = () => {
    socket.current!.emit('control', 'replayCredentials');
    term.current!.focus();
  };

  const keyRows = [
    [
      { key: 'Escape', title: 'مفتاح الهروب', content: 'ESC', className: 'special' },
      { key: 'Tab', title: 'جدولة', content: 'TAB', className: 'special' },
      { key: 'Control', title: 'تحكم', content: 'CTRL', className: `special modifier ${ctrlActive ? 'active' : ''}` },
      { key: 'Alt', title: 'بديل', content: 'ALT', className: `special modifier ${altActive ? 'active' : ''}` },
      { key: 'Backspace', title: 'مسح', content: '⌫', className: 'special' },
    ],
    [
      { char: '1' }, { char: '2' }, { char: '3' }, { char: '4' }, { char: '5' },
      { char: '6' }, { char: '7' }, { char: '8' }, { char: '9' }, { char: '0' },
    ],
    [
      { char: '`' }, { char: '@' }, { char: '#' }, { char: '$' }, { char: '%' },
      { char: '&' }, { char: '*' }, { char: '!' },
    ],
    [
      { char: '|' }, { char: '~' }, { char: '/' }, { char: '-' }, { char: '_' },
      { char: '=' }, { char: '+' }, { char: '^' },
    ],
    [
      { char: '(' }, { char: ')' }, { char: '[' }, { char: ']' }, { char: '{' },
      { char: '}' }, { char: '"' }, { char: "'" },
    ],
    [
      { char: '.' }, { char: ',' }, { char: ':' }, { char: ';' }, { char: '?' },
      { char: '<' }, { char: '>' }, { char: '\\' },
    ],
    [
      { key: 'ArrowUp', content: '↑', className: 'arrow' },
      { key: 'ArrowDown', content: '↓', className: 'arrow' },
      { key: 'ArrowLeft', content: '←', className: 'arrow' },
      { key: 'ArrowRight', content: '→', className: 'arrow' },
      { key: 'Enter', content: '⏎', className: 'special' },
      { char: ' ', content: 'مسافة', className: 'wide' },
    ],
  ];

  return (
    <div className="terminal-font-md">
      <div className="box">
        <div id="header"></div>
        <div id="terminal-container" className="terminal" ref={terminalRef}></div>

        <button id="keyboard-toggle" title="إظهار/إخفاء لوحة المفاتيح">⌨️</button>

        <div id="font-controls">
          <button className="font-control-btn" title="تصغير النص" onClick={() => setFontSize(fontSize - 1)}>A-</button>
          <button className="font-control-btn" title="تكبير النص" onClick={() => setFontSize(fontSize + 1)}>A+</button>
          <button className="font-control-btn" title="إعادة تعيين النص" onClick={() => setFontSize(14)}>A</button>
        </div>

        <input type="text" id="android-input" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" inputMode="text" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', zIndex: -1 }} />

        <div id="quick-actions">
          <button className="quick-action-btn" title="لوحة مفاتيح الأندرويد" onClick={useAndroidKeyboard}>📱</button>
          <button className="quick-action-btn" title="إلغاء العملية" onClick={sendCtrlC}>✕</button>
          <button className="quick-action-btn" title="مسح الشاشة" onClick={clearScreen}>🧹</button>
          <button className="quick-action-btn" title="ملء الشاشة" onClick={toggleFullscreen}>⛶</button>
          <button className="quick-action-btn" title="معلومات الاتصال" onClick={showConnectionInfo}>ℹ️</button>
        </div>

        <div id="mobile-keys">
          <div className="keyboard-label">⌨️ لوحة المفاتيح المخصصة</div>
          {keyRows.map((row, rowIndex) => (
            <div key={rowIndex} className="key-row">
              {row.map((key, keyIndex) => (
                <button
                  key={keyIndex}
                  className={`key-btn ${key.className || ''}`}
                  data-key={key.key}
                  data-char={key.char}
                  title={key.title}
                  onClick={() => handleKeyClick(key)}
                >
                  {key.content || key.char || key.key}
                </button>
              ))}
            </div>
          ))}
          <div className="key-row">
            <button className="key-btn special" style={{ background: 'linear-gradient(135deg, #ff4444, #cc3333)', flex: 1 }}>✕ إغلاق لوحة المفاتيح</button>
          </div>
        </div>

        <div id="bottomdiv">
          <div className="dropup" id="menu">
            <i className="fas fa-bars fa-fw"></i> القائمة
            <div id="dropupContent" className="dropup-content">
              <a id="logBtn" onClick={toggleLog}>
                <i className="fas fa-clipboard fa-fw"></i> {sessionLogEnable ? 'Stop Log' : 'Start Log'}
              </a>
              {loggedData && (
                <a id="downloadLogBtn" onClick={downloadLog}>
                  <i className="fas fa-download fa-fw"></i> تحميل السجل
                </a>
              )}
              {allowReauth && (
                <a id="reauthBtn" onClick={reauthSession}>
                  <i className="fas fa-key fa-fw"></i> تغيير المستخدم
                </a>
              )}
              {allowReplay && (
                <a id="credentialsBtn" onClick={replayCredentials}>
                  <i className="fas fa-key fa-fw"></i> بيانات الاعتماد
                </a>
              )}
            </div>
          </div>
          <div id="footer"></div>
          <div id="status"></div>
          <div id="countdown"></div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;