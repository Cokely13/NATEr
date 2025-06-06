"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { Goal } from "@/types/goals";
import { GoalProgress } from "@/types/goalProgress";

const categoryIcons: Record<string, string> = {
  Coding: "💻",
  Study: "📚",
  Work: "🧑‍💼",
  Reading: "📖",
  Exercise: "🏋️",
  Walk: "🚶",
  Other: "🎯",
};

export default function GoalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progresses, setProgresses] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      const goalsRes = await fetch(
        `/api/goals?userId=${user.id}&date=${today}`
      );
      const goalData = await goalsRes.json();
      setGoals(goalData);

      const progRes = await fetch(
        `/api/progress?userId=${user.id}&date=${today}`
      );
      const progData = await progRes.json();
      setProgresses(progData);

      setLoading(false);
    };

    fetchData();
  }, [user, today]);

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
    return "border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-10 text-center">
          🎯 Today&rsquo;s Goals
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-600">No goals set for today.</p>
        ) : (
          <ul className="space-y-8">
            {goals.map((goal) => {
              const progress = getProgressForGoal(goal.id);
              const done = progress?.completed;
              const minutes = progress?.minutesCompleted || 0;
              const percent = (minutes / goal.targetMinutes) * 100;

              return (
                <li
                  key={goal.id}
                  className={`border-4 ${getBorderClass(
                    goal
                  )} bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition`}
                >
                  <Link href={`/goal/${goal.id}`} className="block space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
                          <span>{categoryIcons[goal.category] || "🔖"}</span>
                          {goal.category}
                        </h2>
                        <p className="text-lg text-gray-600 font-semibold">
                          ⏱ {goal.targetMinutes} min • {goal.frequency}
                        </p>
                        {goal.description && (
                          <p className="text-md italic text-gray-500">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {done && (
                          <span className="text-green-600 font-bold text-md">
                            ✅ Done
                          </span>
                        )}
                        {!done && isRunning(goal.id) && (
                          <span className="text-blue-600 font-semibold text-md">
                            ⏱ In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {(goal.currentCompletedStreak > 0 ||
                      goal.currentMissedStreak > 0) && (
                      <div className="text-base space-y-1">
                        {goal.currentCompletedStreak > 0 && (
                          <p className="text-green-700 font-semibold">
                            🔥 {goal.currentCompletedStreak} day streak
                            {goal.currentCompletedStreak ===
                              goal.longestCompletedStreak && " (career high!)"}
                          </p>
                        )}
                        {goal.currentMissedStreak > 0 && (
                          <p className="text-red-600 font-semibold">
                            😬 {goal.currentMissedStreak} day missed streak
                            {goal.currentMissedStreak ===
                              goal.longestMissedStreak && " (career high!)"}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {minutes} / {goal.targetMinutes} minutes
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                        <div
                          className={`${
                            done ? "bg-green-600" : "bg-green-500"
                          } h-4 rounded-full transition-all`}
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
    </div>
  );
}
