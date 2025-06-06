import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GoalProgress } from "@/types/goalProgress";

export default function LogGoal() {
  const { user } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/progress");
        const data = await res.json();
        setProgress(data);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, router]);

  if (loading) return <div>Loading...</div>;

  const filteredProgress = progress.filter((p) => !p.note && !p.quality);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Log Goal</h1>

      {filteredProgress.length === 0 ? (
        <p>No goals available to log.</p>
      ) : (
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value="" disabled>
            Select a goal to log
          </option>
          {filteredProgress.map((p) => (
            <option key={p.id} value={p.id}>
              Goal #{p.goalId} on {new Date(p.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
