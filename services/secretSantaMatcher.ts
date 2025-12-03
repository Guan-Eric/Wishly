// services/secretSantaMatcher.ts

import { Assignment, GroupMember } from "../types/index";

export const matchSecretSantas = (members: GroupMember[]): Assignment[] => {
  // Fisher-Yates shuffle with constraint that no one gets themselves
  const shuffled = [...members];
  let matched = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!matched && attempts < maxAttempts) {
    // Shuffle the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Verify no one got themselves
    matched = members.every((member, index) => member.userId !== shuffled[index].userId);
    attempts++;
  }

  if (!matched) {
    throw new Error('Could not generate valid Secret Santa matches. Please try again.');
  }

  // Create assignments
  return members.map((giver, index) => ({
    giverId: giver.userId,
    giverName: giver.name,
    receiverId: shuffled[index].userId,
    receiverName: shuffled[index].name
  }));
};