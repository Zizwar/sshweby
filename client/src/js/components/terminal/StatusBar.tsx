import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatusBarProps {
  status: string;
  footer: string;
  allowReauth: boolean;
  allowReplay: boolean;
  reauthSession: () => void;
  replayCredentials: () => void;
  connectionStatus?: string;
  isConnected?: boolean;
  websocketConnected?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  status, footer, allowReauth, allowReplay, reauthSession, replayCredentials,
  connectionStatus = 'connected', isConnected = true, websocketConnected = true
}) => {
  const { t } = useTranslation();

  const getStatusIcon = () => {
    if (!websocketConnected) return '🔴';
    if (isConnected) return '🟢';
    return '🟡';
  };

  const getStatusColor = () => {
    if (!websocketConnected) return 'error';
    if (isConnected) return 'connected';
    return 'connecting';
  };

  return (
    <div className="status-bar">
      {/* معلومات الحالة */}
      <div className="status-section">
        <div className={`connection-indicator ${getStatusColor()}`}>
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{t(connectionStatus)}</span>
        </div>
        {status && (
          <div className="status-message">
            {status}
          </div>
        )}
      </div>

      {/* معلومات الجلسة */}
      {footer && (
        <div className="session-info">
          💻 {footer}
        </div>
      )}

      {/* قائمة الإجراءات */}
      {(allowReauth || allowReplay) && (
        <div className="action-menu">
          <button className="menu-trigger">
            ⚙️ {t('options')}
          </button>
          <div className="menu-content">
            {allowReauth && (
              <button
                className="menu-item"
                onClick={reauthSession}
                title={t('reauth')}
              >
                🔑 {t('reauth')}
              </button>
            )}
            {allowReplay && (
              <button
                className="menu-item"
                onClick={replayCredentials}
                title={t('replay_credentials')}
              >
                🔁 {t('replay_credentials')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;