// import { useEffect, useState } from "react";
// import Link from "next/link";

// interface Goal {
//   id: number;
//   category: string;
//   frequency: string;
//   targetMinutes: number;
//   description?: string;
//   date?: string | null;
// }

// export default function GoalsPage() {
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [loading, setLoading] = useState(true);

//   const todayString = new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchGoals = async () => {
//       try {
//         const res = await fetch(`/api/goals?userId=1&date=${todayString}`);
//         const data = await res.json();
//         setGoals(data);
//       } catch (err) {
//         console.error("Failed to fetch goals:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGoals();
//   }, []);

//   const today = new Date().toISOString().split("T")[0];

//   const filteredGoals = goals.filter((goal) => {
//     if (goal.frequency === "OneTime") {
//       return goal.date?.startsWith(today);
//     }
//     return true; // Show Daily/Weekly regardless of date
//   });

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Today's Goals</h1>

//       {loading ? (
//         <p>Loading goals...</p>
//       ) : filteredGoals.length === 0 ? (
//         <p>No goals set for today.</p>
//       ) : (
//         <ul className="space-y-4">
//           {filteredGoals.map((goal) => (
//             <li
//               key={goal.id}
//               className="border p-4 rounded shadow hover:bg-gray-50"
//             >
//               <Link href={`/goal/${goal.id}`} className="block">
//                 <h2 className="text-xl font-semibold">{goal.category}</h2>
//                 <p className="text-sm text-gray-600">
//                   ⏱ {goal.targetMinutes} min • {goal.frequency}
//                 </p>
//                 {goal.description && (
//                   <p className="text-sm mt-1">{goal.description}</p>
//                 )}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}
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

          // Optimistically update UI
          setProgresses((prev) =>
            prev.map((p) =>
              p.goalId === goal.id ? { ...p, minutesCompleted, completed } : p
            )
          );

          // Clean up timer if completed
          if (completed) {
            localStorage.removeItem(`goal-${goal.id}-timer`);
          }
        }
      });
    }, 60000); // check every 60 seconds

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
              <li key={goal.id} className="border p-4 rounded shadow">
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
