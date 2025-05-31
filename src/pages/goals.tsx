import { useEffect, useState } from "react";
import Link from "next/link";

interface Goal {
  id: number;
  category: string;
  frequency: string;
  targetMinutes: number;
  description?: string;
  date?: string | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const todayString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch(`/api/goals?userId=1&date=${todayString}`);
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filteredGoals = goals.filter((goal) => {
    if (goal.frequency === "OneTime") {
      return goal.date?.startsWith(today);
    }
    return true; // Show Daily/Weekly regardless of date
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Today's Goals</h1>

      {loading ? (
        <p>Loading goals...</p>
      ) : filteredGoals.length === 0 ? (
        <p>No goals set for today.</p>
      ) : (
        <ul className="space-y-4">
          {filteredGoals.map((goal) => (
            <li
              key={goal.id}
              className="border p-4 rounded shadow hover:bg-gray-50"
            >
              <Link href={`/goal/${goal.id}`} className="block">
                <h2 className="text-xl font-semibold">{goal.category}</h2>
                <p className="text-sm text-gray-600">
                  ⏱ {goal.targetMinutes} min • {goal.frequency}
                </p>
                {goal.description && (
                  <p className="text-sm mt-1">{goal.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
