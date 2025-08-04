import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  createdAt?: Date;
  quizzesTaken?: number;
  averageScore?: number;
  totalScore?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  caste?: string;
  subCaste?: string;
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  lastLogin?: Date;
  nationality?: string;
  gender?: string;
  domicile?: string;
  mobileNumber?: string;
  birthPlace?: string;
  birthCountry?: string;
  birthState?: string;
  birthDistrict?: string;
  primaryEmail?: string;
  alternateEmail?: string;
  bloodGroup?: string;
  abcId?: string;
  prn?: string;
  admissionCategory?: string;
  earningParentName?: string;
  earningParentRelation?: string;
  marks: QuizMark[];
}

interface QuizMark {
  quizId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: Date;
  timeSpent: number;
  released?: boolean; // Flag to indicate if results have been released by admin
}

interface UserAuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  /**
   * Register a new user with email, password, and additional profile data captured from the registration form.
   */
  register: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addQuizMark: (mark: QuizMark) => Promise<void>;
}

const defaultUserAuthContext: UserAuthContextType = {
  user: null,
  userProfile: null,
  loading: true,
  register: async () => { throw new Error('register function not initialized'); },
  login: async () => { throw new Error('login function not initialized'); },
  logout: async () => { throw new Error('logout function not initialized'); },
  updateUserProfile: async () => { throw new Error('updateUserProfile function not initialized'); },
  addQuizMark: async () => { throw new Error('addQuizMark function not initialized'); }
};

const UserAuthContext = createContext<UserAuthContextType>(defaultUserAuthContext);

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

interface UserAuthProviderProps {
  children: ReactNode;
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Store session in Firestore
        try {
          if (db) {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              lastLogin: serverTimestamp(),
              displayName: firebaseUser.displayName || 'User',
            }, { merge: true });
          }
        } catch (err) {
          console.warn('Failed to log session', err);
        }
        await loadUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

      return unsubscribe;
    }
  }, []);

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      let profile: UserProfile | null = null;
      
      // First try to load from Firestore
      if (db) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Firestore timestamps to Date objects
            profile = {
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              lastLogin: new Date()
            } as UserProfile;
            
            // Cache profile locally (per-user key to avoid large aggregated object)
            localStorage.setItem(`userProfile_${firebaseUser.uid}`, JSON.stringify(profile));
          }
        } catch (error) {
          console.error('Error loading from Firestore:', error);
        }
      }
      
      // If not in Firestore, check localStorage (per-user key)
      if (!profile) {
        const stored = localStorage.getItem(`userProfile_${firebaseUser.uid}`);
        profile = stored ? JSON.parse(stored) : null;

        if (profile) {
          // Ensure dates are properly converted from strings to Date objects
          if (typeof profile.createdAt === 'string') {
            profile.createdAt = new Date(profile.createdAt);
          }
          if (typeof profile.lastLogin === 'string') {
            profile.lastLogin = new Date(profile.lastLogin);
          }
          // Update last login
          profile.lastLogin = new Date();
          localStorage.setItem(`userProfile_${firebaseUser.uid}`, JSON.stringify(profile));
        } else {
          // Create new profile if not found
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            lastLogin: new Date(),
            quizzesTaken: 0,
            totalScore: 0,
            averageScore: 0,
            marks: []
          };
          
          // Save to localStorage
          localStorage.setItem(`userProfile_${firebaseUser.uid}`, JSON.stringify(profile));
          
          // Save to Firestore
          if (db) {
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), profile);
            } catch (error) {
              console.error('Error saving to Firestore:', error);
            }
          }
        }
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const register = async (email: string, password: string, userData: any): Promise<User> => {
    try {
      if (!auth) throw new Error('Auth not initialized');
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase Auth
      const displayName = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(' ');
        
      await updateProfile(userCredential.user, {
        displayName: displayName,
        photoURL: userData.photoURL || undefined
      });

      // Create user profile with all provided data
      const profile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName,
        photoURL: userData.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date(),
        quizzesTaken: 0,
        totalScore: 0,
        averageScore: 0,
        marks: [],
        // Add all the additional user data
        ...userData
      };

      // Save to Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), profile);
        } catch (error) {
          console.error('Error saving user profile to Firestore:', error);
          // Continue even if Firestore save fails, as we have the data in auth and localStorage
        }
      }

      // Cache profile locally using per-user key to avoid quota issues
      localStorage.setItem(`userProfile_${userCredential.user.uid}`, JSON.stringify(profile));

      setUserProfile(profile);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      if (!auth) throw new Error('Auth not initialized');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
        quizzesTaken: 0,
        totalScore: 0,
        averageScore: 0,
        marks: [],
      };

      setUserProfile(profile);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (auth) await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const addQuizMark = async (mark: QuizMark): Promise<void> => {
    if (!userProfile) return;
    
    const updatedMarks = [...userProfile.marks, mark];
    const totalScore = updatedMarks.reduce((sum, m) => sum + m.score, 0);
    const totalQuestions = updatedMarks.reduce((sum, m) => sum + m.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    
    setUserProfile({
      ...userProfile,
      marks: updatedMarks,
      quizzesTaken: updatedMarks.length,
      totalScore: totalScore,
      averageScore: averageScore,
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user || !userProfile) return;

    try {
      const updatedProfile = { ...userProfile, ...updates };
      
      // Update in localStorage
      const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      storedProfiles[user.uid] = updatedProfile;
      localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));
      
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
    addQuizMark,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
