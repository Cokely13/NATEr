-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "currentCompletedStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentMissedStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestCompletedStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestMissedStreak" INTEGER NOT NULL DEFAULT 0;
