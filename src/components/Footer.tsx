import React from 'react';
import logoImg from '../logo/logo.png';

interface FooterProps {
  onAboutClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAboutClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-sm py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <img src={logoImg} alt="Logo" className="h-6 w-6 rounded-md shadow-sm" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} SadiyaIgnite. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-4 mt-2 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onAboutClick) onAboutClick();
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
