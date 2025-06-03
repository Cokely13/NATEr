// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";

// interface Goal {
//   id: number;
//   category: string;
//   targetMinutes: number;
//   description?: string;
// }

// interface Progress {
//   id: number;
//   goalId: number;
//   userId: number;
//   date: string;
//   minutesCompleted: number;
//   completed: boolean;
// }

// export default function GoalTimerPage() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [goal, setGoal] = useState<Goal | null>(null);
//   const [progress, setProgress] = useState<Progress | null>(null);
//   const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
//   const [running, setRunning] = useState(false);

//   const userId = 1;
//   const today = new Date().toISOString().split("T")[0];
//   const storageKey = `goal-${id}-timer`;

//   useEffect(() => {
//     if (!id) return;

//     const fetchData = async () => {
//       const res = await fetch(`/api/goals?userId=${userId}`);
//       const goals = await res.json();
//       const match = goals.find((g: Goal) => g.id === Number(id));
//       setGoal(match);

//       const progRes = await fetch(
//         `/api/progress?userId=${userId}&date=${today}`
//       );
//       const allProgress = await progRes.json();
//       let myProgress = allProgress.find(
//         (p: Progress) => p.goalId === Number(id)
//       );

//       if (!myProgress) {
//         const createRes = await fetch(`/api/progress`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             goalId: Number(id),
//             userId,
//             date: today,
//             minutesCompleted: 0,
//             completed: false,
//           }),
//         });
//         myProgress = await createRes.json();
//       }

//       setProgress(myProgress);

//       if (match) {
//         const saved = localStorage.getItem(storageKey);
//         if (saved) {
//           const parsed = JSON.parse(saved);
//           if (parsed.running && parsed.startTime) {
//             const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
//             const remaining = Math.max(parsed.remainingSeconds - elapsed, 0);
//             setRemainingSeconds(remaining);
//             setRunning(remaining > 0);
//           } else {
//             setRemainingSeconds(
//               parsed.remainingSeconds ?? match.targetMinutes * 60
//             );
//             setRunning(false);
//           }
//         } else {
//           setRemainingSeconds(
//             match.targetMinutes * 60 - (myProgress?.minutesCompleted || 0) * 60
//           );
//         }
//       }
//     };

//     fetchData();
//   }, [id]);

//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     if (running && remainingSeconds !== null && remainingSeconds > 0) {
//       interval = setInterval(() => {
//         setRemainingSeconds((prev) => {
//           if (prev === null) return 0;
//           const next = prev - 1;

//           if (next % 60 === 0 && progress) {
//             const updated = progress.minutesCompleted + 1;
//             fetch(`/api/progress/${progress.id}`, {
//               method: "PUT",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ minutesCompleted: updated }),
//             });
//             setProgress((prev) =>
//               prev ? { ...prev, minutesCompleted: updated } : null
//             );
//           }

//           if (next <= 0 && progress) {
//             fetch(`/api/progress/${progress.id}`, {
//               method: "PUT",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ completed: true }),
//             });
//             setRunning(false);
//             localStorage.removeItem(storageKey);
//           }

//           return next;
//         });
//       }, 1000);
//     }

//     return () => clearInterval(interval);
//   }, [running, remainingSeconds, progress]);

//   const toggle = () => {
//     if (!goal) return;

//     const key = `goal-${goal.id}-timer`;

//     // Pause other timers
//     Object.keys(localStorage).forEach((k) => {
//       if (k.startsWith("goal-") && k.endsWith("-timer") && k !== key) {
//         const data = localStorage.getItem(k);
//         if (data) {
//           const parsed = JSON.parse(data);
//           parsed.running = false;
//           delete parsed.startTime;
//           localStorage.setItem(k, JSON.stringify(parsed));
//         }
//       }
//     });

//     if (!running) {
//       localStorage.setItem(
//         key,
//         JSON.stringify({
//           running: true,
//           startTime: Date.now(),
//           remainingSeconds: remainingSeconds ?? goal.targetMinutes * 60,
//         })
//       );
//     } else {
//       const saved = localStorage.getItem(key);
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         parsed.running = false;
//         parsed.remainingSeconds = remainingSeconds;
//         delete parsed.startTime;
//         localStorage.setItem(key, JSON.stringify(parsed));
//       }
//     }

//     setRunning((prev) => !prev);
//   };

//   const formatTime = (s: number) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${m}:${sec < 10 ? "0" : ""}${sec}`;
//   };

//   const totalMinutes = goal?.targetMinutes || 0;
//   const minutesDone = progress?.minutesCompleted || 0;

//   if (!goal) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-blue-50">
//         <p className="text-gray-600 text-lg">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8">
//       <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
//         <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
//           {goal.category}
//         </h1>
//         {goal.description && (
//           <p className="text-lg text-gray-500 mb-6 italic font-medium">
//             {goal.description}
//           </p>
//         )}

//         {progress?.completed ? (
//           <div className="text-4xl font-semibold text-green-600 my-6">
//             🎉 Goal Completed!
//           </div>
//         ) : (
//           <div className="text-6xl font-mono text-gray-800 mb-6 tracking-wide">
//             {formatTime(remainingSeconds || 0)}
//           </div>
//         )}

//         {!progress?.completed && (
//           <button
//             onClick={toggle}
//             className={`px-6 py-3 rounded-full text-white text-lg font-semibold shadow-md hover:shadow-lg active:scale-95 transition ${
//               running
//                 ? "bg-red-500 hover:bg-red-600"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {running ? "Pause" : "Start"}
//           </button>
//         )}

//         <div className="mt-8">
//           <h2 className="text-base font-semibold text-gray-700 mb-1">
//             Progress
//           </h2>
//           <p className="text-lg font-medium text-gray-800 mb-2">
//             {Math.min(minutesDone, totalMinutes)} / {totalMinutes} minutes
//           </p>
//           <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
//             <div
//               className={`${
//                 progress?.completed ? "bg-green-600" : "bg-green-500"
//               } h-4 transition-all duration-300`}
//               style={{ width: `${(minutesDone / totalMinutes) * 100}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
              parsed.remainingSeconds ??
                match.targetMinutes * 60 -
                  (myProgress?.minutesCompleted || 0) * 60
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

    if (!running) {
      localStorage.setItem(
        key,
        JSON.stringify({
          running: true,
          startTime: Date.now(),
          remainingSeconds:
            remainingSeconds ??
            goal.targetMinutes * 60 - (progress?.minutesCompleted || 0) * 60,
        })
      );
    } else {
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

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
          {goal.category}
        </h1>
        {goal.description && (
          <p className="text-lg text-gray-500 mb-6 italic font-medium">
            {goal.description}
          </p>
        )}

        {progress?.completed ? (
          <div className="text-4xl font-semibold text-green-600 my-6">
            🎉 Goal Completed!
          </div>
        ) : (
          <div className="text-6xl font-mono text-gray-800 mb-6 tracking-wide">
            {formatTime(remainingSeconds || 0)}
          </div>
        )}

        {!progress?.completed && (
          <button
            onClick={toggle}
            className={`px-6 py-3 rounded-full text-white text-lg font-semibold shadow-md hover:shadow-lg active:scale-95 transition ${
              running
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {running ? "Pause" : "Start"}
          </button>
        )}

        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-700 mb-1">
            Progress
          </h2>
          <p className="text-lg font-medium text-gray-800 mb-2">
            {Math.min(minutesDone, totalMinutes)} / {totalMinutes} minutes
          </p>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className={`${
                progress?.completed ? "bg-green-600" : "bg-green-500"
              } h-4 transition-all duration-300`}
              style={{ width: `${(minutesDone / totalMinutes) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
