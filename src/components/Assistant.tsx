"use client";

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

export default function Assistant() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [goalsRes, progressRes] = await Promise.all([
          fetch("/api/goals?userId=1"),
          fetch("/api/progress?userId=1"),
        ]);

        const goalsData = await goalsRes.json();
        const progressData = await progressRes.json();
        setGoals(goalsData);

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
      } catch (err) {
        console.error("Error generating suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
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
    <div className="mt-16 px-6 py-8 bg-white rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        🤖 NATEr's Personalized Suggestions
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">
          Generating suggestions...
        </p>
      ) : suggestions.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No suggestions at the moment. Keep up the good work!
        </p>
      ) : (
        <ul className="space-y-4 text-gray-800 text-lg">
          {suggestions.map((sugg, idx) => {
            const goal = goals.find((g) => g.id === sugg.goalId);
            return (
              <li
                key={idx}
                className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-md"
              >
                <a
                  href={`/editGoal#goal-${sugg.goalId}`}
                  className="block hover:underline text-blue-700 font-semibold mb-1"
                >
                  {goal?.category || "Unnamed Goal"}:
                  <span className="text-gray-800">{sugg.message}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
