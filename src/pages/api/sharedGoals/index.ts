import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession, IronSession } from "iron-session";
import { sessionOptions } from "../../../../lib/session";
import { prisma } from "../../../../prisma/prisma";

type SessionUser = {
  id: number;
  name: string;
  email: string | null;
};

type SessionData = {
  user?: SessionUser;
};

type SessionWithUser = IronSession<SessionData>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = (await getIronSession(
    req,
    res,
    sessionOptions
  )) as SessionWithUser;

  if (!session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const { method } = req;

  if (method === "GET") {
    try {
      const shared = await prisma.sharedGoal.findMany({
        where: { userId },
        include: {
          goal: {
            include: {
              user: true,
              progressEntries: true,
            },
          },
        },
      });

      res.status(200).json(shared);
    } catch (err) {
      console.error("GET /api/sharedGoals error:", err);
      res.status(500).json({ error: "Failed to fetch shared goals" });
    }
  } else if (method === "POST") {
    try {
      const { goalId, userId: friendId, access } = req.body;

      if (!goalId || !friendId || !access) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await prisma.sharedGoal.findFirst({
        where: {
          goalId,
          userId: friendId,
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ error: "Goal already shared with this user" });
      }

      const sharedGoal = await prisma.sharedGoal.create({
        data: {
          goalId,
          userId: friendId,
          access,
        },
      });

      res.status(201).json(sharedGoal);
    } catch (err) {
      console.error("POST /api/sharedGoals error:", err);
      res.status(500).json({ error: "Failed to share goal" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
