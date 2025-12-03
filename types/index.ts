// types/index.ts
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp | Date;
}

export interface Occasion {
  // was Group
  id: string;
  name: string;
  budget?: number | null;
  date?: string | null; // was exchangeDate
  createdBy: string;
  type: 'birthday' | 'valentine' | 'anniversary' | 'christmas' | 'other';
  sharedWith: string[]; // was memberIds
  members: OccasionMember[]; // people who can see this list
  createdAt: Timestamp | Date;
  emoji: string;
  accent?: string;
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

export interface OccasionMember {
  userId: string;
  name: string;
  email?: string;
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
