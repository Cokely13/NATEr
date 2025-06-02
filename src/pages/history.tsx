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
        totals[entry.date] = (totals[entry.date] || 0) + entry.minutesCompleted;
      }
      setDailyTotals(
        Object.entries(totals)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({ date, total }))
      );

      // Per-goal trend over time
      const trends: { [goalId: number]: { [date: string]: number } } = {};
      for (const entry of progressData) {
        if (!trends[entry.goalId]) trends[entry.goalId] = {};
        trends[entry.goalId][entry.date] = entry.minutesCompleted;
      }
      const allDates = Array.from(
        new Set(progressData.map((p) => p.date))
      ).sort();
      const structuredTrends = Object.entries(trends).map(([goalId, data]) => {
        const goal = goalsData.find((g: Goal) => g.id === Number(goalId));
        return {
          name: goal?.category || "Unknown",
          data: allDates.map((date) => ({
            date,
            minutes: data[date] || 0,
          })),
        };
      });
      setGoalTrends(structuredTrends);
    };

    loadData();
  }, []);

  const completedCount = progress.filter((p) => p.completed).length;
  const incompleteCount = progress.length - completedCount;

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
        <h2 className="text-xl font-semibold mb-2">Goal Completion Ratio</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              dataKey="value"
              data={[
                { name: "Completed", value: completedCount },
                { name: "Incomplete", value: incompleteCount },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
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
                <Line type="monotone" dataKey="minutes" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </section>
    </div>
  );
}
