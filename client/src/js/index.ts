/* eslint-disable import/no-extraneous-dependencies */
import { io } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faBars, faClipboard, faDownload, faKey, faCog } from '@fortawesome/free-solid-svg-icons';

library.add(faBars, faClipboard, faDownload, faKey, faCog);
dom.watch();

const debug = require('debug')('WebSSH2');
require('@xterm/xterm/css/xterm.css');
require('../css/style.css');

/* global Blob, logBtn, credentialsBtn, reauthBtn, downloadLogBtn */ // eslint-disable-line
let sessionLogEnable = false;
let loggedData = false;
let allowreplay = false;
let allowreauth = false;
let sessionLog: string;
let sessionFooter: any;
let logDate: {
  getFullYear: () => any;
  getMonth: () => number;
  getDate: () => any;
  getHours: () => any;
  getMinutes: () => any;
  getSeconds: () => any;
};
let currentDate: Date;
let myFile: string;
let errorExists: boolean;
const term = new Terminal();
// Make term available globally for mobile keyboard functions in HTML
(window as any).term = term;

// DOM properties
const logBtn = document.getElementById('logBtn');
const credentialsBtn = document.getElementById('credentialsBtn');
const reauthBtn = document.getElementById('reauthBtn');
const downloadLogBtn = document.getElementById('downloadLogBtn');
const status = document.getElementById('status');
const header = document.getElementById('header');
const footer = document.getElementById('footer');
const countdown = document.getElementById('countdown');
const fitAddon = new FitAddon();
const terminalContainer = document.getElementById('terminal-container');
term.loadAddon(fitAddon);
term.open(terminalContainer);
term.focus();
fitAddon.fit();

const socket = io({
  path: '/ssh/socket.io',
});

// reauthenticate
function reauthSession () { // eslint-disable-line
  debug('re-authenticating');
  socket.emit('control', 'reauth');
  window.location.href = '/ssh/reauth';
  return false;
}

// cross browser method to "download" an element to the local system
// used for our client-side logging feature
function downloadLog () { // eslint-disable-line
  if (loggedData === true) {
    myFile = `WebSSH2-${logDate.getFullYear()}${
      logDate.getMonth() + 1
    }${logDate.getDate()}_${logDate.getHours()}${logDate.getMinutes()}${logDate.getSeconds()}.log`;
    // regex should eliminate escape sequences from being logged.
    const blob = new Blob(
      [
        sessionLog.replace(
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[\]()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><;]/g,
          ''
        ),
      ],
      {
        // eslint-disable-line no-control-regex
        type: 'text/plain',
      }
    );
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = myFile;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
  term.focus();
}
// Set variable to toggle log data from client/server to a varialble
// for later download
function toggleLog () { // eslint-disable-line
  if (sessionLogEnable === true) {
    sessionLogEnable = false;
    loggedData = true;
    logBtn.innerHTML = '<i class="fas fa-clipboard fa-fw"></i> Start Log';
    currentDate = new Date();
    sessionLog = `${sessionLog}\r\n\r\nLog End for ${sessionFooter}: ${currentDate.getFullYear()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()} @ ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}\r\n`;
    logDate = currentDate;
    term.focus();
    return false;
  }
  sessionLogEnable = true;
  loggedData = true;
  logBtn.innerHTML = '<i class="fas fa-cog fa-spin fa-fw"></i> Stop Log';
  downloadLogBtn.style.color = '#000';
  downloadLogBtn.addEventListener('click', downloadLog);
  currentDate = new Date();
  sessionLog = `Log Start for ${sessionFooter}: ${currentDate.getFullYear()}/${
    currentDate.getMonth() + 1
  }/${currentDate.getDate()} @ ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}\r\n\r\n`;
  logDate = currentDate;
  term.focus();
  return false;
}

// replay password to server, requires
function replayCredentials () { // eslint-disable-line
  socket.emit('control', 'replayCredentials');
  debug(`control: replayCredentials`);
  term.focus();
  return false;
}

// draw/re-draw menu and reattach listeners
// when dom is changed, listeners are abandonded
function drawMenu() {
  logBtn.addEventListener('click', toggleLog);
  if (allowreauth) {
    reauthBtn.addEventListener('click', reauthSession);
    reauthBtn.style.display = 'block';
  }
  if (allowreplay) {
    credentialsBtn.addEventListener('click', replayCredentials);
    credentialsBtn.style.display = 'block';
  }
  if (loggedData) {
    downloadLogBtn.addEventListener('click', downloadLog);
    downloadLogBtn.style.display = 'block';
  }
}

function resizeScreen() {
  fitAddon.fit();
  socket.emit('resize', { cols: term.cols, rows: term.rows });
  debug(`resize: ${JSON.stringify({ cols: term.cols, rows: term.rows })}`);
}

window.addEventListener('resize', resizeScreen, false);

// Mobile keys integration with the new HTML structure
let ctrlActive = false;
let altActive = false;

// Function to handle mobile keyboard events
function setupMobileKeyHandlers() {
  // Set up handlers for all key buttons created dynamically in the HTML
  const keyButtons = document.querySelectorAll('.key-btn');
  
  keyButtons.forEach((button: any) => {
    // Skip if already has event listener
    if (button.hasAttribute('data-handler-set')) return;
    button.setAttribute('data-handler-set', 'true');
    
    button.addEventListener('click', (e: Event) => {
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      const key = target.dataset.key;
      const char = target.dataset.char;
      
      // Handle special keys
      if (key) {
        switch (key) {
          case 'Escape':
            socket.emit('data', '\x1b');
            break;
          case 'Tab':
            socket.emit('data', '\t');
            break;
          case 'ArrowUp':
            socket.emit('data', '\x1b[A');
            break;
          case 'ArrowDown':
            socket.emit('data', '\x1b[B');
            break;
          case 'ArrowLeft':
            socket.emit('data', '\x1b[D');
            break;
          case 'ArrowRight':
            socket.emit('data', '\x1b[C');
            break;
          case 'Enter':
            socket.emit('data', '\r');
            break;
          case 'Backspace':
            socket.emit('data', '\b');
            break;
          case 'Control':
            ctrlActive = !ctrlActive;
            altActive = false;
            target.classList.toggle('active', ctrlActive);
            // Remove active from alt buttons
            document.querySelectorAll('[data-key="Alt"]').forEach(btn => btn.classList.remove('active'));
            break;
          case 'Alt':
            altActive = !altActive;
            ctrlActive = false;
            target.classList.toggle('active', altActive);
            // Remove active from ctrl buttons
            document.querySelectorAll('[data-key="Control"]').forEach(btn => btn.classList.remove('active'));
            break;
        }
      }
      
      // Handle character keys
      if (char && !key) {
        let charToSend = char;
        if (char === '___') charToSend = ' '; // Space key
        
        if (ctrlActive) {
          switch (charToSend.toLowerCase()) {
            case 'c':
              socket.emit('data', '\x03');
              break;
            case 'a':
              socket.emit('data', '\x01');
              break;
            case 'x':
              socket.emit('data', '\x18');
              break;
            case 'v':
              socket.emit('data', '\x16');
              break;
            case 'z':
              socket.emit('data', '\x1a');
              break;
            case 'd':
              socket.emit('data', '\x04');
              break;
            default:
              socket.emit('data', charToSend);
          }
          // Reset ctrl after use
          ctrlActive = false;
          document.querySelectorAll('[data-key="Control"]').forEach(btn => btn.classList.remove('active'));
        } else if (altActive) {
          socket.emit('data', '\x1b' + charToSend);
          // Reset alt after use
          altActive = false;
          document.querySelectorAll('[data-key="Alt"]').forEach(btn => btn.classList.remove('active'));
        } else {
          socket.emit('data', charToSend);
        }
      }
      
      term.focus();
    });
  });
}

// Initialize mobile keyboard on DOM ready
document.addEventListener('DOMContentLoaded', setupMobileKeyHandlers);

// Also set up when the page loads (in case DOMContentLoaded already fired)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMobileKeyHandlers);
} else {
  setupMobileKeyHandlers();
}

term.onData((data) => {
  // Handle regular terminal input
  // The mobile keyboard is handled separately in setupMobileKeyHandlers
  socket.emit('data', data);
});

socket.on('data', (data: string | Uint8Array) => {
  term.write(data);
  if (sessionLogEnable) {
    sessionLog += data;
  }
});

socket.on('connect', () => {
  socket.emit('geometry', term.cols, term.rows);
  debug(`geometry: ${term.cols}, ${term.rows}`);
});

socket.on(
  'setTerminalOpts',
  (data: {
    cursorBlink: boolean;
    scrollback: number;
    tabStopWidth: number;
    bellStyle: 'none' | 'sound';
    fontSize: number;
    fontFamily: string;
    letterSpacing: number;
    lineHeight: number;
  }) => {
    term.options = data;
  }
);

socket.on('title', (data: string) => {
  document.title = data;
});

socket.on('menu', () => {
  drawMenu();
});

socket.on('status', (data: string) => {
  status.innerHTML = data;
});

socket.on('ssherror', (data: string) => {
  status.innerHTML = data;
  status.style.backgroundColor = 'red';
  errorExists = true;
});

socket.on('headerBackground', (data: string) => {
  header.style.backgroundColor = data;
});

socket.on('header', (data: string) => {
  if (data) {
    header.innerHTML = data;
    header.style.display = 'block';
    // header is 19px and footer is 19px, recaculate new terminal-container and resize
    terminalContainer.style.height = 'calc(100% - 38px)';
    resizeScreen();
  }
});

socket.on('footer', (data: string) => {
  sessionFooter = data;
  footer.innerHTML = data;
});

socket.on('statusBackground', (data: string) => {
  status.style.backgroundColor = data;
});

socket.on('allowreplay', (data: boolean) => {
  if (data === true) {
    debug(`allowreplay: ${data}`);
    allowreplay = true;
    drawMenu();
  } else {
    allowreplay = false;
    debug(`allowreplay: ${data}`);
  }
});

socket.on('allowreauth', (data: boolean) => {
  if (data === true) {
    debug(`allowreauth: ${data}`);
    allowreauth = true;
    drawMenu();
  } else {
    allowreauth = false;
    debug(`allowreauth: ${data}`);
  }
});

socket.on('disconnect', (err: any) => {
  if (!errorExists) {
    status.style.backgroundColor = 'red';
    status.innerHTML = `WEBSOCKET SERVER DISCONNECTED: ${err}`;
  }
  socket.io.reconnection(false);
  countdown.classList.remove('active');
});

socket.on('error', (err: any) => {
  if (!errorExists) {
    status.style.backgroundColor = 'red';
    status.innerHTML = `ERROR: ${err}`;
  }
});

socket.on('reauth', () => {
  if (allowreauth) {
    reauthSession();
  }
});

// safe shutdown
let hasCountdownStarted = false;

socket.on('shutdownCountdownUpdate', (remainingSeconds: any) => {
  if (!hasCountdownStarted) {
    countdown.classList.add('active');
    hasCountdownStarted = true;
  }
  countdown.innerText = `Shutting down in ${remainingSeconds}s`;
});

term.onTitleChange((title) => {
  document.title = title;
});
