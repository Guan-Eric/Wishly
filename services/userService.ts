// services/userService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types/index';
  
  export const createUserProfile = async (
    userId: string, 
    email: string, 
    displayName: string
  ): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userData: Omit<User, 'id'> = {
        email,
        displayName,
        createdAt: serverTimestamp() as Timestamp,
      };
      
      await setDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  };
  
  export const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  };
  
  export const updateUserProfile = async (
    userId: string, 
    updates: Partial<User>
  ): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  };
  
  export const searchUsersByEmail = async (email: string): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  };
  
  export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
    try {
      if (userIds.length === 0) return [];
      
      const users: User[] = [];
      
      // Firestore 'in' query limit is 10, so batch if needed
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', 'in', batch));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() } as User);
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error getting users by IDs:', error);
      throw new Error('Failed to get users');
    }
  };