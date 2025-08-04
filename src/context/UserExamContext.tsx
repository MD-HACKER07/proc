import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscribeToActiveExam, ActiveExam } from '../services/examService';

interface UserExamContextType {
  activeExam: ActiveExam | null;
  loading: boolean;
}

const UserExamContext = createContext<UserExamContextType | undefined>(undefined);

export const useUserExam = (): UserExamContextType => {
  const context = useContext(UserExamContext);
  if (!context) {
    throw new Error('useUserExam must be used within a UserExamProvider');
  }
  return context;
};

interface UserExamProviderProps {
  children: ReactNode;
}

export const UserExamProvider: React.FC<UserExamProviderProps> = ({ children }) => {
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveExam((exam) => {
      setActiveExam(exam);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserExamContext.Provider value={{ activeExam, loading }}>
      {children}
    </UserExamContext.Provider>
  );
};

export default UserExamContext;
