import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Volume2, VolumeX, RefreshCw, Wifi, WifiOff, Zap, LifeBuoy, Timer, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings,
    resetSettings
  } = useSettings();

  // Update network speed when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Network speed is now updated automatically in the context
    }
  }, [isOpen]);

  // Get connection speed label
  const getConnectionLabel = () => {
    if (!settings.networkSpeed) return 'Unknown';
    
    const { effectiveType } = settings.networkSpeed;
    switch (effectiveType) {
      case 'slow-2g': return 'Slow (2G)';
      case '2g': return '2G';
      case '3g': return '3G';
      case '4g': return '4G';
      default: return effectiveType;
    }
  };

  // Get connection quality indicator
  const getConnectionQuality = () => {
    if (!settings.networkSpeed) return 'unknown';
    
    const { effectiveType, rtt } = settings.networkSpeed;
    
    // Use both effective type and RTT for better accuracy
    if (rtt > 500 || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'poor';
    } else if (rtt > 200 || effectiveType === '3g') {
      return 'average';
    } else if (effectiveType === '4g') {
      return 'good';
    } else {
      return 'unknown';
    }
  };

  // Toggle functions
  const toggleDarkMode = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };
  
  const toggleSound = () => {
    updateSettings({ sound: !settings.sound });
  };
  
  const toggleShuffleQuestions = () => {
    updateSettings({ shuffleQuestions: !settings.shuffleQuestions });
  };
  
  const toggleShuffleOptions = () => {
    updateSettings({ shuffleOptions: !settings.shuffleOptions });
  };
  
  const toggleAnimations = () => {
    updateSettings({ animationsEnabled: !settings.animationsEnabled });
  };
  
  const toggleTimer = () => {
    updateSettings({ timerVisible: !settings.timerVisible });
  };

  // Modal animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  // Check if dark mode is active
  const isDarkMode = settings.theme === 'dark' || 
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          <motion.div 
            className="z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <LifeBuoy className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Theme Settings */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500 mr-3" />
                    )}
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">Theme</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Current: {settings.theme === 'system' ? 'System' : settings.theme === 'dark' ? 'Dark' : 'Light'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={`p-2 rounded-md ${settings.theme === 'light' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      <Sun className={`h-4 w-4 ${settings.theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={`p-2 rounded-md ${settings.theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      <Moon className={`h-4 w-4 ${settings.theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => updateSettings({ theme: 'system' })}
                      className={`p-2 rounded-md ${settings.theme === 'system' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}
                      title="Use system preference"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                        stroke={settings.theme === 'system' ? '#6366f1' : '#9ca3af'} 
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Sound */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    {settings.sound ? (
                      <Volume2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-500 mr-3" />
                    )}
                    <span className="font-medium text-gray-800 dark:text-white">Sound Effects</span>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.sound ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sound ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Timer Visibility */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    {settings.timerVisible ? (
                      <Timer className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    )}
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">Show Timer</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Display timer during quiz</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTimer}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.timerVisible ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.timerVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Shuffle Questions */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    <RefreshCw className={`h-5 w-5 ${settings.shuffleQuestions ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} mr-3`} />
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">Shuffle Questions</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Questions will appear in random order</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleShuffleQuestions}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.shuffleQuestions ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Shuffle Options */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    <RefreshCw className={`h-5 w-5 ${settings.shuffleOptions ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} mr-3`} />
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">Shuffle Options</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Answer options will appear in random order</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleShuffleOptions}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.shuffleOptions ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.shuffleOptions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Animations */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center">
                    <Zap className={`h-5 w-5 ${settings.animationsEnabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'} mr-3`} />
                    <div>
                      <span className="font-medium text-gray-800 dark:text-white">Animations</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enable/disable UI animations</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.animationsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Network Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl mt-4">
                  <div className="flex items-center mb-3">
                    {getConnectionQuality() === 'poor' ? (
                      <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                    ) : (
                      <Wifi className={`h-5 w-5 ${
                        getConnectionQuality() === 'good' ? 'text-green-500' : 
                        getConnectionQuality() === 'average' ? 'text-amber-500' : 'text-gray-500'
                      } mr-2`} />
                    )}
                    <span className="font-medium text-gray-800 dark:text-white">Network Status</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Connection</span>
                      <p className="font-semibold text-gray-800 dark:text-white">{getConnectionLabel()}</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Speed</span>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {settings.networkSpeed ? `${settings.networkSpeed.downlink} Mbps` : 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Latency</span>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {settings.networkSpeed?.rtt ? `${settings.networkSpeed.rtt} ms` : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                <button
                  onClick={resetSettings}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal; 