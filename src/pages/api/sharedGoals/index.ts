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
      const {
        goalId,
        userId: partnerId,
        creatorId,
        category,
        description,
        targetMinutes,
        frequency,
        access,
      } = req.body;

      if (goalId && partnerId && access) {
        // ✅ Case 1: Sharing an existing goal
        const existing = await prisma.sharedGoal.findFirst({
          where: {
            goalId,
            userId: partnerId,
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
            userId: partnerId,
            access,
          },
        });

        return res.status(201).json(sharedGoal);
      }

      // ✅ Case 2: Creating a new goal and sharing it
      if (
        creatorId &&
        partnerId &&
        category &&
        targetMinutes &&
        frequency &&
        access
      ) {
        const newGoal = await prisma.goal.create({
          data: {
            userId: creatorId,
            category,
            description,
            targetMinutes,
            frequency,
          },
        });

        const sharedGoal = await prisma.sharedGoal.create({
          data: {
            goalId: newGoal.id,
            userId: partnerId,
            access,
          },
        });

        return res.status(201).json({ goal: newGoal, sharedGoal });
      }

      return res
        .status(400)
        .json({ error: "Missing required fields for either path" });
    } catch (err) {
      console.error("POST /api/sharedGoals error:", err);
      res.status(500).json({ error: "Failed to create or share goal" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
