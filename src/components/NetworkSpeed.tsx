import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, GaugeCircle, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const NetworkSpeed: React.FC = () => {
  const { settings, updateNetworkSpeed } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!updateNetworkSpeed) {
      setError("Network speed monitoring is not available");
      return () => {};
    }
    
    try {
      // Update network speed on initial load
      updateNetworkSpeed();
      
      // Set up interval to update speed every 10 seconds
      const intervalId = setInterval(() => {
        try {
          updateNetworkSpeed();
        } catch (err) {
          console.error("Error updating network speed:", err);
          setError("Failed to update network speed");
          clearInterval(intervalId);
        }
      }, 10000);
      
      // Show the component after a short delay
      const timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error("Error in network speed component:", err);
      setError("Network speed monitoring failed to initialize");
      return () => {};
    }
  }, [updateNetworkSpeed]);

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Close the component
  const closeWidget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };
  
  // Get connection quality and color
  const getConnectionQuality = () => {
    if (!settings?.networkSpeed) return { quality: 'unknown', color: 'text-gray-500' };
    
    const { effectiveType } = settings.networkSpeed;
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return { quality: 'poor', color: 'text-red-500' };
      case '3g':
        return { quality: 'average', color: 'text-amber-500' };
      case '4g':
        return { quality: 'good', color: 'text-green-500' };
      default:
        return { quality: 'unknown', color: 'text-gray-500' };
    }
  };
  
  const { quality, color } = getConnectionQuality();
  
  const speedValue = settings?.networkSpeed?.downlink || 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 20 }
  };
  
  const expandedVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  // Don't show if there's an error or the component is not visible
  if (!isVisible || error) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-40 flex flex-col items-end"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          onClick={toggleExpanded}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-3 flex items-center">
            <button 
              onClick={closeWidget} 
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
            
            <div className="mr-2 relative">
              <GaugeCircle className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              {quality === 'poor' ? (
                <WifiOff className={`h-4 w-4 ${color} absolute top-2 left-2`} />
              ) : (
                <Wifi className={`h-4 w-4 ${color} absolute top-2 left-2`} />
              )}
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="font-bold text-xl text-gray-800 dark:text-white">{speedValue}</span>
                <span className="text-xs text-gray-500 ml-1">Mbps</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{quality} connection</div>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={expandedVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700"
              >
                <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {settings?.networkSpeed?.effectiveType.toUpperCase() || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <p className={`font-semibold capitalize ${color}`}>{quality}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkSpeed; 