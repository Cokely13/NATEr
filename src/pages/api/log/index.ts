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
      const { date } = req.query;

      const allLogs = await prisma.log.findMany({
        where: { userId },
        include: {
          goal: true, // to access frequency, category, etc.
        },
      });

      // Filter OneTime goals by date in JS
      let filtered = allLogs;

      if (date) {
        const today = new Date(date as string).toISOString().split("T")[0];
        filtered = allLogs.filter((log) => {
          if (log.goal.frequency === "OneTime") {
            return log.date?.toISOString().startsWith(today);
          }
          return true;
        });
      }

      res.status(200).json(filtered);
    } catch (error) {
      console.error("GET /logs/goals error:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else if (method === "POST") {
    try {
      const { goalId, date, quality, note } = req.body;

      if (!goalId) {
        return res.status(400).json({ error: "Missing goalId" });
      }

      const newLog = await prisma.log.create({
        data: {
          goalId,
          userId,
          date: date ? new Date(date) : undefined, // use default(now()) if omitted
          quality: quality ?? null,
          note: note ?? null, // optional fields
        },
      });

      res.status(201).json(newLog);
    } catch (err: any) {
      console.error("POST /api/logs error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
