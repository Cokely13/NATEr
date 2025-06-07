import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = parseInt(req.query.id as string);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, shareLevel: true }, // include shareLevel if needed
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (err) {
      console.error("GET /api/users/[id] error:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  } else if (req.method === "PUT") {
    const { shareLevel } = req.body;

    if (!["none", "friends"].includes(shareLevel)) {
      return res.status(400).json({ error: "Invalid share level" });
    }

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { shareLevel },
      });

      return res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/users/[id] error:", err);
      res.status(500).json({ error: "Failed to update share level" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
