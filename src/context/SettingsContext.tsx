import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for network information
interface NetworkSpeed {
  downlink: number;
  effectiveType: string;
  rtt: number;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  animation: boolean;
  autoSave: boolean;
  sound: boolean;
  networkSpeed: NetworkSpeed | null;
  notifications: boolean;
  timerVisible: boolean;
  timerDuration: number;
  highContrastMode: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  animationsEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  updateNetworkSpeed: () => void;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  animation: true,
  autoSave: true,
  sound: true,
  networkSpeed: null,
  notifications: true,
  timerVisible: true,
  timerDuration: 30, // 30 seconds per question
  highContrastMode: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  animationsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Try to load settings from localStorage
  const loadSettings = (): Settings => {
    try {
      const savedSettings = localStorage.getItem('quiz-settings');
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Update settings in state and localStorage
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('quiz-settings', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return updated;
    });
  };

  // Reset to default settings
  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem('quiz-settings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  // Create an updateNetworkSpeed function that will be exposed through context
  const updateNetworkSpeed = () => {
    if ('connection' in navigator) {
      try {
        const connection = (navigator as any).connection;
        updateSettings({
          networkSpeed: {
            downlink: connection.downlink,
            effectiveType: connection.effectiveType,
            rtt: connection.rtt
          }
        });
      } catch (error) {
        console.error('Failed to update network speed:', error);
      }
    } else {
      console.warn('Network Information API not supported in this browser');
    }
  };

  // Monitor network connection speed
  useEffect(() => {
    // Only run if the browser supports the Network Information API
    if ('connection' in navigator) {
      try {
        const connection = (navigator as any).connection;
        
        // Set initial value
        updateNetworkSpeed();
        
        // Listen for changes in network condition
        connection.addEventListener('change', updateNetworkSpeed);
        
        // Cleanup
        return () => {
          connection.removeEventListener('change', updateNetworkSpeed);
        };
      } catch (error) {
        console.error('Error setting up network monitoring:', error);
      }
    }
  }, []);

  // Apply system theme preference if set to 'system'
  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('SettingsContext: Dark mode applied');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
        console.log('SettingsContext: Light mode applied');
      } else if (settings.theme === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDarkMode);
        console.log(`SettingsContext: System preference applied (${isDarkMode ? 'dark' : 'light'})`);
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Apply high contrast mode if enabled
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrastMode);
  }, [settings.highContrastMode]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.dataset.fontSize = settings.fontSize;
  }, [settings.fontSize]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, updateNetworkSpeed }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 