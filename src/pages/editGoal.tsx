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
      const res = await fetch("/api/goals?userId=1");
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
      await fetchGoals(); // Refresh data after save
    } catch (err) {
      alert("Failed to update goal");
    }
  };

  if (loading) return <div className="p-8">Loading goals...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Edit Goals</h1>
      {goals.map((goal) => {
        const isEditing = editedGoalId === goal.id;
        return (
          <div key={goal.id} className="border p-4 rounded shadow space-y-2">
            <h2 className="text-xl font-semibold">{goal.category}</h2>
            {isEditing ? (
              <>
                <div className="flex items-center space-x-4">
                  <label htmlFor={`target-${goal.id}`}>Target Minutes:</label>
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
                    className="border px-2 py-1 rounded w-24"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor={`desc-${goal.id}`}>Description:</label>
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
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleUpdate(goal.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditedGoalId(null)}
                    className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700">{goal.description}</p>
                <p className="text-gray-700">
                  Target: {goal.targetMinutes} minutes
                </p>
                <button
                  onClick={() => setEditedGoalId(goal.id)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
