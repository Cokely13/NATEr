import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "GET") {
    try {
      const { userId, date } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const where: any = { userId: Number(userId) };

      if (date) {
        where.date = new Date(date as string);
      }

      const goals = await prisma.goal.findMany({
        where,
        include: { progressEntries: true },
      });

      res.status(200).json(goals);
    } catch (error) {
      console.error("GET /api/goals error:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else if (method === "POST") {
    try {
      const { category, targetMinutes, frequency, description, date, userId } =
        req.body;

      if (!category || !targetMinutes || !frequency || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newGoal = await prisma.goal.create({
        data: {
          category,
          targetMinutes: Number(targetMinutes),
          frequency,
          description,
          date: date ? new Date(date) : null,
          userId: Number(userId),
        },
      });

      res.status(201).json(newGoal);
    } catch (err: any) {
      console.error("POST /api/goals error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
