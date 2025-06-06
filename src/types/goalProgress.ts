export interface GoalProgress {
  id: number;
  goalId: number;
  userId: number;
  date: string; // ISO string
  minutesCompleted: number;
  completed: boolean;
  targetMinutes: number;
  note?: string | null;
  quality?: number | null;
}
