export const CATEGORIES = [
  "Coding",
  "Study",
  "Work",
  "Reading",
  "Exercise",
  "Music",
  "Cleaning",
  "Stretching",
  "Walk",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
