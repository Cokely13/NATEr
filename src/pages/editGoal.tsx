"use client";

import { useEffect, useState } from "react";

interface Goal {
  id: number;
  category: string;
  description?: string;
  targetMinutes: number;
  frequency: string;
  date: string | null;
}

export default function EditGoal() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editedGoalId, setEditedGoalId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    [goalId: number]: { targetMinutes: number; description: string };
  }>({});

  const fetchGoals = async () => {
    try {
      const userRes = await fetch("/api/auth/getUser");
      const userData = await userRes.json();
      if (!userData.user) {
        setError("Not authenticated");
        return;
      }

      const userId = userData.user.id;

      const res = await fetch(`/api/goals?userId=${userId}`);
      const data = await res.json();
      setGoals(data);
      const initialForm: typeof formData = {};
      data.forEach((goal: Goal) => {
        initialForm[goal.id] = {
          targetMinutes: goal.targetMinutes,
          description: goal.description || "",
        };
      });
      setFormData(initialForm);
    } catch (err) {
      setError("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleUpdate = async (goalId: number) => {
    try {
      const { targetMinutes, description } = formData[goalId];
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMinutes, description }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditedGoalId(null);
      await fetchGoals();
    } catch (err) {
      alert("Failed to update goal");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading goals...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-4">
          ✏️ Edit Your Goals
        </h1>

        {goals.map((goal) => {
          const isEditing = editedGoalId === goal.id;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl shadow-lg p-6 transition hover:shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {goal.category}
              </h2>

              {isEditing ? (
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                      htmlFor={`target-${goal.id}`}
                      className="font-medium w-40"
                    >
                      🎯 Target Minutes:
                    </label>
                    <input
                      id={`target-${goal.id}`}
                      type="number"
                      value={formData[goal.id]?.targetMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [goal.id]: {
                            ...formData[goal.id],
                            targetMinutes: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-48"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                      htmlFor={`desc-${goal.id}`}
                      className="font-medium w-40"
                    >
                      📝 Description:
                    </label>
                    <input
                      id={`desc-${goal.id}`}
                      type="text"
                      value={formData[goal.id]?.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [goal.id]: {
                            ...formData[goal.id],
                            description: e.target.value,
                          },
                        })
                      }
                      className="border border-gray-300 px-4 py-2 rounded-md w-full"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleUpdate(goal.id)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditedGoalId(null)}
                      className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg text-gray-600 mt-2 italic">
                    {goal.description || "No description"}
                  </p>
                  <p className="text-md text-gray-700 font-medium mt-1">
                    🎯 Target: {goal.targetMinutes} minutes
                  </p>
                  <button
                    onClick={() => setEditedGoalId(goal.id)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
