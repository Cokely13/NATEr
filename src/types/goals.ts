export interface Goal {
  id: string;
  name: string;
  category: string;
  targetMinutes: number;
  completedMinutes: number;
  description?: string;
  date: string; // ISO string
}
