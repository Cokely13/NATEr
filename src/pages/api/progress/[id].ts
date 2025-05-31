import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { minutesCompleted, completed } = req.body;

    try {
      const updated = await prisma.goalProgress.update({
        where: { id: Number(id) },
        data: {
          minutesCompleted,
          completed,
        },
      });

      res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/progress/[id] error:", err);
      res.status(500).json({ error: "Update failed" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
