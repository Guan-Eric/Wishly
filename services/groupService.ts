// services/groupService.ts
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
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Assignment, Group, GroupInvite, GroupMember } from '../types/index';

/**
 * Create a new group
 */
export const createGroup = async (groupData: Partial<Group>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const newGroup = {
      name: groupData.name || '',
      budget: groupData.budget || null,
      exchangeDate: groupData.exchangeDate || null,
      createdBy: userId,
      memberEmails: groupData.memberEmails || [],
      memberIds: [userId],
      members: [{
        userId,
        name: groupData.creatorName || auth.currentUser?.displayName || 'You'
      }] as GroupMember[],
      pendingMemberIds: [],
      matched: false,
      createdAt: serverTimestamp(),
      emoji: ['🎄', '⛄', '🎁', '🔔', '⭐'][Math.floor(Math.random() * 5)],
      accent: ['emerald', 'red', 'amber'][Math.floor(Math.random() * 3)],
      creatorName: groupData.creatorName || auth.currentUser?.displayName || 'You'
    };

    const docRef = await addDoc(collection(db, 'groups'), newGroup);
    return docRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Get all groups for a user (one-time fetch)
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for user's groups
 */
export const subscribeToUserGroups = (
  userId: string,
  callback: (groups: Group[]) => void
) => {
  const q = query(
    collection(db, 'groups'),
    where('memberIds', 'array-contains', userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Group));
    callback(groups);
  }, (error) => {
    console.error('Error in groups subscription:', error);
  }); 

  return unsubscribe;
};

/**
 * Get a single group by ID
 */
export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() } as Group;
    }
    return null;
  } catch (error) {
    console.error('Error getting group by ID:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for a single group
 */
export const subscribeToGroup = (
  groupId: string,
  callback: (group: Group | null) => void
) => {
  const groupRef = doc(db, 'groups', groupId);

  const unsubscribe = onSnapshot(groupRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Group);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in group subscription:', error);
    callback(null);
  });

  return unsubscribe;
};

/**
 * Update group matching with assignments
 */
export const updateGroupMatching = async (
  groupId: string, 
  assignments: Assignment[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'groups', groupId), {
      matched: true,
      assignments,
    });
  } catch (error) {
    console.error('Error updating group matching:', error);
    throw error;
  }
};

/**
 * Update group details
 */
export const updateGroup = async (
  groupId: string,
  updates: Partial<Group>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'groups', groupId), updates);
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

/**
 * Add a member to a group
 */
export const addMemberToGroup = async (
  groupId: string,
  member: GroupMember
): Promise<void> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    const updatedMembers = [...groupData.members, member];
    const updatedMemberIds = [...groupData.memberIds, member.userId];

    await updateDoc(doc(db, 'groups', groupId), {
      members: updatedMembers,
      memberIds: updatedMemberIds,
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    throw error;
  }
};

/**
 * Remove a member from a group
 */
export const removeMemberFromGroup = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data() as Group;
    const updatedMembers = groupData.members.filter(m => m.userId !== userId);
    const updatedMemberIds = groupData.memberIds.filter(id => id !== userId);

    await updateDoc(doc(db, 'groups', groupId), {
      members: updatedMembers,
      memberIds: updatedMemberIds,
    });
  } catch (error) {
    console.error('Error removing member from group:', error);
    throw error;
  }
};

  /**
 * Send an invite to a user
 */
  export const sendGroupInvite = async (
    groupId: string,
    groupName: string,
    groupEmoji: string,
    invitedUserEmail: string,
    invitedUserId: string, // ADD THIS PARAMETER
    invitedByName: string,
    invitedByUserId: string
  ) => {
    try {
      // Create invite
      const inviteData = {
        groupId,
        groupName,
        groupEmoji,
        invitedByName,
        invitedByUserId,
        invitedUserEmail: invitedUserEmail.toLowerCase(),
        invitedUserId, // Store the user ID
        status: 'pending',
        createdAt: serverTimestamp(),
      };
  
      await addDoc(collection(db, 'groupInvites'), inviteData);
      
      // Add user to pendingMemberIds in the group
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        pendingMemberIds: arrayUnion(invitedUserId)
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      throw error;
    }
  };

/**
 * Get pending invites for a user
 */
export const getUserInvites = async (userEmail: string): Promise<GroupInvite[]> => {
  try {
    const q = query(
      collection(db, 'groupInvites'),
      where('invitedUserEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupInvite));
  } catch (error) {
    console.error('Error getting invites:', error);
    throw error;
  }
};

/**
 * Subscribe to user's pending invites
 */
export const subscribeToUserInvites = (
  userEmail: string,
  callback: (invites: GroupInvite[]) => void
) => {
  const q = query(
    collection(db, 'groupInvites'),
    where('invitedUserEmail', '==', userEmail.toLowerCase()),
    where('status', '==', 'pending')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as GroupInvite));
    callback(invites);
  }, (error) => {
    console.error('Error in invites subscription:', error);
  });

  return unsubscribe;
};

/**
 * Accept a group invite
 */
export const acceptGroupInvite = async (
  inviteId: string,
  groupId: string,
  userId: string,
  userName: string,
  userEmail: string
) => {
  try {
    // Update invite status
    await updateDoc(doc(db, 'groupInvites', inviteId), {
      status: 'accepted',
    });

    // Add user to group and remove from pending
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      memberIds: arrayUnion(userId),
      members: arrayUnion({
        userId,
        name: userName,
        email: userEmail,
      }),
      pendingMemberIds: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

/**
 * Decline a group invite
 */
export const declineGroupInvite = async (inviteId: string, groupId: string, userId: string) => {
  try {
    await updateDoc(doc(db, 'groupInvites', inviteId), {
      status: 'declined',
    });
    
    // Remove from pending members
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      pendingMemberIds: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error declining invite:', error);
    throw error;
  }
};