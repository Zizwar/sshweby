import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TerminalHandle } from './TerminalComponent';

interface VirtualKeyboardProps {
  handleKeyClick: (key: string, type?: string) => void;
  isConnected?: boolean;
  terminalHandle: React.RefObject<TerminalHandle>;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ handleKeyClick, isConnected = true, terminalHandle }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { t } = useTranslation();

  // أزرار التحكم الأساسية فقط - الأكثر استخداماً
  const quickCommands = useMemo(() => [
    { key: 'C', label: 'Ctrl+C', desc: 'إيقاف', type: 'control', color: 'danger' },
    { key: 'L', label: 'Ctrl+L', desc: 'مسح', type: 'control', color: 'info' },
    { key: 'D', label: 'Ctrl+D', desc: 'خروج', type: 'control', color: 'warning' },
    { key: 'Z', label: 'Ctrl+Z', desc: 'تراجع', type: 'control', color: 'secondary' }
  ], []);

  // معالج الضغط على مفتاح
  const handleKeyPress = useCallback((key: string, type = 'key') => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (!isConnected) {
      if (terminalHandle.current?.displayDisconnectedKeyPress) {
        terminalHandle.current.displayDisconnectedKeyPress(key);
      }
      return;
    }

    if (!handleKeyClick) return;
    handleKeyClick(key, type);
  }, [isConnected, handleKeyClick, terminalHandle]);

  // معالج مفاتيح التحكم المباشرة
  const handleControlKey = useCallback((key: string, type: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (!isConnected || !handleKeyClick) return;
    handleKeyClick(key, type);
  }, [isConnected, handleKeyClick]);

  return (
    <div className="virtual-keyboard-compact">
      {/* أوامر سريعة - الأكثر استخداماً */}
      <div className="quick-commands">
        {quickCommands.map(({ key, label, desc, type, color }) => (
          <button
            key={key}
            className={`quick-cmd-btn ${color} ${activeKey === key ? 'active-feedback' : ''}`}
            onClick={() => handleControlKey(key, type)}
            title={desc}
            disabled={!isConnected}
          >
            <span className="cmd-label">{label}</span>
            <span className="cmd-desc">{desc}</span>
          </button>
        ))}
      </div>

      {/* أزرار الاتجاهات - كبيرة وواضحة */}
      <div className="navigation-pad">
        <div className="nav-row top">
          <button
            className={`nav-key up ${activeKey === 'ArrowUp' ? 'active-feedback' : ''}`}
            onClick={() => handleKeyPress('ArrowUp', 'special')}
            disabled={!isConnected}
            title="↑"
          >
            ▲
          </button>
        </div>
        <div className="nav-row middle">
          <button
            className={`nav-key left ${activeKey === 'ArrowLeft' ? 'active-feedback' : ''}`}
            onClick={() => handleKeyPress('ArrowLeft', 'special')}
            disabled={!isConnected}
            title="←"
          >
            ◄
          </button>
          <button
            className={`nav-key down ${activeKey === 'ArrowDown' ? 'active-feedback' : ''}`}
            onClick={() => handleKeyPress('ArrowDown', 'special')}
            disabled={!isConnected}
            title="↓"
          >
            ▼
          </button>
          <button
            className={`nav-key right ${activeKey === 'ArrowRight' ? 'active-feedback' : ''}`}
            onClick={() => handleKeyPress('ArrowRight', 'special')}
            disabled={!isConnected}
            title="→"
          >
            ►
          </button>
        </div>
      </div>

      {/* مفاتيح خاصة - الأساسية فقط */}
      <div className="special-keys-row">
        <button
          className={`special-key esc ${activeKey === 'Escape' ? 'active-feedback' : ''}`}
          onClick={() => handleKeyPress('Escape', 'special')}
          disabled={!isConnected}
          title="Escape"
        >
          ESC
        </button>
        <button
          className={`special-key tab ${activeKey === 'Tab' ? 'active-feedback' : ''}`}
          onClick={() => handleKeyPress('Tab', 'special')}
          disabled={!isConnected}
          title="Tab"
        >
          TAB
        </button>
        <button
          className={`special-key enter ${activeKey === 'Enter' ? 'active-feedback' : ''}`}
          onClick={() => handleKeyPress('Enter', 'special')}
          disabled={!isConnected}
          title="Enter"
        >
          ↵ ENTER
        </button>
        <button
          className={`special-key backspace ${activeKey === 'Backspace' ? 'active-feedback' : ''}`}
          onClick={() => handleKeyPress('Backspace', 'special')}
          disabled={!isConnected}
          title="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* مساحة - للنصوص */}
      <div className="space-row">
        <button
          className="space-key-compact"
          onClick={() => handleKeyPress(' ', 'key')}
          disabled={!isConnected}
          title="مسافة"
        >
          {t('space')} / استخدم كيبورد الهاتف للكتابة
        </button>
      </div>
    </div>
  );
};

export default React.memo(VirtualKeyboard);