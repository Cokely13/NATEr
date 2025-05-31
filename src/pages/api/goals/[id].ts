import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const updatedGoal = await prisma.goal.update({
        where: { id: Number(id) },
        data: req.body, // accepts targetMinutes, description, frequency, etc.
      });
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error("PUT /api/goals/[id] error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
