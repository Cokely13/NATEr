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
// }

// interface Goal {
//   id: number;
//   category: string;
//   description?: string;
//   targetMinutes: number;
//   frequency: string;
//   date: string | null;
// }

// const COLORS = ["#00C49F", "#FF8042"];

// export default function History() {
//   const [progress, setProgress] = useState<Progress[]>([]);
//   const [goals, setGoals] = useState<Goal[]>([]);
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
//       const goalsData = await goalsRes.json();
//       setProgress(progressData);
//       setGoals(goalsData);

//       // Daily total minutes completed
//       const totals: { [date: string]: number } = {};
//       for (const entry of progressData) {
//         const dateOnly = entry.date.split("T")[0];
//         totals[dateOnly] = (totals[dateOnly] || 0) + entry.minutesCompleted;
//       }
//       setDailyTotals(
//         Object.entries(totals)
//           .sort(([a], [b]) => a.localeCompare(b))
//           .map(([date, total]) => ({ date, total }))
//       );

//       // Per-goal trend over time
//       const trends: { [goalId: number]: { [date: string]: number } } = {};
//       const targets: { [goalId: number]: number } = {};
//       for (const entry of progressData) {
//         const dateOnly = entry.date.split("T")[0];
//         if (!trends[entry.goalId]) trends[entry.goalId] = {};
//         trends[entry.goalId][dateOnly] = entry.minutesCompleted;
//       }
//       goalsData.forEach((goal: Goal) => {
//         targets[goal.id] = goal.targetMinutes;
//       });
//       const allDates = Array.from(
//         new Set(progressData.map((p) => p.date.split("T")[0]))
//       ).sort();
//       const structuredTrends = Object.entries(trends).map(([goalId, data]) => {
//         const goal = goalsData.find((g: Goal) => g.id === Number(goalId));
//         return {
//           name: goal?.category || "Unknown",
//           data: allDates.map((date) => ({
//             date,
//             minutesCompleted: data[date] || 0,
//             target: targets[Number(goalId)] || 0,
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

//   const percentData = (() => {
//     const categoryMap: Record<string, { completed: number; expected: number }> =
//       {};

//     for (const goal of filteredGoals) {
//       const progressForGoal = filteredProgress.filter(
//         (p) => p.goalId === goal.id
//       );

//       const totalCompleted = progressForGoal.reduce(
//         (sum, p) => sum + p.minutesCompleted,
//         0
//       );

//       const days = new Set(progressForGoal.map((p) => p.date)).size;
//       const expectedTotal = goal.targetMinutes * days;

//       if (!categoryMap[goal.category]) {
//         categoryMap[goal.category] = { completed: 0, expected: 0 };
//       }

//       categoryMap[goal.category].completed += totalCompleted;
//       categoryMap[goal.category].expected += expectedTotal;
//     }

//     return Object.entries(categoryMap).map(
//       ([category, { completed, expected }]) => ({
//         name: category,
//         value: expected > 0 ? Math.round((completed / expected) * 100) : 0,
//       })
//     );
//   })();

//   const categories = Array.from(new Set(goals.map((g) => g.category)));

//   return (
//     <div className="p-8 space-y-12">
//       <h1 className="text-3xl font-bold">History</h1>

//       <section>
//         <h2 className="text-xl font-semibold mb-2">Daily Minutes Completed</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={dailyTotals}>
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="total" fill="#3182ce" />
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Progress {
  id: number;
  goalId: number;
  userId: number;
  date: string;
  minutesCompleted: number;
  completed: boolean;
}

interface Goal {
  id: number;
  category: string;
  description?: string;
  targetMinutes: number;
  frequency: string;
  date: string | null;
}

const COLORS = ["#00C49F", "#FF8042"];

export default function History() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<any[]>([]);
  const [goalTrends, setGoalTrends] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [progressRes, goalsRes] = await Promise.all([
        fetch("/api/progress?userId=1"),
        fetch("/api/goals?userId=1"),
      ]);
      const progressData = await progressRes.json();
      const goalsData = await goalsRes.json();
      setProgress(progressData);
      setGoals(goalsData);

      // Daily total minutes completed
      const totals: { [date: string]: number } = {};
      for (const entry of progressData) {
        const dateOnly = entry.date.split("T")[0];
        totals[dateOnly] = (totals[dateOnly] || 0) + entry.minutesCompleted;
      }
      setDailyTotals(
        Object.entries(totals)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({ date, total }))
      );

      // Per-goal trend over time
      const trends: { [goalId: number]: { [date: string]: number } } = {};
      const targets: { [goalId: number]: number } = {};
      for (const entry of progressData) {
        const dateOnly = entry.date.split("T")[0];
        if (!trends[entry.goalId]) trends[entry.goalId] = {};
        trends[entry.goalId][dateOnly] = entry.minutesCompleted;
      }
      goalsData.forEach((goal: Goal) => {
        targets[goal.id] = goal.targetMinutes;
      });
      const allDates = Array.from(
        new Set(progressData.map((p) => p.date.split("T")[0]))
      ).sort();
      const structuredTrends = Object.entries(trends).map(([goalId, data]) => {
        const goal = goalsData.find((g: Goal) => g.id === Number(goalId));
        return {
          name: goal?.category || "Unknown",
          data: allDates.map((date) => ({
            date,
            minutesCompleted: data[date] || 0,
            target: targets[Number(goalId)] || 0,
          })),
        };
      });
      setGoalTrends(structuredTrends);
    };

    loadData();
  }, []);

  const filteredProgress = selectedCategory
    ? progress.filter((p) => {
        const goal = goals.find((g) => g.id === p.goalId);
        return goal?.category === selectedCategory;
      })
    : progress;

  const filteredGoals = selectedCategory
    ? goals.filter((g) => g.category === selectedCategory)
    : goals;

  const categories = Array.from(new Set(goals.map((g) => g.category)));

  // Pie chart logic
  const totalMinutesCompleted = filteredProgress.reduce(
    (sum, p) => sum + p.minutesCompleted,
    0
  );

  const totalTargetMinutes = filteredGoals.reduce((sum, goal) => {
    const daysWithProgress = new Set(
      filteredProgress.filter((p) => p.goalId === goal.id).map((p) => p.date)
    ).size;
    return sum + goal.targetMinutes * daysWithProgress;
  }, 0);

  const completionPercent = totalTargetMinutes
    ? Math.min(
        Math.round((totalMinutesCompleted / totalTargetMinutes) * 100),
        100
      )
    : 0;

  const percentData = selectedCategory
    ? [
        { name: selectedCategory, value: completionPercent },
        { name: "Remaining", value: 100 - completionPercent },
      ]
    : [
        { name: "Completed", value: completionPercent },
        { name: "Remaining", value: 100 - completionPercent },
      ];

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold">History</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Daily Minutes Completed</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyTotals}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Goal Completion %</h2>
        <select
          className="mb-4 border px-2 py-1 rounded"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              dataKey="value"
              data={percentData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={(entry) => `${entry.name}: ${entry.value}%`}
            >
              {percentData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Per Goal Trend</h2>
        {goalTrends.map((goal) => (
          <div key={goal.name} className="mb-6">
            <h3 className="font-semibold mb-1">{goal.name}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={goal.data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="minutesCompleted"
                  stroke="#82ca9d"
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ff7300"
                  name="Target"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </section>
    </div>
  );
}
