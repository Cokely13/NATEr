// import { updateAllGoalStreaks } from "../utils/updateAllGoalStreaks";
// import { prisma } from "../prisma/prisma";

// async function main() {
//   console.log("Running one-time historical streak update...");
//   await updateAllGoalStreaks();
//   console.log("Done updating streaks.");
//   await prisma.$disconnect();
// }

// main().catch((e) => {
//   console.error("Error updating streaks:", e);
//   prisma.$disconnect();
//   process.exit(1);
// });

// const { updateAllGoalStreaks } = require("../utils/updateAllGoalStreaks");
// const { prisma } = require("../prisma/prisma");

// async function main() {
//   console.log("Running one-time historical streak update...");
//   await updateAllGoalStreaks();
//   console.log("Done updating streaks.");
//   await prisma.$disconnect();
// }

// main().catch((e) => {
//   console.error("Error updating streaks:", e);
//   prisma.$disconnect();
//   process.exit(1);
// });

const { prisma } = require("../prisma/prisma");
const { subDays } = require("date-fns");

async function main() {
  console.log("Running one-time historical streak update...");

  const allGoals = await prisma.goal.findMany({
    include: {
      progressEntries: {
        orderBy: { date: "desc" },
      },
    },
  });

  for (const goal of allGoals) {
    const progressMap = new Map();

    goal.progressEntries.forEach(
      (entry: { date: Date; completed: boolean }) => {
        const dateStr = entry.date.toISOString().split("T")[0];
        progressMap.set(dateStr, entry.completed);
      }
    );

    let currentCompleted = 0;
    let currentMissed = 0;
    let longestCompleted = 0;
    let longestMissed = 0;
    let streakType = null;

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

    longestCompleted = Math.max(longestCompleted, currentCompleted);
    longestMissed = Math.max(longestMissed, currentMissed);

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

  console.log("Done updating streaks.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error updating streaks:", e);
  prisma.$disconnect();
  process.exit(1);
});
