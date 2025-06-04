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

const { updateAllGoalStreaks } = require("../utils/updateAllGoalStreaks");
const { prisma } = require("../prisma/prisma");

async function main() {
  console.log("Running one-time historical streak update...");
  await updateAllGoalStreaks();
  console.log("Done updating streaks.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error updating streaks:", e);
  prisma.$disconnect();
  process.exit(1);
});
