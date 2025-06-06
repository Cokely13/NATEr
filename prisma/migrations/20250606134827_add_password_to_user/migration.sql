/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'Music';
ALTER TYPE "Category" ADD VALUE 'Cleaning';
ALTER TYPE "Category" ADD VALUE 'Stretching';

-- AlterTable
ALTER TABLE "GoalProgress" ADD COLUMN     "note" TEXT,
ADD COLUMN     "quality" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;
