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
  const sharedGoalId = parseInt(req.query.id as string);
  const { method } = req;

  if (isNaN(sharedGoalId)) {
    return res.status(400).json({ error: "Invalid sharedGoal ID" });
  }

  if (method === "PUT") {
    try {
      const { access } = req.body;

      if (!access) {
        return res.status(400).json({ error: "Missing access level" });
      }

      const sharedGoal = await prisma.sharedGoal.findUnique({
        where: { id: sharedGoalId },
        include: {
          goal: true,
        },
      });

      if (!sharedGoal || sharedGoal.goal.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this shared goal" });
      }

      const updated = await prisma.sharedGoal.update({
        where: { id: sharedGoalId },
        data: { access },
      });

      res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/sharedGoals/[id] error:", err);
      res.status(500).json({ error: "Failed to update shared goal" });
    }
  } else if (method === "DELETE") {
    try {
      const sharedGoal = await prisma.sharedGoal.findUnique({
        where: { id: sharedGoalId },
        include: {
          goal: true,
        },
      });

      if (!sharedGoal || sharedGoal.goal.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this shared goal" });
      }

      await prisma.sharedGoal.delete({
        where: { id: sharedGoalId },
      });

      res.status(204).end();
    } catch (err) {
      console.error("DELETE /api/sharedGoals/[id] error:", err);
      res.status(500).json({ error: "Failed to unshare goal" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
