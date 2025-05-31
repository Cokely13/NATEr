import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
    },
  });

  console.log("✅ User created");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
