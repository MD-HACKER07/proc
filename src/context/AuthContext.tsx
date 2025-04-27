import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

// Create a default value for the AuthContext that matches the expected interface
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => { throw new Error('login function not initialized'); },
  loginWithGoogle: async () => { throw new Error('loginWithGoogle function not initialized'); },
  logout: async () => { throw new Error('logout function not initialized'); },
  isAdmin: false
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.error('Firebase auth is not available');
      setLoading(false);
      setError(new Error('Authentication service is not available'));
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        // For simplicity, we're just checking if user exists to determine admin status
        // In a real app, you would check user claims or a separate admin collection
        setIsAdmin(!!currentUser);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
        setError(error as Error);
      });

      return unsubscribe;
    } catch (err) {
      console.error("Failed to set up auth state listener:", err);
      setLoading(false);
      setError(err as Error);
      return () => {};
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication service is not available');
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Authentication service is not available');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Authentication service is not available');
    }
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    isAdmin
  };

  // If there was an error initializing auth, still render children but with default context
  if (error) {
    console.warn('Rendering with default auth context due to error:', error);
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}; 