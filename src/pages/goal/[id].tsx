import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Goal {
  id: number;
  category: string;
  targetMinutes: number;
  description?: string;
}

export default function GoalTimerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const storageKey = `goal-${id}`;

  // Fetch goal data
  useEffect(() => {
    if (!id) return;
    const fetchGoal = async () => {
      const res = await fetch(`/api/goals?userId=1`);
      const data = await res.json();
      const match = data.find((g: Goal) => g.id === Number(id));
      setGoal(match);

      // Restore state from localStorage
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        const remaining = Math.max(match.targetMinutes * 60 - elapsed, 0);
        setRemainingSeconds(remaining);
        setRunning(parsed.running && remaining > 0);
      } else if (match) {
        setRemainingSeconds(match.targetMinutes * 60);
      }
    };
    fetchGoal();
  }, [id]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running && remainingSeconds !== null && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return 0;
          const next = prev - 1;
          if (next <= 0) {
            localStorage.removeItem(storageKey);
            setRunning(false);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, remainingSeconds]);

  const toggle = () => {
    const newRunning = !running;
    setRunning(newRunning);
    if (newRunning) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ startTime: Date.now(), running: true })
      );
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const totalMinutes = goal?.targetMinutes || 0;
  const minutesElapsed =
    totalMinutes - Math.floor((remainingSeconds || 0) / 60);

  if (!goal) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">{goal.category}</h1>
      <p className="mb-2">{goal.description}</p>

      <div className="text-5xl font-mono my-8">
        {remainingSeconds === 0
          ? "🎉 Goal completed!"
          : formatTime(remainingSeconds || 0)}
      </div>

      <button
        onClick={toggle}
        className="px-6 py-3 bg-blue-600 text-white rounded text-lg mb-4"
      >
        {running ? "Pause" : "Start"}
      </button>

      <div className="mt-4">
        <h2 className="font-semibold">Progress</h2>
        <p className="text-lg">
          {Math.min(minutesElapsed, totalMinutes)} / {totalMinutes} minutes
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${(minutesElapsed / totalMinutes) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
