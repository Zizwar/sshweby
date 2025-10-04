import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ThemeSelectorProps {
  onThemeChange: (theme: any) => void;
  currentTheme?: string;
}

const themes = {
  dracula: {
    name: 'Dracula',
    colors: {
      foreground: '#F8F8F2',
      background: '#282A36',
      cursor: '#F8F8F0',
      cursorAccent: '#282A36',
      selectionBackground: '#44475A',
      black: '#21222C',
      red: '#FF5555',
      green: '#50FA7B',
      yellow: '#F1FA8C',
      blue: '#BD93F9',
      magenta: '#FF79C6',
      cyan: '#8BE9FD',
      white: '#F8F8F2',
      brightBlack: '#6272A4',
      brightRed: '#FF6E6E',
      brightGreen: '#69FF94',
      brightYellow: '#FFFFA5',
      brightBlue: '#D6ACFF',
      brightMagenta: '#FF92DF',
      brightCyan: '#A4FFFF',
      brightWhite: '#FFFFFF'
    }
  },
  monokai: {
    name: 'Monokai',
    colors: {
      foreground: '#F8F8F2',
      background: '#272822',
      cursor: '#F8F8F0',
      cursorAccent: '#272822',
      selectionBackground: '#49483E',
      black: '#272822',
      red: '#F92672',
      green: '#A6E22E',
      yellow: '#F4BF75',
      blue: '#66D9EF',
      magenta: '#AE81FF',
      cyan: '#A1EFE4',
      white: '#F8F8F2',
      brightBlack: '#75715E',
      brightRed: '#F92672',
      brightGreen: '#A6E22E',
      brightYellow: '#F4BF75',
      brightBlue: '#66D9EF',
      brightMagenta: '#AE81FF',
      brightCyan: '#A1EFE4',
      brightWhite: '#F9F8F5'
    }
  },
  solarizedDark: {
    name: 'Solarized Dark',
    colors: {
      foreground: '#839496',
      background: '#002B36',
      cursor: '#93A1A1',
      cursorAccent: '#002B36',
      selectionBackground: '#073642',
      black: '#073642',
      red: '#DC322F',
      green: '#859900',
      yellow: '#B58900',
      blue: '#268BD2',
      magenta: '#D33682',
      cyan: '#2AA198',
      white: '#EEE8D5',
      brightBlack: '#002B36',
      brightRed: '#CB4B16',
      brightGreen: '#586E75',
      brightYellow: '#657B83',
      brightBlue: '#839496',
      brightMagenta: '#6C71C4',
      brightCyan: '#93A1A1',
      brightWhite: '#FDF6E3'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      foreground: '#FFFFFF',
      background: '#000000',
      cursor: '#FFFFFF',
      cursorAccent: '#000000',
      selectionBackground: '#FFFFFF40',
      black: '#000000',
      red: '#CD0000',
      green: '#00CD00',
      yellow: '#CDCD00',
      blue: '#0000EE',
      magenta: '#CD00CD',
      cyan: '#00CDCD',
      white: '#E5E5E5',
      brightBlack: '#7F7F7F',
      brightRed: '#FF0000',
      brightGreen: '#00FF00',
      brightYellow: '#FFFF00',
      brightBlue: '#5C5CFF',
      brightMagenta: '#FF00FF',
      brightCyan: '#00FFFF',
      brightWhite: '#FFFFFF'
    }
  },
  matrix: {
    name: 'Matrix',
    colors: {
      foreground: '#00FF00',
      background: '#000000',
      cursor: '#00FF00',
      cursorAccent: '#000000',
      selectionBackground: '#003300',
      black: '#000000',
      red: '#FF0000',
      green: '#00FF00',
      yellow: '#FFFF00',
      blue: '#0000FF',
      magenta: '#FF00FF',
      cyan: '#00FFFF',
      white: '#FFFFFF',
      brightBlack: '#666666',
      brightRed: '#FF6666',
      brightGreen: '#66FF66',
      brightYellow: '#FFFF66',
      brightBlue: '#6666FF',
      brightMagenta: '#FF66FF',
      brightCyan: '#66FFFF',
      brightWhite: '#FFFFFF'
    }
  },
  nord: {
    name: 'Nord',
    colors: {
      foreground: '#D8DEE9',
      background: '#2E3440',
      cursor: '#D8DEE9',
      cursorAccent: '#2E3440',
      selectionBackground: '#434C5E',
      black: '#3B4252',
      red: '#BF616A',
      green: '#A3BE8C',
      yellow: '#EBCB8B',
      blue: '#81A1C1',
      magenta: '#B48EAD',
      cyan: '#88C0D0',
      white: '#E5E9F0',
      brightBlack: '#4C566A',
      brightRed: '#BF616A',
      brightGreen: '#A3BE8C',
      brightYellow: '#EBCB8B',
      brightBlue: '#81A1C1',
      brightMagenta: '#B48EAD',
      brightCyan: '#8FBCBB',
      brightWhite: '#ECEFF4'
    }
  }
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange, currentTheme = 'dracula' }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    onThemeChange(themes[themeName as keyof typeof themes].colors);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('select_theme')}
      >
        🎨 {themes[selectedTheme as keyof typeof themes]?.name || 'Theme'}
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-option ${selectedTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeChange(key)}
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.foreground,
                border: `1px solid ${theme.colors.foreground}40`
              }}
            >
              <span className="theme-name">{theme.name}</span>
              <div className="theme-preview">
                <span style={{ color: theme.colors.red }}>●</span>
                <span style={{ color: theme.colors.green }}>●</span>
                <span style={{ color: theme.colors.blue }}>●</span>
                <span style={{ color: theme.colors.yellow }}>●</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;