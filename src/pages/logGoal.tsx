// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import { GoalProgress } from "@/types/goalProgress";
// import { Goal } from "@/types/goals";

// export default function LogGoal() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [progress, setProgress] = useState<GoalProgress[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [note, setNote] = useState("");
// const [quality, setQuality] = useState<number | null>(null);
//   useEffect(() => {
//     if (!user) {
//       router.push("/login");
//     }

//     const fetchProgress = async () => {
//       try {
//         const res = await fetch("/api/progress");
//         const data = await res.json();
//         setProgress(data);
//       } catch (err) {
//         console.error("Failed to fetch progress:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchGoal = async () => {
//       try {
//         const res = await fetch("/api/goals");
//         const data = await res.json();
//         setGoals(data);
//       } catch (err) {
//         console.error("Failed to fetch goals:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgress();
//     fetchGoal();
//   }, [user, router]);

//   if (loading) return <div>Loading...</div>;

//   const filteredProgress = progress.filter((p) => !p.note && !p.quality);

//   console.log("Filtered Progress:", filteredProgress);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Log Goal</h1>

//       {filteredProgress.length === 0 ? (
//         <p>No goals available to log.</p>
//       ) : (
//         <select
//           value={selectedId ?? ""}
//           onChange={(e) => setSelectedId(Number(e.target.value))}
//           className="border p-2 rounded"
//         >
//           <option value="" disabled>
//             Select a goal to log
//           </option>
//           {filteredProgress.map((p) => {
//             const goal = goals.find((g) => g.id === p.goalId);
//             return (
//               <option key={p.id} value={p.id}>
//                 {goal?.category || "Unknown Goal"} on{" "}
//                 {new Date(p.date).toLocaleDateString()}
//               </option>
//             );
//           })}
//         </select>
//         {selectedId && (
//   <div className="mt-4 space-y-4">
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Note
//       </label>
//       <textarea
//         className="w-full border rounded p-2"
//         rows={3}
//         placeholder="Write a note about this goal..."
//         // add your state handler here
//       />
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Quality (1–10)
//       </label>
//       <select
//         className="w-full border rounded p-2"
//         defaultValue=""
//         // add your state handler here
//       >
//         <option value="" disabled>
//           Select quality
//         </option>
//         {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
//           <option key={num} value={num}>
//             {num}
//           </option>
//         ))}
//       </select>
//     </div>
//   </div>
//   <textarea
//   className="w-full border rounded p-2"
//   rows={3}
//   value={note}
//   onChange={(e) => setNote(e.target.value)}
//   placeholder="Write a note about this goal..."
// />

// <select
//   className="w-full border rounded p-2"
//   value={quality ?? ""}
//   onChange={(e) => setQuality(Number(e.target.value))}
// >
//   <option value="" disabled>Select quality</option>
//   {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
//     <option key={num} value={num}>{num}</option>
//   ))}
// </select>
// )}
//     </div>
//   );
// }

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GoalProgress } from "@/types/goalProgress";
import { Goal } from "@/types/goals";

export default function LogGoal() {
  const { user } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [quality, setQuality] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [progressRes, goalsRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/goals"),
        ]);
        const progressData = await progressRes.json();
        const goalsData = await goalsRes.json();
        setProgress(progressData);
        setGoals(goalsData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) return <div>Loading...</div>;

  const filteredProgress = progress.filter((p) => !p.note && !p.quality);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Log Goal</h1>

      {filteredProgress.length === 0 ? (
        <p>No goals available to log.</p>
      ) : (
        <>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="" disabled>
              Select a goal to log
            </option>
            {filteredProgress.map((p) => {
              const goal = goals.find((g) => g.id === p.goalId);
              return (
                <option key={p.id} value={p.id}>
                  {goal?.category || "Unknown Goal"} on{" "}
                  {new Date(p.date).toLocaleDateString()}
                </option>
              );
            })}
          </select>

          {selectedId && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a note about this goal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality (1–10)
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={quality ?? ""}
                  onChange={(e) => setQuality(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Select quality
                  </option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
