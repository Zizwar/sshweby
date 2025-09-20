import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TerminalSettings {
  fontSize: number;
  fontFamily: string;
  cursorBlink: boolean;
  rows: number;
  cols: number;
}

interface UISettings {
  virtualKeyboard: boolean;
  language: string;
  theme: string;
}

interface Settings {
  terminal: TerminalSettings;
  ui: UISettings;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (category: keyof Settings, key: string, value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  terminal: {
    fontSize: 14,
    fontFamily: 'Courier Prime, Courier New, Liberation Mono, monospace',
    cursorBlink: true,
    rows: 24,
    cols: 80,
  },
  ui: {
    virtualKeyboard: true,
    language: 'en',
    theme: 'dark',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('sshino-settings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('sshino-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('sshino-settings');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};