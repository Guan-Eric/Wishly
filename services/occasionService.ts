// services/occasionService.ts (renamed from groupService.ts)
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Occasion, OccasionInvite, OccasionMember } from '../types/index';

/**
 * Create a new occasion/wishlist
 */
export const createOccasion = async (occasionData: Partial<Occasion>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    // Emoji mapping for occasion types
    const emojiMap = {
      birthday: '🎂',
      valentine: '💝',
      anniversary: '💐',
      christmas: '🎄',
      wedding: '💍',
      other: '🎁',
    };

    const newOccasion = {
      name: occasionData.name || '',
      budget: occasionData.budget || null,
      date: occasionData.date || null,
      type: occasionData.type || 'other',
      createdBy: userId,
      sharedWith: [userId],
      members: [
        {
          userId,
          name: occasionData.creatorName || auth.currentUser?.displayName || 'You',
        },
      ] as OccasionMember[],
      createdAt: serverTimestamp(),
      emoji: emojiMap[occasionData.type as keyof typeof emojiMap] || '🎁',
      accent: ['primary', 'secondary', 'accent'][Math.floor(Math.random() * 3)],
      creatorName: occasionData.creatorName || auth.currentUser?.displayName || 'You',
      isPrivate: occasionData.isPrivate ?? false,
    };

    const docRef = await addDoc(collection(db, 'occasions'), newOccasion);
    return docRef.id;
  } catch (error) {
    console.error('Error creating occasion:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for user's occasions
 */
export const subscribeToUserOccasions = (
  userId: string,
  callback: (occasions: Occasion[]) => void
) => {
  const q = query(collection(db, 'occasions'), where('sharedWith', 'array-contains', userId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const occasions = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Occasion
      );
      callback(occasions);
    },
    (error) => {
      console.error('Error in occasions subscription:', error);
    }
  );

  return unsubscribe;
};

/**
 * Get a single occasion by ID
 */
export const getOccasionById = async (occasionId: string): Promise<Occasion | null> => {
  try {
    const occasionDoc = await getDoc(doc(db, 'occasions', occasionId));
    if (occasionDoc.exists()) {
      return { id: occasionDoc.id, ...occasionDoc.data() } as Occasion;
    }
    return null;
  } catch (error) {
    console.error('Error getting occasion by ID:', error);
    throw error;
  }
};

/**
 * Update occasion details
 */
export const updateOccasion = async (
  occasionId: string,
  updates: Partial<Occasion>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'occasions', occasionId), updates);
  } catch (error) {
    console.error('Error updating occasion:', error);
    throw error;
  }
};

/**
 * Send an invite to view wishlist
 */
export const sendOccasionInvite = async (
  occasionId: string,
  occasionName: string,
  occasionEmoji: string,
  invitedUserEmail: string,
  invitedUserId: string,
  invitedByName: string,
  invitedByUserId: string
) => {
  try {
    const inviteData = {
      occasionId,
      occasionName,
      occasionEmoji,
      invitedByName,
      invitedByUserId,
      invitedUserEmail: invitedUserEmail.toLowerCase(),
      invitedUserId,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'occasionInvites'), inviteData);
  } catch (error) {
    console.error('Error sending invite:', error);
    throw error;
  }
};

/**
 * Subscribe to user's pending invites
 */
export const subscribeToUserInvites = (
  userEmail: string,
  callback: (invites: OccasionInvite[]) => void
) => {
  const q = query(
    collection(db, 'occasionInvites'),
    where('invitedUserEmail', '==', userEmail.toLowerCase()),
    where('status', '==', 'pending')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const invites = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as OccasionInvite
      );
      callback(invites);
    },
    (error) => {
      console.error('Error in invites subscription:', error);
    }
  );

  return unsubscribe;
};

/**
 * Accept an occasion invite
 */
export const acceptOccasionInvite = async (
  inviteId: string,
  occasionId: string,
  userId: string,
  userName: string,
  userEmail: string
) => {
  try {
    await updateDoc(doc(db, 'occasionInvites', inviteId), {
      status: 'accepted',
    });

    const occasionRef = doc(db, 'occasions', occasionId);
    await updateDoc(occasionRef, {
      sharedWith: arrayUnion(userId),
      members: arrayUnion({
        userId,
        name: userName,
        email: userEmail,
      }),
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

/**
 * Decline an occasion invite
 */
export const declineOccasionInvite = async (inviteId: string) => {
  try {
    await updateDoc(doc(db, 'occasionInvites', inviteId), {
      status: 'declined',
    });
  } catch (error) {
    console.error('Error declining invite:', error);
    throw error;
  }
};
