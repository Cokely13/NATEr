import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Goal {
  id: number;
  category: string;
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

export default function GoalTimerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const userId = 1;
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `goal-${id}-timer`;

  // Fetch goal and progress data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await fetch(`/api/goals?userId=${userId}`);
      const goals = await res.json();
      const match = goals.find((g: Goal) => g.id === Number(id));
      setGoal(match);

      const progRes = await fetch(
        `/api/progress?userId=${userId}&date=${today}`
      );
      const allProgress = await progRes.json();
      let myProgress = allProgress.find(
        (p: Progress) => p.goalId === Number(id)
      );

      if (!myProgress) {
        const createRes = await fetch(`/api/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalId: Number(id),
            userId,
            date: today,
            minutesCompleted: 0,
            completed: false,
          }),
        });
        myProgress = await createRes.json();
      }

      setProgress(myProgress);

      if (match) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.running && parsed.startTime) {
            const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
            const remaining = Math.max(parsed.remainingSeconds - elapsed, 0);
            setRemainingSeconds(remaining);
            setRunning(remaining > 0);
          } else {
            setRemainingSeconds(
              parsed.remainingSeconds ?? match.targetMinutes * 60
            );
            setRunning(false);
          }
        } else {
          setRemainingSeconds(
            match.targetMinutes * 60 - (myProgress?.minutesCompleted || 0) * 60
          );
        }
      }
    };

    fetchData();
  }, [id]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running && remainingSeconds !== null && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return 0;
          const next = prev - 1;

          if (next % 60 === 0 && progress) {
            const updated = progress.minutesCompleted + 1;
            fetch(`/api/progress/${progress.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutesCompleted: updated }),
            });
            setProgress((prev) =>
              prev ? { ...prev, minutesCompleted: updated } : null
            );
          }

          if (next <= 0 && progress) {
            fetch(`/api/progress/${progress.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ completed: true }),
            });
            setRunning(false);
            localStorage.removeItem(storageKey);
          }

          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running, remainingSeconds, progress]);

  const toggle = () => {
    if (!goal) return;
    const key = `goal-${goal.id}-timer`;

    if (!running) {
      // Pause other timers
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("goal-") && k.endsWith("-timer") && k !== key) {
          const data = localStorage.getItem(k);
          if (data) {
            const parsed = JSON.parse(data);
            parsed.running = false;
            delete parsed.startTime;
            localStorage.setItem(k, JSON.stringify(parsed));
          }
        }
      });

      // Start current
      localStorage.setItem(
        key,
        JSON.stringify({
          running: true,
          startTime: Date.now(),
          remainingSeconds: remainingSeconds ?? goal.targetMinutes * 60,
        })
      );
    } else {
      // Pause
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.running = false;
        parsed.remainingSeconds = remainingSeconds;
        delete parsed.startTime;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }

    setRunning((prev) => !prev);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const totalMinutes = goal?.targetMinutes || 0;
  const minutesDone = progress?.minutesCompleted || 0;

  if (!goal) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">{goal.category}</h1>
      <p className="mb-2">{goal.description}</p>

      {progress?.completed ? (
        <div className="text-3xl font-semibold my-8 text-green-700">
          🎉 Goal completed!
        </div>
      ) : (
        <div className="text-5xl font-mono my-8">
          {formatTime(remainingSeconds || 0)}
        </div>
      )}

      {!progress?.completed && (
        <button
          onClick={toggle}
          className="px-6 py-3 bg-blue-600 text-white rounded text-lg mb-4"
        >
          {running ? "Pause" : "Start"}
        </button>
      )}

      <div className="mt-4">
        <h2 className="font-semibold">Progress</h2>
        <p className="text-lg">
          {Math.min(minutesDone, totalMinutes)} / {totalMinutes} minutes
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300"
            style={{
              width: `${(minutesDone / totalMinutes) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
