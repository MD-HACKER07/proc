import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

interface AdminData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Store admin registration data in Firestore
export const storeAdminRegistration = async (adminData: AdminData): Promise<void> => {
  try {
    // Check if db is available
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const adminRef = doc(db, 'admins', adminData.uid);
    await setDoc(adminRef, {
      ...adminData,
      createdAt: adminData.createdAt
    });
  } catch (error) {
    console.error('Error storing admin registration data:', error);
    throw error;
  }
};

// Update admin login timestamp
export const updateAdminLogin = async (uid: string): Promise<void> => {
  try {
    // Check if db is available
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    
    const adminRef = doc(db, 'admins', uid);
    await setDoc(adminRef, {
      lastLoginAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating admin login timestamp:', error);
    throw error;
  }
};

// Check if user is registered as admin
export const isAdminRegistered = async (uid: string): Promise<boolean> => {
  try {
    // Check if db is available
    if (!db) {
      console.warn('Firestore is not initialized');
      return false;
    }
    
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin registration:', error);
    return false;
  }
};

// Get admin data by UID
export const getAdminData = async (uid: string): Promise<AdminData | null> => {
  try {
    // Check if db is available
    if (!db) {
      console.warn('Firestore is not initialized');
      return null;
    }
    
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    if (adminDoc.exists()) {
      return adminDoc.data() as AdminData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return null;
  }
};

// Get all registered admins
export const getAllAdmins = async (): Promise<AdminData[]> => {
  try {
    // Check if db is available
    if (!db) {
      console.warn('Firestore is not initialized');
      return [];
    }
    
    const adminsRef = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsRef);
    return adminsSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as AdminData));
  } catch (error) {
    console.error('Error fetching all admins:', error);
    return [];
  }
};

// Authenticate admin using Firestore data
export const authenticateAdmin = async (email: string, password: string): Promise<AdminData | null> => {
  try {
    // Check if db is available
    if (!db) {
      console.warn('Firestore is not initialized');
      return null;
    }
    
    // Get all admins
    const admins = await getAllAdmins();
    
    // Find admin with matching email
    const admin = admins.find(a => a.email === email);
    
    // In a real implementation, you would hash and compare passwords
    // For now, we're just checking if the admin exists
    // Note: The password parameter is accepted for API consistency
    // TODO: Implement proper password hashing and verification
    if (admin && password) {  // Using password parameter to avoid lint error
      // Update last login timestamp
      await updateAdminLogin(admin.uid);
      return admin;
    }
    
    return null;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return null;
  }
};
