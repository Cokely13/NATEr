// import { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";

// interface Progress {
//   id: number;
//   goalId: number;
//   userId: number;
//   date: string;
//   minutesCompleted: number;
//   completed: boolean;
//   targetMinutes: number;
// }

// interface Goal {
//   id: number;
//   category: string;
//   description?: string;
//   targetMinutes: number;
//   frequency: string;
//   date: string | null;
//   longestCompletedStreak: number;
//   longestMissedStreak: number;
// }

// const COLORS = ["#00C49F", "#FF8042"];

// export default function History() {
//   const [progress, setProgress] = useState<Progress[]>([]);
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [streaks, setStreaks] = useState<Streak[]>([]);
//   const [dailyTotals, setDailyTotals] = useState<any[]>([]);
//   const [goalTrends, setGoalTrends] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       const [progressRes, goalsRes] = await Promise.all([
//         fetch("/api/progress?userId=1"),
//         fetch("/api/goals?userId=1"),
//       ]);
//       const progressData = await progressRes.json();
//       console.log("Progress Data:", progressData);
//       const goalsData = await goalsRes.json();
//       setProgress(progressData);
//       setGoals(goalsData);

//       const streaksByCategory: {
//         [category: string]: { longestCompleted: number; longestMissed: number };
//       } = {};

//       for (const goal of goalsData) {
//         const cat = goal.category;
//         if (!streaksByCategory[cat]) {
//           streaksByCategory[cat] = {
//             longestCompleted: goal.longestCompletedStreak || 0,
//             longestMissed: goal.longestMissedStreak || 0,
//           };
//         } else {
//           streaksByCategory[cat].longestCompleted = Math.max(
//             streaksByCategory[cat].longestCompleted,
//             goal.longestCompletedStreak || 0
//           );
//           streaksByCategory[cat].longestMissed = Math.max(
//             streaksByCategory[cat].longestMissed,
//             goal.longestMissedStreak || 0
//           );
//         }
//       }

//       setStreaks(streaksByCategory);

//       // ✅ Daily Totals: completed + target
//       const totals: { [date: string]: { completed: number; target: number } } =
//         {};
//       for (const entry of progressData) {
//         const dateOnly = entry.date.split("T")[0];
//         if (!totals[dateOnly]) totals[dateOnly] = { completed: 0, target: 0 };
//         totals[dateOnly].completed += entry.minutesCompleted;
//         totals[dateOnly].target += entry.targetMinutes;
//       }

//       const formattedTotals = Object.entries(totals)
//         .sort(([a], [b]) => a.localeCompare(b))
//         .map(([date, { completed, target }]) => ({
//           date,
//           Completed: completed,
//           Remaining: Math.max(target - completed, 0),
//         }));

//       setDailyTotals(formattedTotals);

//       // ✅ Line Chart per goal
//       const trends: {
//         [goalId: number]: {
//           [date: string]: { completed: number; target: number };
//         };
//       } = {};
//       for (const entry of progressData) {
//         const dateOnly = entry.date.split("T")[0];
//         if (!trends[entry.goalId]) trends[entry.goalId] = {};
//         trends[entry.goalId][dateOnly] = {
//           completed: entry.minutesCompleted,
//           target: entry.targetMinutes,
//         };
//       }

//       const allDates = Array.from(
//         new Set(progressData.map((p) => p.date.split("T")[0]))
//       ).sort();

//       const structuredTrends = Object.entries(trends).map(([goalId, data]) => {
//         const goal = goalsData.find((g: Goal) => g.id === Number(goalId));
//         return {
//           name: goal?.category || "Unknown",
//           data: allDates.map((date) => ({
//             date,
//             minutesCompleted: data[date]?.completed ?? 0,
//             target: data[date]?.target ?? 0,
//           })),
//         };
//       });

//       setGoalTrends(structuredTrends);
//     };

//     loadData();
//   }, []);

//   const filteredProgress = selectedCategory
//     ? progress.filter((p) => {
//         const goal = goals.find((g) => g.id === p.goalId);
//         return goal?.category === selectedCategory;
//       })
//     : progress;

//   const filteredGoals = selectedCategory
//     ? goals.filter((g) => g.category === selectedCategory)
//     : goals;

//   const categories = Array.from(new Set(goals.map((g) => g.category)));

//   // ✅ Pie Chart Completion
//   const totalMinutesCompleted = filteredProgress.reduce(
//     (sum, p) => sum + p.minutesCompleted,
//     0
//   );
//   const totalTargetMinutes = filteredProgress.reduce(
//     (sum, p) => sum + p.targetMinutes,
//     0
//   );

//   const completionPercent = totalTargetMinutes
//     ? Math.min(
//         Math.round((totalMinutesCompleted / totalTargetMinutes) * 100),
//         100
//       )
//     : 0;

//   const percentData = [
//     { name: "Completed", value: completionPercent },
//     { name: "Remaining", value: 100 - completionPercent },
//   ];

//   return (
//     <div className="p-8 space-y-12">
//       <h1 className="text-3xl font-bold">History</h1>
//       <section>
//         <h2 className="text-xl font-semibold mb-2">
//           Longest Streaks by Category
//         </h2>
//         <ul className="list-disc pl-6">
//           {Object.entries(streaks).map(
//             ([cat, { longestCompleted, longestMissed }]) => (
//               <li key={cat} className="mb-1">
//                 <span className="font-semibold">{cat}</span>: 🔥{" "}
//                 {longestCompleted} day completed streak, 😬 {longestMissed} day
//                 missed streak
//               </li>
//             )
//           )}
//         </ul>
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Daily Minutes Completed</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={dailyTotals} stackOffset="sign">
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="Completed" fill="#3182ce" stackId="a" />
//             <Bar dataKey="Remaining" fill="#ff6361" stackId="a" />
//           </BarChart>
//         </ResponsiveContainer>
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Goal Completion %</h2>
//         <select
//           className="mb-4 border px-2 py-1 rounded"
//           value={selectedCategory || ""}
//           onChange={(e) => setSelectedCategory(e.target.value || null)}
//         >
//           <option value="">All Categories</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//         <ResponsiveContainer width="100%" height={250}>
//           <PieChart>
//             <Pie
//               dataKey="value"
//               data={percentData}
//               cx="50%"
//               cy="50%"
//               outerRadius={80}
//               fill="#8884d8"
//               label={(entry) => `${entry.name}: ${entry.value}%`}
//             >
//               {percentData.map((_, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Per Goal Trend</h2>
//         {goalTrends.map((goal) => (
//           <div key={goal.name} className="mb-6">
//             <h3 className="font-semibold mb-1">{goal.name}</h3>
//             <ResponsiveContainer width="100%" height={200}>
//               <LineChart data={goal.data}>
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="minutesCompleted"
//                   stroke="#82ca9d"
//                   name="Completed"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="target"
//                   stroke="#ff7300"
//                   name="Target"
//                   strokeDasharray="5 5"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         ))}
//       </section>
//     </div>
//   );
// }

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
          🎯 Today's Goals
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
