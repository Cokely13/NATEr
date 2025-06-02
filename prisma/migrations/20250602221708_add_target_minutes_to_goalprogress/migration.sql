/*
  Warnings:

  - Added the required column `targetMinutes` to the `GoalProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoalProgress" ADD COLUMN     "targetMinutes" INTEGER NOT NULL;
