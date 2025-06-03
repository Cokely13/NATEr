import { useEffect, useState } from "react";
import Link from "next/link";

interface Goal {
  id: number;
  category: string;
  frequency: string;
  targetMinutes: number;
  description?: string;
  currentCompletedStreak: number;
  currentMissedStreak: number;
  longestCompletedStreak: number;
  longestMissedStreak: number;
}

interface Progress {
  id: number;
  goalId: number;
  userId: number;
  date: string;
  minutesCompleted: number;
  completed: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const goalsRes = await fetch(`/api/goals?userId=1&date=${today}`);
      const goalData = await goalsRes.json();
      setGoals(goalData);

      const progRes = await fetch(`/api/progress?userId=1&date=${today}`);
      const progData = await progRes.json();
      setProgresses(progData);

      setLoading(false);
    };
    fetchData();
  }, []);

  console.log("Goals:", goals);

  useEffect(() => {
    const interval = setInterval(() => {
      goals.forEach((goal) => {
        const timer = localStorage.getItem(`goal-${goal.id}-timer`);
        if (!timer) return;

        const parsed = JSON.parse(timer);
        if (!parsed.running || !parsed.startTime) return;

        const elapsedMinutes = Math.floor(
          (Date.now() - parsed.startTime) / 60000
        );
        const progress = progresses.find((p) => p.goalId === goal.id);

        if (
          progress &&
          elapsedMinutes > progress.minutesCompleted &&
          !progress.completed
        ) {
          const minutesCompleted = Math.min(elapsedMinutes, goal.targetMinutes);
          const completed = minutesCompleted >= goal.targetMinutes;

          fetch(`/api/progress/${progress.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ minutesCompleted, completed }),
          });

          setProgresses((prev) =>
            prev.map((p) =>
              p.goalId === goal.id ? { ...p, minutesCompleted, completed } : p
            )
          );

          if (completed) {
            localStorage.removeItem(`goal-${goal.id}-timer`);
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [goals, progresses]);

  const getProgressForGoal = (goalId: number) =>
    progresses.find((p) => p.goalId === goalId);

  const isRunning = (goalId: number) => {
    const saved = localStorage.getItem(`goal-${goalId}-timer`);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return parsed.running;
  };

  const getBorderClass = (goal: Goal) => {
    if (
      goal.currentCompletedStreak > 0 &&
      goal.currentCompletedStreak === goal.longestCompletedStreak
    ) {
      return "border-green-600";
    }
    if (
      goal.currentMissedStreak > 0 &&
      goal.currentMissedStreak === goal.longestMissedStreak
    ) {
      return "border-red-500";
    }
    return "border-gray-300";
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Today's Goals</h1>

      {loading ? (
        <p>Loading...</p>
      ) : goals.length === 0 ? (
        <p>No goals set for today.</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgressForGoal(goal.id);
            const done = progress?.completed;
            const minutes = progress?.minutesCompleted || 0;
            const percent = (minutes / goal.targetMinutes) * 100;

            return (
              <li
                key={goal.id}
                className={`border-2 ${getBorderClass(
                  goal
                )} p-4 rounded shadow`}
              >
                <Link href={`/goal/${goal.id}`} className="block space-y-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{goal.category}</h2>
                    {done && (
                      <span className="text-sm text-green-600 font-bold">
                        ✅ COMPLETED
                      </span>
                    )}
                    {!done && isRunning(goal.id) && (
                      <span className="text-sm text-blue-500 font-medium">
                        ⏱ In Progress
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    ⏱ {goal.targetMinutes} min • {goal.frequency}
                  </p>

                  {goal.description && (
                    <p className="text-sm italic text-gray-500">
                      {goal.description}
                    </p>
                  )}

                  {goal.currentCompletedStreak > 0 && (
                    <p className="text-sm text-green-700 mt-1">
                      🔥 {goal.currentCompletedStreak} day completed streak
                      {goal.currentCompletedStreak ===
                        goal.longestCompletedStreak && " (career high!)"}
                    </p>
                  )}

                  {goal.currentMissedStreak > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      😬 {goal.currentMissedStreak} day missed streak
                      {goal.currentMissedStreak === goal.longestMissedStreak &&
                        " (career high!)"}
                    </p>
                  )}

                  <div className="mt-2">
                    <p className="text-sm">
                      {minutes} / {goal.targetMinutes} minutes
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
