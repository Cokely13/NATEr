import { PrismaClient } from "@prisma/client";
import type { Category } from "@prisma/client";
const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("✩ Clearing existing data...");

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "GoalProgress" RESTART IDENTITY CASCADE`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Goal" RESTART IDENTITY CASCADE`
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`
  );

  console.log("✅ Database cleared");

  const user = await prisma.user.create({
    data: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
    },
  });

  console.log("👤 User created:", user.name);

  const goalConfigs = [
    {
      category: "Exercise",
      initialTarget: 30,
      type: "raiseAfter3Days",
    },
    {
      category: "Work",
      initialTarget: 45,
      type: "lowerAfter4Misses",
    },
    {
      category: "Reading",
      initialTarget: 60,
      type: "fluctuate",
    },
  ];

  for (const config of goalConfigs) {
    let currentTarget = config.initialTarget;
    let hitStreak = 0;
    let missStreak = 0;

    const goal = await prisma.goal.create({
      data: {
        category: config.category as Category,
        targetMinutes: currentTarget,
        frequency: "Daily",
        description: `${currentTarget} min ${config.category} goal`,
        userId: user.id,
      },
    });

    for (let i = 27; i >= 0; i--) {
      const date = daysAgo(i);
      let minutesCompleted = 0;
      let completed = false;

      if (config.type === "raiseAfter3Days") {
        if (hitStreak >= 3) {
          currentTarget += 15;
          hitStreak = 0;
        }
        minutesCompleted = currentTarget;
        completed = true;
        hitStreak++;
      } else if (config.type === "lowerAfter4Misses") {
        const missed = Math.random() < 0.7; // 70% chance to miss
        if (missed) {
          minutesCompleted = Math.floor(currentTarget * 0.5);
          missStreak++;
        } else {
          minutesCompleted = currentTarget;
          completed = true;
          missStreak = 0;
        }
        if (missStreak >= 4) {
          currentTarget = Math.max(15, currentTarget - 15);
          missStreak = 0;
        }
      } else if (config.type === "fluctuate") {
        if (i % 6 === 0) currentTarget += 15;
        if (i % 10 === 0 && currentTarget > 15) currentTarget -= 10;
        const random = Math.random();
        if (random < 0.5) {
          minutesCompleted = Math.floor(currentTarget * 0.5);
        } else {
          minutesCompleted = currentTarget;
          completed = true;
        }
      }

      await prisma.goalProgress.create({
        data: {
          goalId: goal.id,
          userId: user.id,
          date,
          minutesCompleted,
          completed,
          targetMinutes: currentTarget,
        },
      });
    }
  }

  console.log("📊 Seeded goal progress with fluctuating targets");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
