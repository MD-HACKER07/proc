import React from 'react';
import { Book, Code, Cpu, Globe, Brain, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SubjectCardProps {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  name,
  description = 'Test your knowledge with this comprehensive quiz',
  icon = 'book',
  color = 'blue',
  questionCount = 0,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  showActions = false
}) => {
  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code className="h-6 w-6" />;
      case 'cpu':
        return <Cpu className="h-6 w-6" />;
      case 'globe':
        return <Globe className="h-6 w-6" />;
      case 'brain':
        return <Brain className="h-6 w-6" />;
      default:
        return <Book className="h-6 w-6" />;
    }
  };

  // Get color classes based on color name
  const getColorClasses = (colorName = 'blue') => {
    const colorMap: Record<string, {
      bg: string, 
      darkBg: string, 
      text: string, 
      darkText: string, 
      icon: string, 
      darkIcon: string,
      border: string
    }> = {
      green: {
        bg: 'bg-green-50',
        darkBg: 'dark:bg-green-900/30',
        text: 'text-green-600',
        darkText: 'dark:text-green-400',
        icon: 'bg-green-100 text-green-600',
        darkIcon: 'dark:bg-green-800/50 dark:text-green-400',
        border: 'border-green-200'
      },
      blue: {
        bg: 'bg-blue-50',
        darkBg: 'dark:bg-blue-900/30',
        text: 'text-blue-600',
        darkText: 'dark:text-blue-400',
        icon: 'bg-blue-100 text-blue-600',
        darkIcon: 'dark:bg-blue-800/50 dark:text-blue-400',
        border: 'border-blue-200'
      },
      indigo: {
        bg: 'bg-indigo-50',
        darkBg: 'dark:bg-indigo-900/30',
        text: 'text-indigo-600',
        darkText: 'dark:text-indigo-400',
        icon: 'bg-indigo-100 text-indigo-600',
        darkIcon: 'dark:bg-indigo-800/50 dark:text-indigo-400',
        border: 'border-indigo-200'
      },
      purple: {
        bg: 'bg-purple-50',
        darkBg: 'dark:bg-purple-900/30',
        text: 'text-purple-600',
        darkText: 'dark:text-purple-400',
        icon: 'bg-purple-100 text-purple-600',
        darkIcon: 'dark:bg-purple-800/50 dark:text-purple-400',
        border: 'border-purple-200'
      },
      pink: {
        bg: 'bg-pink-50',
        darkBg: 'dark:bg-pink-900/30',
        text: 'text-pink-600',
        darkText: 'dark:text-pink-400',
        icon: 'bg-pink-100 text-pink-600',
        darkIcon: 'dark:bg-pink-800/50 dark:text-pink-400',
        border: 'border-pink-200'
      },
      red: {
        bg: 'bg-red-50',
        darkBg: 'dark:bg-red-900/30',
        text: 'text-red-600',
        darkText: 'dark:text-red-400',
        icon: 'bg-red-100 text-red-600',
        darkIcon: 'dark:bg-red-800/50 dark:text-red-400',
        border: 'border-red-200'
      },
      orange: {
        bg: 'bg-orange-50',
        darkBg: 'dark:bg-orange-900/30',
        text: 'text-orange-600',
        darkText: 'dark:text-orange-400',
        icon: 'bg-orange-100 text-orange-600',
        darkIcon: 'dark:bg-orange-800/50 dark:text-orange-400',
        border: 'border-orange-200'
      },
      amber: {
        bg: 'bg-amber-50',
        darkBg: 'dark:bg-amber-900/30',
        text: 'text-amber-600',
        darkText: 'dark:text-amber-400',
        icon: 'bg-amber-100 text-amber-600',
        darkIcon: 'dark:bg-amber-800/50 dark:text-amber-400',
        border: 'border-amber-200'
      },
      teal: {
        bg: 'bg-teal-50',
        darkBg: 'dark:bg-teal-900/30',
        text: 'text-teal-600',
        darkText: 'dark:text-teal-400',
        icon: 'bg-teal-100 text-teal-600',
        darkIcon: 'dark:bg-teal-800/50 dark:text-teal-400',
        border: 'border-teal-200'
      }
    };

    return colorMap[colorName] || colorMap.blue;
  };

  const colorClasses = getColorClasses(color);
  
  const handleClick = () => {
    if (onClick) onClick(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${colorClasses.bg} ${colorClasses.darkBg} ${colorClasses.border}
        border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200
        ${isSelected ? `ring-2 ring-offset-2 ${colorClasses.text}` : ''}
      `}
      onClick={handleClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`${colorClasses.icon} ${colorClasses.darkIcon} rounded-full h-10 w-10 flex items-center justify-center`}>
            {getIconComponent(icon)}
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Edit Subject"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete Subject"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        <h3 className={`font-semibold text-lg mb-2 ${colorClasses.text} ${colorClasses.darkText}`}>
          {name}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 h-16 overflow-hidden line-clamp-2">
            {description}
          </p>
        )}
        
        {questionCount > 0 && (
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>{questionCount} questions</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubjectCard; 