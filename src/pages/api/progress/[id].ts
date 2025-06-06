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

  const { id } = req.query;

  if (req.method === "PUT") {
    const { minutesCompleted, completed, note, quality } = req.body;

    try {
      const updated = await prisma.goalProgress.update({
        where: { id: Number(id) },
        data: {
          minutesCompleted,
          completed,
          note: note ?? null,
          quality: quality ?? null,
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
