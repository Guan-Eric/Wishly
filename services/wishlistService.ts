// services/wishlistService.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { WishlistItem } from '../types/index';

/**
 * Add a new item to a user's wishlist
 */
export const addWishlistItem = async (itemData: Partial<WishlistItem>) => {
  try {
    const docRef = await addDoc(collection(db, 'wishlistItems'), {
      ...itemData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding wishlist item:', error);
    throw error;
  }
};

/**
 * Get all wishlist items for a specific user and group (one-time fetch)
 */
export const getWishlistItems = async (userId: string, groupId: string): Promise<WishlistItem[]> => {
  try {
    const q = query(
      collection(db, 'wishlistItems'),
      where('userId', '==', userId),
      where('groupId', '==', groupId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as WishlistItem));
  } catch (error) {
    console.error('Error getting wishlist items:', error);
    throw error;
  }
};

/**
 * Get wishlist items for another user (for viewing their wishlist)
 */
export const getPersonWishlistItems = async (personId: string, groupId: string): Promise<WishlistItem[]> => {
  try {
    const q = query(
      collection(db, 'wishlistItems'),
      where('userId', '==', personId),
      where('groupId', '==', groupId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as WishlistItem));
  } catch (error) {
    console.error('Error getting person wishlist items:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for wishlist items
 */
export const subscribeToWishlistItems = (
  userId: string, 
  groupId: string, 
  callback: (items: WishlistItem[]) => void
) => {
  const q = query(
    collection(db, 'wishlistItems'),
    where('userId', '==', userId),
    where('groupId', '==', groupId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as WishlistItem));
    callback(items);
  }, (error) => {
    console.error('Error in wishlist subscription:', error);
  });

  return unsubscribe;
};

/**
 * Subscribe to real-time updates for another person's wishlist
 */
export const subscribeToPersonWishlist = (
  personId: string,
  groupId: string,
  callback: (items: WishlistItem[]) => void
) => {
  const q = query(
    collection(db, 'wishlistItems'),
    where('userId', '==', personId),
    where('groupId', '==', groupId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as WishlistItem));
    callback(items);
  }, (error) => {
    console.error('Error in person wishlist subscription:', error);
  });

  return unsubscribe;
};

/**
 * Delete a wishlist item
 */
export const deleteWishlistItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'wishlistItems', itemId));
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    throw error;
  }
};

/**
 * Get all wishlist items for a user across all groups
 */
export const getAllUserWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const q = query(
      collection(db, 'wishlistItems'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as WishlistItem));
  } catch (error) {
    console.error('Error getting all user wishlist items:', error);
    throw error;
  }
};

/**
 * Update a wishlist item
 */
export const updateWishlistItem = async (itemId: string, updates: Partial<WishlistItem>): Promise<void> => {
  try {
    const itemRef = doc(db, 'wishlistItems', itemId);
    await updateDoc(itemRef, updates);
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    throw error;
  }
};