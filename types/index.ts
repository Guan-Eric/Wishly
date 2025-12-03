// types/index.ts
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp | Date;
}

export interface Group {
  id: string;
  name: string;
  budget?: number | null;
  exchangeDate?: string | null;
  createdBy: string;
  memberEmails: string[];
  memberIds: string[];
  members: GroupMember[];
  pendingMemberIds: string[];
  matched: boolean;
  assignments?: Assignment[];
  createdAt: Timestamp | Date;
  emoji: string;
  colors?: string[];
  accent?: string;
  creatorName: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  groupEmoji: string;
  invitedByName: string;
  invitedByUserId: string;
  invitedUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp | Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  email?: string;
}

export interface Assignment {
  giverId: string;
  giverName: string;
  receiverId: string;
  receiverName: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  groupId: string;
  productName: string;
  productUrl: string;
  productImage?: string;
  price?: string;
  asin?: string;
  notes?: string;
  emoji?: string;
  createdAt: Timestamp | Date;
}

export interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  price: string;
  image: string | null;
  url: string;
  affiliateUrl: string;
  rating?: number;
  reviewCount?: number;
}