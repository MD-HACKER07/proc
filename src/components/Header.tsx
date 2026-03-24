import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Settings, BarChart, ShieldAlert, Info, Wifi, WifiOff, Home } from 'lucide-react';
import logoImg from '../logo/logo.png';
import { useExam } from '../context/ExamContext';
import { useSettings } from '../context/SettingsContext';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  appState?: 'welcome' | 'quiz' | 'dashboard' | 'admin' | 'results' | 'profile' | 'registration' | 'reviews' | 'detailed-results' | 'about' | 'user-login' | 'user-profile' | 'proctored-quiz' | 'quiz-selector';
  onAdminClick?: () => void;
  onAboutClick?: () => void;
  onHomeClick?: () => void;
  questions?: any[];
  userProfile?: { displayName?: string; email?: string; prn?: string; firstName?: string; lastName?: string };
}

const Header: React.FC<HeaderProps> = ({ appState, onAdminClick, onAboutClick, onHomeClick, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Add default values using destructuring to handle potential undefined values
  const examContext = useExam();
  const currentQuestionIndex = examContext?.currentQuestionIndex || 0;
  const questions = examContext?.questions || [];
  
  const { settings, updateSettings } = useSettings();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    if (!settings || !updateSettings) return;
    
    // Force immediate theme change by directly manipulating classList first
    if (settings.theme === 'dark') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    
    // Then update the settings to persist the change
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    console.log('Toggling theme to:', newTheme);
    updateSettings({ theme: newTheme });
    
    // Apply a force refresh of the theme by triggering a small reflow
    document.body.style.display = 'none';
    // Force a reflow
    void document.body.offsetHeight;
    document.body.style.display = '';
    
    // Log current classes for debugging
    console.log('Current document classes:', document.documentElement.className);
  };

  // Explicitly calculate isDarkMode to ensure it's accurate
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Get network quality indicator
  const getNetworkQuality = () => {
    if (!settings?.networkSpeed) return { icon: <WifiOff className="h-4 w-4" />, color: 'text-gray-400', label: 'Unknown' };
    
    const { effectiveType, rtt } = settings.networkSpeed;
    
    // Use both effectiveType and RTT (Round Trip Time) for more accurate quality assessment
    if (rtt > 500 || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return { 
        icon: <WifiOff className="h-4 w-4" />,
        color: 'text-red-500',
        label: 'Poor'
      };
    } else if (rtt > 200 || effectiveType === '3g') {
      return { 
        icon: <Wifi className="h-4 w-4" />,
        color: 'text-amber-500',
        label: 'Average'
      };
    } else if (effectiveType === '4g') {
      return { 
        icon: <Wifi className="h-4 w-4" />,
        color: 'text-green-500',
        label: 'Good'
      };
    } else {
      return { 
        icon: <Wifi className="h-4 w-4" />,
        color: 'text-gray-400',
        label: 'Unknown'
      };
    }
  };

  const network = getNetworkQuality();

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-4 md:px-6 sticky top-0 z-30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={logoImg} alt="Logo" className="h-8 w-8 mr-2.5 rounded-md shadow-sm" />
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 tracking-tight filter drop-shadow-sm">SadiyaIgnite</span>
            </motion.div>

            {/* Quiz Progress (shows only during quiz) */}
            {appState === 'quiz' && (
              <motion.div 
                className="hidden md:flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="text-sm mr-2 text-indigo-700 dark:text-indigo-300">Question</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-200">{currentQuestionIndex + 1}</span>
                <span className="mx-1 text-indigo-500">/</span>
                <span className="text-indigo-600 dark:text-indigo-400">{questions.length}</span>

              </motion.div>
            )}

            {/* Network Status (on desktop only) */}
            <motion.div 
              className="hidden md:flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {settings?.networkSpeed && (
                <div className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center hover:shadow-md transition-all">
                  <span className={`${network.color} mr-1.5`}>
                    {network.icon}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{settings.networkSpeed.downlink} Mbps</span>
                </div>
              )}
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Home Button */}
              {onHomeClick && (
                <motion.button 
                  onClick={onHomeClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md"
                  title="Home"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
              )}

              {/* Theme Toggle */}
              <motion.button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600" />
                )}
              </motion.button>

              {/* Stats Button */}
              <motion.button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <BarChart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* About Developer Button */}
              {onAboutClick && (
                <motion.button 
                  onClick={onAboutClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md"
                  title="About Developer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Info className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
              )}

              {/* Admin Button - Only show to authenticated admins */}
              {onAdminClick && typeof localStorage !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true' && (
                <motion.button 
                  onClick={onAdminClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:shadow-md"
                  title="Admin Access"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <ShieldAlert className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                {userProfile?.displayName || 
                 (userProfile?.firstName && userProfile?.lastName ? 
                   `${userProfile.firstName} ${userProfile.lastName}` : 
                   userProfile?.email || 'User')}
              </span>
              {userProfile?.prn && (
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                  PRN: {userProfile.prn}
                </span>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="md:hidden bg-white dark:bg-gray-800 py-4 mt-2 rounded-lg shadow-lg"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-3">
                  {appState === 'quiz' && (
                    <div className="flex justify-center items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm mr-2">Question</span>
                      <span className="font-bold">{currentQuestionIndex + 1}</span>
                      <span className="mx-1">/</span>
                      <span className="text-gray-500">{questions.length}</span>
                      
                    </div>
                  )}
                  
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="h-5 w-5 text-yellow-400 mr-3" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 text-indigo-600 mr-3" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={openSettings}
                    className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-md"
                  >
                    <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <span className="text-indigo-700 dark:text-indigo-300 font-medium">Settings</span>
                  </button>
                  
                  <button className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <BarChart className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                    <span>Statistics</span>
                  </button>

                  {/* Network Status (Mobile) */}
                  {settings?.networkSpeed && (
                    <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <div className={`text-sm flex items-center ${network.color}`}>
                        {network.icon}
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {settings.networkSpeed.downlink} Mbps ({network.label})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* About Developer Button (Mobile) */}
                  {onAboutClick && (
                    <button 
                      onClick={onAboutClick}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <Info className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                      <span>About Developer</span>
                    </button>
                  )}

                  {/* Admin Button (Mobile) */}
                  {onAdminClick && (
                    <button 
                      onClick={onAdminClick}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <ShieldAlert className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                      <span>Admin Access</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;