import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';
import ThemeSelector from './ThemeSelector';

interface ToolbarProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  toggleLog: () => void;
  downloadLog: () => void;
  sessionLogEnable: boolean;
  loggedData: boolean;
  sendCtrlC: () => void;
  clearScreen: () => void;
  toggleFullscreen: () => void;
  showConnectionInfo: () => void;
  useAndroidKeyboard: () => void;
  showKeyboard: boolean;
  toggleKeyboard: () => void;
  isConnected?: boolean;
  connectionStatus?: string;
  websocketConnected?: boolean;
  onThemeChange?: (theme: any) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    fontSize, setFontSize,
    toggleLog, downloadLog, sessionLogEnable, loggedData,
    sendCtrlC, clearScreen, toggleFullscreen, showConnectionInfo, useAndroidKeyboard,
    showKeyboard, toggleKeyboard, isConnected = true, connectionStatus = 'connected', websocketConnected = true,
    onThemeChange
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [showMenu, setShowMenu] = useState(false);

  // معالج تغيير حجم الخط مع حفظ الإعدادات
  const changeFontSize = (delta: number) => {
    const currentSize = settings.terminal.fontSize || 14;
    const newSize = Math.max(8, Math.min(28, currentSize + delta));
    setFontSize(newSize);
  };

  return (
    <div className="terminal-toolbar">
      {/* مؤشر الحالة - أولاً للأهمية */}
      <div className="connection-status-mobile">
        <span className={`status-dot ${connectionStatus}`}>
          {!websocketConnected && '🔴'}
          {websocketConnected && isConnected && '🟢'}
          {websocketConnected && !isConnected && '🟡'}
        </span>
      </div>

      {/* الأزرار الأساسية فقط */}
      <div className="primary-controls">
        <button
          className={`control-btn-large keyboard-btn ${showKeyboard ? 'active' : ''}`}
          onClick={toggleKeyboard}
          title={t('toggle_keyboard')}
        >
          <span className="btn-icon">⌨️</span>
          <span className="btn-label">{showKeyboard ? t('hide_keyboard') : t('show_keyboard')}</span>
        </button>

        <button
          className="control-btn-large interrupt-btn"
          onClick={sendCtrlC}
          title={t('interrupt')}
          disabled={!isConnected}
        >
          <span className="btn-icon">⏹️</span>
          <span className="btn-label">Ctrl+C</span>
        </button>

        <button
          className="control-btn-large clear-btn"
          onClick={clearScreen}
          title={t('clear_terminal')}
          disabled={!isConnected}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-label">{t('clear')}</span>
        </button>
      </div>

      {/* زر القائمة */}
      <div className="menu-wrapper">
        <button
          className="control-btn-large menu-btn"
          onClick={() => setShowMenu(!showMenu)}
          title={t('more_options')}
        >
          <span className="btn-icon">⋮</span>
        </button>

        {/* القائمة المنبثقة */}
        {showMenu && (
          <>
            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
            <div className="dropdown-menu">
              <button
                className="menu-item"
                onClick={() => {
                  changeFontSize(1);
                  setShowMenu(false);
                }}
                disabled={!isConnected}
              >
                <span className="menu-icon">🔍+</span>
                {t('increase_font')}
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  changeFontSize(-1);
                  setShowMenu(false);
                }}
                disabled={!isConnected}
              >
                <span className="menu-icon">🔍-</span>
                {t('decrease_font')}
              </button>
              <div className="menu-divider" />
              <button
                className="menu-item"
                onClick={() => {
                  toggleFullscreen();
                  setShowMenu(false);
                }}
              >
                <span className="menu-icon">⛶</span>
                {t('fullscreen')}
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  useAndroidKeyboard();
                  setShowMenu(false);
                }}
              >
                <span className="menu-icon">📱</span>
                {t('android_keyboard')}
              </button>
              <div className="menu-divider" />
              <button
                className="menu-item"
                onClick={() => {
                  toggleLog();
                  setShowMenu(false);
                }}
              >
                <span className="menu-icon">📋</span>
                {sessionLogEnable ? t('stop_log') : t('start_log')}
              </button>
              {loggedData && (
                <button
                  className="menu-item"
                  onClick={() => {
                    downloadLog();
                    setShowMenu(false);
                  }}
                >
                  <span className="menu-icon">📥</span>
                  {t('download_log')}
                </button>
              )}
              <div className="menu-divider" />
              <button
                className="menu-item"
                onClick={() => {
                  showConnectionInfo();
                  setShowMenu(false);
                }}
              >
                <span className="menu-icon">ℹ️</span>
                {t('connection_info')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;