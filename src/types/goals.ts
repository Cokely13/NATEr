// src/types/goals.ts
export type SharedWith = {
  id: number;
  userId: number;
  access: "read" | "edit";
  user: {
    id: number;
    name: string;
  };
};

export interface Goal {
  id: number;
  category: string;
  description?: string | null;
  targetMinutes: number;
  frequency: string;
  currentCompletedStreak: number;
  currentMissedStreak: number;
  longestCompletedStreak: number;
  longestMissedStreak: number;
  sharedWith?: SharedWith[];
}
