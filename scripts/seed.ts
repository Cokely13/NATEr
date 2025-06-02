import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing data...");

  // Delete in reverse order of dependencies
  await prisma.goalProgress.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleared");

  // Create test user
  const user = await prisma.user.create({
    data: {
      id: 1, // force ID to 1
      name: "Test User",
      email: "test@example.com",
    },
  });

  console.log("👤 User created:", user.name);

  // Create test goals
  const today = new Date(new Date().toISOString().split("T")[0]);

  const goals = await prisma.goal.createMany({
    data: [
      {
        category: "Exercise",
        targetMinutes: 1,
        frequency: "OneTime",
        description: "1 minute test goal",
        date: today,
        userId: user.id,
      },
      {
        category: "Coding",
        targetMinutes: 2,
        frequency: "Daily",
        description: "2 minute test goal",
        date: null,
        userId: user.id,
      },
      {
        category: "Work",
        targetMinutes: 4,
        frequency: "Daily",
        description: "4 minute test goal",
        date: null,
        userId: user.id,
      },
    ],
  });

  console.log("🎯 Test goals created:", goals.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
