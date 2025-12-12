// services/occasionService.ts - Fixed version with better error handling
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
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
      graduation: '🎓',
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
    console.log('✅ Created occasion:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating occasion:', error);
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
  console.log('🔔 Setting up occasions subscription for user:', userId);

  if (!userId) {
    console.error('❌ Cannot subscribe: userId is null or undefined');
    return () => {};
  }

  try {
    const q = query(collection(db, 'occasions'), where('sharedWith', 'array-contains', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📦 Received occasions update:', snapshot.size, 'documents');
        const occasions = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('  - Occasion:', doc.id, data.name);
          return {
            id: doc.id,
            ...data,
          } as Occasion;
        });
        callback(occasions);
      },
      (error) => {
        console.error('❌ Error in occasions subscription:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Call callback with empty array to prevent app from hanging
        callback([]);
      }
    );

    console.log('✅ Occasions subscription created');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to create occasions subscription:', error);
    return () => {};
  }
};

/**
 * Get a single occasion by ID
 */
export const getOccasionById = async (occasionId: string): Promise<Occasion | null> => {
  try {
    console.log('🔍 Fetching occasion:', occasionId);
    const occasionDoc = await getDoc(doc(db, 'occasions', occasionId));

    if (occasionDoc.exists()) {
      console.log('✅ Found occasion:', occasionDoc.id);
      return { id: occasionDoc.id, ...occasionDoc.data() } as Occasion;
    }

    console.log('⚠️ Occasion not found:', occasionId);
    return null;
  } catch (error) {
    console.error('❌ Error getting occasion by ID:', error);
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
    console.log('📝 Updating occasion:', occasionId);
    await updateDoc(doc(db, 'occasions', occasionId), updates);
    console.log('✅ Occasion updated');
  } catch (error) {
    console.error('❌ Error updating occasion:', error);
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
    console.log('📧 Sending invite to:', invitedUserEmail);

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
    console.log('✅ Invite sent');
  } catch (error) {
    console.error('❌ Error sending invite:', error);
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
  console.log('🔔 Setting up invites subscription for email:', userEmail);

  if (!userEmail) {
    console.error('❌ Cannot subscribe: userEmail is null or undefined');
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'occasionInvites'),
      where('invitedUserEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📨 Received invites update:', snapshot.size, 'documents');
        const invites = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('  - Invite:', doc.id, data.occasionName);
          return {
            id: doc.id,
            ...data,
          } as OccasionInvite;
        });
        callback(invites);
      },
      (error) => {
        console.error('❌ Error in invites subscription:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Call callback with empty array to prevent app from hanging
        callback([]);
      }
    );

    console.log('✅ Invites subscription created');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to create invites subscription:', error);
    return () => {};
  }
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
    console.log('✅ Accepting invite:', inviteId);

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

    console.log('✅ Invite accepted');
  } catch (error) {
    console.error('❌ Error accepting invite:', error);
    throw error;
  }
};

/**
 * Decline an occasion invite
 */
export const declineOccasionInvite = async (inviteId: string) => {
  try {
    console.log('❌ Declining invite:', inviteId);

    await updateDoc(doc(db, 'occasionInvites', inviteId), {
      status: 'declined',
    });

    console.log('✅ Invite declined');
  } catch (error) {
    console.error('❌ Error declining invite:', error);
    throw error;
  }
};
