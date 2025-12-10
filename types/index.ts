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
  // Renamed from Group
  id: string;
  name: string;
  budget?: number | null;
  date?: string | null;
  type: 'birthday' | 'valentine' | 'anniversary' | 'wedding' | 'graduation' | 'other';
  createdBy: string;
  sharedWith: string[]; // renamed from memberIds
  members: OccasionMember[];
  createdAt: Timestamp | Date;
  emoji: string;
  accent?: string;
  creatorName: string;
  isPrivate: boolean; // New: whether wishlist is private
}

export interface OccasionInvite {
  // Renamed from GroupInvite
  id: string;
  occasionId: string;
  occasionName: string;
  occasionEmoji: string;
  invitedByName: string;
  invitedByUserId: string;
  invitedUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp | Date;
}

export interface OccasionMember {
  // Renamed from GroupMember
  userId: string;
  name: string;
  email?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  occasionId: string; // renamed from groupId
  productName: string;
  productUrl: string;
  productImage?: string;
  price?: string;
  asin?: string;
  notes?: string;
  emoji?: string;
  priority?: 1 | 2 | 3; // New: item priority
  createdAt: Timestamp | Date;
  isPurchased?: boolean;
  purchasedBy?: string; // userId of who marked it as purchased
  purchasedByName?: string; // Display name of purchaser
  purchasedAt?: Timestamp | Date;
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
