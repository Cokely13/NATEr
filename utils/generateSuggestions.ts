// utils/generateSuggestions.ts
import { Goal, GoalProgress } from "@prisma/client";

interface Suggestion {
  goalId: number;
  message: string;
}

export function generateSuggestions(
  goals: Goal[],
  progressMap: Record<number, GoalProgress[]>
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const goal of goals) {
    const entries = progressMap[goal.id] || [];
    if (entries.length < 5) continue; // Not enough data

    const last7 = entries.slice(0, 7); // Most recent 7 entries
    const avgCompletion =
      last7.reduce((sum, p) => sum + p.minutesCompleted, 0) / last7.length;
    const hitRate = last7.filter((p) => p.completed).length / last7.length;

    if (hitRate < 0.4 && avgCompletion < goal.targetMinutes * 0.6) {
      suggestions.push({
        goalId: goal.id,
        message: `You're struggling with "${goal.category}" — consider lowering your target.`,
      });
    } else if (hitRate > 0.8 && avgCompletion > goal.targetMinutes * 1.1) {
      suggestions.push({
        goalId: goal.id,
        message: `You're crushing "${goal.category}" — maybe it's time to increase your goal!`,
      });
    }
  }

  return suggestions;
}
