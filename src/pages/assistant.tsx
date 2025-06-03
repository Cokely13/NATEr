// pages/assistant.tsx
import { useEffect, useState } from "react";

interface Goal {
  id: number;
  category: string;
  targetMinutes: number;
  description?: string;
  frequency: string;
  date: string | null;
}

interface GoalProgress {
  id: number;
  goalId: number;
  userId: number;
  date: string;
  minutesCompleted: number;
  completed: boolean;
  targetMinutes: number;
}

interface Suggestion {
  goalId: number;
  message: string;
}

export default function AssistantPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressEntries, setProgressEntries] = useState<GoalProgress[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [goalsRes, progressRes] = await Promise.all([
        fetch("/api/goals?userId=1"),
        fetch("/api/progress?userId=1"),
      ]);

      const goalsData = await goalsRes.json();
      const progressData = await progressRes.json();

      setGoals(goalsData);
      setProgressEntries(progressData);

      const map: Record<number, GoalProgress[]> = {};
      for (const entry of progressData) {
        if (!map[entry.goalId]) map[entry.goalId] = [];
        map[entry.goalId].push(entry);
      }

      for (const goalId in map) {
        map[goalId].sort((a, b) => b.date.localeCompare(a.date));
      }

      const generated = generateSuggestions(goalsData, map);
      setSuggestions(generated);
    };

    fetchData();
  }, []);

  const generateSuggestions = (
    goals: Goal[],
    progressMap: Record<number, GoalProgress[]>
  ): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    for (const goal of goals) {
      const entries = progressMap[goal.id] || [];
      if (entries.length < 5) continue;

      const last7 = entries.slice(0, 7);
      const avgCompletion =
        last7.reduce((sum, p) => sum + p.minutesCompleted, 0) / last7.length;
      const hitRate = last7.filter((p) => p.completed).length / last7.length;

      if (hitRate < 0.4 && avgCompletion < goal.targetMinutes * 0.6) {
        suggestions.push({
          goalId: goal.id,
          message: `You're struggling with "${goal.category}". Consider lowering your target from ${goal.targetMinutes} minutes.`,
        });
      } else if (hitRate > 0.8 && avgCompletion > goal.targetMinutes * 1.1) {
        suggestions.push({
          goalId: goal.id,
          message: `You're doing great with "${goal.category}". You might consider increasing your target from ${goal.targetMinutes} minutes!`,
        });
      }
    }

    return suggestions;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your AI Assistant</h1>
      {suggestions.length === 0 ? (
        <p className="text-gray-600">
          No personalized suggestions yet. Keep tracking your goals!
        </p>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((sugg, index) => {
            const goal = goals.find((g) => g.id === sugg.goalId);
            return (
              <li
                key={index}
                className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded shadow"
              >
                <h2 className="font-semibold text-lg mb-1">
                  {goal?.category || "Unnamed Goal"}
                </h2>
                <p className="text-gray-800">{sugg.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
