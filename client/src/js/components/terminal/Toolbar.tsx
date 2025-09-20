import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';

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
}

const Toolbar: React.FC<ToolbarProps> = ({
    fontSize, setFontSize,
    toggleLog, downloadLog, sessionLogEnable, loggedData,
    sendCtrlC, clearScreen, toggleFullscreen, showConnectionInfo, useAndroidKeyboard,
    showKeyboard, toggleKeyboard, isConnected = true, connectionStatus = 'connected', websocketConnected = true
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // معالج تغيير حجم الخط مع حفظ الإعدادات
  const changeFontSize = (delta: number) => {
    const currentSize = settings.terminal.fontSize || 14;
    const newSize = Math.max(8, Math.min(28, currentSize + delta));
    setFontSize(newSize);
  };

  return (
    <div className="terminal-toolbar">
      {/* أزرار التحكم الأساسية */}
      <div className="terminal-controls">
        <button
          className="control-btn"
          onClick={() => changeFontSize(1)}
          title={t('increase_font')}
          disabled={!isConnected}
        >
          A+
        </button>
        <button
          className="control-btn"
          onClick={() => changeFontSize(-1)}
          title={t('decrease_font')}
          disabled={!isConnected}
        >
          A-
        </button>
        <button
          className="control-btn"
          onClick={clearScreen}
          title={t('clear_terminal')}
          disabled={!isConnected}
        >
          🗑️
        </button>
        <button
          className={`control-btn keyboard-toggle ${showKeyboard ? 'active' : ''}`}
          onClick={toggleKeyboard}
          title={t('toggle_keyboard')}
        >
          ⌨️
        </button>
        <button
          className="control-btn"
          onClick={sendCtrlC}
          title={t('interrupt')}
          disabled={!isConnected}
        >
          ⏹️
        </button>
        <button
          className="control-btn"
          onClick={toggleFullscreen}
          title={t('fullscreen')}
        >
          ⛶
        </button>
        <button
          className="control-btn"
          onClick={showConnectionInfo}
          title={t('connection_info')}
        >
          ℹ️
        </button>
        <button
          className="control-btn"
          onClick={useAndroidKeyboard}
          title={t('android_keyboard')}
        >
          📱
        </button>
      </div>

      {/* مؤشر الحالة */}
      <div className="connection-status">
        <span className={`status-indicator ${connectionStatus}`}>
          {!websocketConnected && '🔴 '}
          {websocketConnected && isConnected && '🟢 '}
          {websocketConnected && !isConnected && '🟡 '}
          {t(connectionStatus)}
        </span>
      </div>

      {/* أزرار السجل */}
      <div className="log-controls">
        <button
          className={`control-btn ${sessionLogEnable ? 'active' : ''}`}
          onClick={toggleLog}
          title={sessionLogEnable ? t('stop_log') : t('start_log')}
        >
          📋 {sessionLogEnable ? t('stop_log') : t('start_log')}
        </button>
        {loggedData && (
          <button
            className="control-btn"
            onClick={downloadLog}
            title={t('download_log')}
          >
            📥 {t('download_log')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;