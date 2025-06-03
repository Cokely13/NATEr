import { PrismaClient } from "@prisma/client";
import type { Category } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const goalConfigsByUser: Record<string, any[]> = {
  Test: [
    { category: "Exercise", initialTarget: 30, type: "raiseAfter3Days" },
    { category: "Work", initialTarget: 45, type: "lowerAfter4Misses" },
    { category: "Reading", initialTarget: 60, type: "fluctuate" },
  ],
  Ryan: [
    { category: "Music", initialTarget: 25, type: "raiseAfter3Days" },
    { category: "Coding", initialTarget: 50, type: "lowerAfter4Misses" },
    { category: "Work", initialTarget: 90, type: "fluctuate" },
  ],
  Scott: [
    { category: "Study", initialTarget: 20, type: "raiseAfter3Days" },
    { category: "Cleaning", initialTarget: 40, type: "lowerAfter4Misses" },
    { category: "Stretching", initialTarget: 35, type: "fluctuate" },
  ],
};

async function createUser(name: string, email: string) {
  const password = await bcrypt.hash("test", 10);
  return await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
}

async function seedGoalsAndProgress(userId: number, configs: any[]) {
  for (const config of configs) {
    let currentTarget = config.initialTarget;
    let hitStreak = 0;
    let missStreak = 0;

    const goal = await prisma.goal.create({
      data: {
        category: config.category as Category,
        targetMinutes: currentTarget,
        frequency: "Daily",
        description: `${currentTarget} min ${config.category} goal`,
        userId,
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
        const missed = Math.random() < 0.7;
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
          userId,
          date,
          minutesCompleted,
          completed,
          targetMinutes: currentTarget,
        },
      });
    }
  }
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

  const testUser = await createUser("Test", "test@example.com");
  const ryan = await createUser("Ryan", "ryan@example.com");
  const scott = await createUser("Scott", "scott@example.com");

  console.log("👤 Users created:", testUser.name, ryan.name, scott.name);

  await seedGoalsAndProgress(testUser.id, goalConfigsByUser.Test);
  await seedGoalsAndProgress(ryan.id, goalConfigsByUser.Ryan);
  await seedGoalsAndProgress(scott.id, goalConfigsByUser.Scott);

  console.log("📊 All goal progress seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
