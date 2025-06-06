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

  const goalId = parseInt(req.query.id as string);
  const { method } = req;

  if (method === "PUT") {
    try {
      const { targetMinutes, description } = req.body;

      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          targetMinutes,
          description,
        },
      });

      return res.status(200).json(updatedGoal);
    } catch (error) {
      console.error("PUT /api/goals/[id] error:", error);
      return res.status(500).json({ error: "Failed to update goal" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
