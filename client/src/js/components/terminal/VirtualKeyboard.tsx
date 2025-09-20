
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface VirtualKeyboardProps {
  handleKeyClick: (key: string, type?: string) => void;
  isConnected?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ handleKeyClick, isConnected = true }) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [activeTab, setActiveTab] = useState('letters');
  const { t } = useTranslation();

  // مجموعات المفاتيح
  const keyGroups = useMemo(() => ({
    letters: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    numbers: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '=', '[', ']', '\\', ';', "'", ',', '.', '/']
    ],
    arabic: [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح'],
      ['ج', 'د', 'ذ', 'ك', 'ل', 'م', 'ن', 'ت', 'ا', 'ل'],
      ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
    ],
    special: [
      ['Escape', 'Tab', 'Backspace', 'Delete'],
      ['Home', 'End', 'PageUp', 'PageDown'],
      ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
      ['F7', 'F8', 'F9', 'F10', 'F11', 'F12']
    ]
  }), []);

  // أزرار التحكم المهمة
  const controlKeys = useMemo(() => [
    { key: 'C', label: 'Ctrl+C', desc: t('interrupt') },
    { key: 'X', label: 'Ctrl+X', desc: t('cut') },
    { key: 'V', label: 'Ctrl+V', desc: t('paste') },
    { key: 'Z', label: 'Ctrl+Z', desc: t('undo') },
    { key: 'D', label: 'Ctrl+D', desc: t('eof') },
    { key: 'L', label: 'Ctrl+L', desc: t('clear') }
  ], [t]);

  // معالج الضغط على مفتاح
  const handleKeyPress = useCallback((key: string, type = 'key') => {
    if (!isConnected || !handleKeyClick) return;

    let finalKey = key;
    let finalType = type;

    // تطبيق التعديلات
    if (type === 'key') {
      if (isShiftPressed && key.length === 1) {
        if (activeTab === 'letters') {
          finalKey = key.toUpperCase();
        } else if (activeTab === 'numbers') {
          // تطبيق Shift على الأرقام والرموز
          const shiftMap: { [key: string]: string } = {
            '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
            '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
            '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
            ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
          };
          finalKey = shiftMap[key] || key;
        }
      }
      if (isCtrlPressed) {
        finalType = 'control';
        finalKey = key.toUpperCase();
      }
    }

    handleKeyClick(finalKey, finalType);

    // إعادة تعيين modifiers بعد الاستخدام (ما عدا Shift في بعض الحالات)
    if (isCtrlPressed && type === 'key') {
      setIsCtrlPressed(false);
    }
  }, [isConnected, handleKeyClick, isShiftPressed, isCtrlPressed, activeTab]);

  // معالج مفاتيح التحكم المباشرة
  const handleControlKey = useCallback((key: string) => {
    if (!isConnected || !handleKeyClick) return;
    handleKeyClick(key, 'control');
  }, [isConnected, handleKeyClick]);

  // معالج تبديل المُعدِلات
  const handleModifierToggle = useCallback((modifier: string) => {
    switch (modifier) {
      case 'shift':
        setIsShiftPressed(!isShiftPressed);
        break;
      case 'ctrl':
        setIsCtrlPressed(!isCtrlPressed);
        break;
      case 'alt':
        setIsAltPressed(!isAltPressed);
        break;
    }
  }, [isShiftPressed, isCtrlPressed, isAltPressed]);

  // معالج تغيير التبويب
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // عرض المفتاح مع Shift
  const getDisplayKey = useCallback((key: string) => {
    if (isShiftPressed && activeTab === 'letters' && key.length === 1) {
      return key.toUpperCase();
    }
    if (isShiftPressed && activeTab === 'numbers') {
      const shiftMap: { [key: string]: string } = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
        ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
      };
      return shiftMap[key] || key;
    }
    return key;
  }, [isShiftPressed, activeTab]);

  return (
    <div className="virtual-keyboard">
      {/* تبويبات المفاتيح */}
      <div className="keyboard-tabs">
        {Object.keys(keyGroups).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {t(`keyboard_${tab}`)}
          </button>
        ))}
      </div>

      {/* مفاتيح التحكم السريع */}
      <div className="quick-controls">
        <div className="control-group">
          <span className="group-label">{t('control_keys')}:</span>
          {controlKeys.map(({ key, label, desc }) => (
            <button
              key={key}
              className="control-key"
              onClick={() => handleControlKey(key)}
              title={desc}
              disabled={!isConnected}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* أزرار الاتجاهات */}
      <div className="arrow-keys">
        <div className="arrow-row">
          <button
            className="arrow-key"
            onClick={() => handleKeyPress('ArrowUp', 'special')}
            disabled={!isConnected}
            title={t('up')}
          >
            ↑
          </button>
        </div>
        <div className="arrow-row">
          <button
            className="arrow-key"
            onClick={() => handleKeyPress('ArrowLeft', 'special')}
            disabled={!isConnected}
            title={t('left')}
          >
            ←
          </button>
          <button
            className="arrow-key"
            onClick={() => handleKeyPress('ArrowDown', 'special')}
            disabled={!isConnected}
            title={t('down')}
          >
            ↓
          </button>
          <button
            className="arrow-key"
            onClick={() => handleKeyPress('ArrowRight', 'special')}
            disabled={!isConnected}
            title={t('right')}
          >
            →
          </button>
        </div>
      </div>

      {/* مفاتيح التعديل */}
      <div className="modifier-keys">
        <button
          className={`modifier-key ${isShiftPressed ? 'active' : ''}`}
          onClick={() => handleModifierToggle('shift')}
        >
          Shift
        </button>
        <button
          className={`modifier-key ${isCtrlPressed ? 'active' : ''}`}
          onClick={() => handleModifierToggle('ctrl')}
        >
          Ctrl
        </button>
        <button
          className={`modifier-key ${isAltPressed ? 'active' : ''}`}
          onClick={() => handleModifierToggle('alt')}
        >
          Alt
        </button>
      </div>

      {/* مفاتيح حسب التبويب النشط */}
      <div className="main-keys">
        {keyGroups[activeTab as keyof typeof keyGroups].map((row, rowIndex) => (
          <div key={rowIndex} className="key-row">
            {row.map((key) => (
              <button
                key={key}
                className={`keyboard-key ${activeTab === 'special' ? 'special-key' : ''} ${activeTab === 'arabic' ? 'arabic-key' : ''}`}
                onClick={() => handleKeyPress(key, activeTab === 'special' ? 'special' : 'key')}
                disabled={!isConnected}
                title={activeTab === 'special' ? key : undefined}
              >
                {getDisplayKey(key)}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* مفاتيح خاصة إضافية */}
      <div className="bottom-keys">
        <button
          className="space-key"
          onClick={() => handleKeyPress(' ', 'key')}
          disabled={!isConnected}
          title={t('space')}
        >
          {t('space')}
        </button>
        <button
          className="enter-key"
          onClick={() => handleKeyPress('Enter', 'special')}
          disabled={!isConnected}
          title="Enter"
        >
          ↵ Enter
        </button>
        <button
          className="backspace-key"
          onClick={() => handleKeyPress('Backspace', 'special')}
          disabled={!isConnected}
          title="Backspace"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

export default React.memo(VirtualKeyboard);
