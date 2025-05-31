import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      goalId,
      userId,
      date,
      minutesCompleted = 0,
      completed = false,
    } = req.body;

    if (!goalId || !userId || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const progress = await prisma.goalProgress.create({
      data: {
        goalId,
        userId,
        date: new Date(date),
        minutesCompleted,
        completed,
      },
    });

    res.status(201).json(progress);
  } else if (req.method === "GET") {
    const { userId, date } = req.query;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const where: any = { userId: Number(userId) };
    if (date) where.date = new Date(date as string);

    const progress = await prisma.goalProgress.findMany({ where });
    res.status(200).json(progress);
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
