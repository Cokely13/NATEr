import { prisma } from "../prisma/prisma";
import { subDays } from "date-fns";

export async function updateAllGoalStreaks() {
  const allGoals = await prisma.goal.findMany({
    include: {
      progressEntries: {
        orderBy: { date: "desc" },
      },
    },
  });

  for (const goal of allGoals) {
    const progressMap = new Map<string, boolean>();

    goal.progressEntries.forEach((entry: any) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      progressMap.set(dateStr, entry.completed);
    });

    let currentCompleted = 0;
    let currentMissed = 0;
    let longestCompleted = 0;
    let longestMissed = 0;
    let streakType: "completed" | "missed" | null = null;

    for (let i = 0; i < 60; i++) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split("T")[0];

      if (!progressMap.has(dateStr)) break;

      const completed = progressMap.get(dateStr);

      if (completed) {
        if (streakType === "missed") {
          longestMissed = Math.max(longestMissed, currentMissed);
          currentMissed = 0;
        }
        currentCompleted++;
        streakType = "completed";
      } else {
        if (streakType === "completed") {
          longestCompleted = Math.max(longestCompleted, currentCompleted);
          currentCompleted = 0;
        }
        currentMissed++;
        streakType = "missed";
      }
    }

    // Finalize longest streaks
    longestCompleted = Math.max(longestCompleted, currentCompleted);
    longestMissed = Math.max(longestMissed, currentMissed);

    // Finalize current streak
    const currentCompletedStreak =
      streakType === "completed" ? currentCompleted : 0;
    const currentMissedStreak = streakType === "missed" ? currentMissed : 0;

    await prisma.goal.update({
      where: { id: goal.id },
      data: {
        currentCompletedStreak,
        currentMissedStreak,
        longestCompletedStreak: longestCompleted,
        longestMissedStreak: longestMissed,
      },
    });

    console.log(
      `✅ ${goal.category}: currentCompleted=${currentCompletedStreak}, currentMissed=${currentMissedStreak}, longest=${longestCompleted}/${longestMissed}`
    );
  }
}
