import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🧹 Clearing existing data...");

  await prisma.goalProgress.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleared");

  const user = await prisma.user.create({
    data: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
    },
  });

  console.log("👤 User created:", user.name);

  const goalData = [
    {
      category: "Exercise",
      targetMinutes: 30,
      frequency: "Daily",
      description: "30 min goal",
      userId: user.id,
    },
    {
      category: "Work",
      targetMinutes: 45,
      frequency: "Daily",
      description: "45 min goal",
      userId: user.id,
    },
    {
      category: "Reading",
      targetMinutes: 60,
      frequency: "Daily",
      description: "60 min goal",
      userId: user.id,
    },
    {
      category: "Coding",
      targetMinutes: 90,
      frequency: "Daily",
      description: "90 min goal",
      userId: user.id,
    },
  ];

  const createdGoals = await Promise.all(
    goalData.map((goal) => prisma.goal.create({ data: goal }))
  );

  console.log("🎯 Goals created:", createdGoals.length);

  for (const goal of createdGoals) {
    for (let i = 0; i < 28; i++) {
      const date = daysAgo(i);
      let minutesCompleted = 0;
      let completed = false;

      if (i % 4 === 0) {
        minutesCompleted = goal.targetMinutes;
        completed = true;
      } else if (i % 4 === 1) {
        minutesCompleted = Math.floor(goal.targetMinutes / 2);
      } else {
        // Random 0–(target - 1) range, avoiding accidental completion
        minutesCompleted = Math.floor(Math.random() * goal.targetMinutes);
      }

      await prisma.goalProgress.create({
        data: {
          goalId: goal.id,
          userId: user.id,
          date,
          minutesCompleted,
          completed,
        },
      });
    }
  }

  console.log("📊 Seeded goal progress for past 4 weeks");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
