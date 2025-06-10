// import type { NextApiRequest, NextApiResponse } from "next";
// import { getIronSession, IronSession } from "iron-session";
// import { sessionOptions } from "../../../../lib/session";
// import { prisma } from "../../../../prisma/prisma";

// type SessionUser = {
//   id: number;
//   name: string;
//   email: string | null;
// };

// type SessionData = {
//   user?: SessionUser;
// };

// type SessionWithUser = IronSession<SessionData>;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = (await getIronSession(
//     req,
//     res,
//     sessionOptions
//   )) as SessionWithUser;

//   if (!session.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const userId = session.user.id;

//   if (req.method === "POST") {
//     const { goalId, date, minutesCompleted = 0, completed = false } = req.body;

//     if (!goalId || !date) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const goal = await prisma.goal.findUnique({ where: { id: goalId } });

//     if (!goal || goal.userId !== userId) {
//       return res.status(404).json({ error: "Goal not found or unauthorized" });
//     }

//     const progress = await prisma.goalProgress.create({
//       data: {
//         goalId,
//         userId,
//         date: new Date(date),
//         minutesCompleted,
//         completed,
//         targetMinutes: goal.targetMinutes,
//       },
//     });

//     return res.status(201).json(progress);
//   }

//   if (req.method === "GET") {
//     const { date } = req.query;

//     const where: any = { userId };
//     if (date) where.date = new Date(date as string);

//     const progress = await prisma.goalProgress.findMany({
//       where,
//       select: {
//         id: true,
//         goalId: true,
//         userId: true,
//         date: true,
//         minutesCompleted: true,
//         completed: true,
//         targetMinutes: true,
//         note: true,
//         quality: true,
//       },
//     });

//     return res.status(200).json(progress);
//   }

//   res.setHeader("Allow", ["POST", "GET"]);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

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

  if (req.method === "POST") {
    const { goalId, date, minutesCompleted = 0, completed = false } = req.body;

    if (!goalId || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        sharedWith: {
          where: { userId },
        },
      },
    });

    const isOwner = goal?.userId === userId;
    const isSharedWithUser = goal?.sharedWith.length > 0;

    if (!goal || (!isOwner && !isSharedWithUser)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to log progress for this goal" });
    }

    const existing = await prisma.goalProgress.findUnique({
      where: {
        goalId_userId_date: {
          goalId,
          userId,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "Progress for this goal and date already exists" });
    }

    const progress = await prisma.goalProgress.create({
      data: {
        goalId,
        userId,
        date: new Date(date),
        minutesCompleted,
        completed,
        targetMinutes: goal.targetMinutes,
      },
    });

    return res.status(201).json(progress);
  }

  if (req.method === "GET") {
    const { date } = req.query;

    const where: any = { userId };
    if (date) where.date = new Date(date as string);

    const progress = await prisma.goalProgress.findMany({
      where,
      select: {
        id: true,
        goalId: true,
        userId: true,
        date: true,
        minutesCompleted: true,
        completed: true,
        targetMinutes: true,
        note: true,
        quality: true,
      },
    });

    return res.status(200).json(progress);
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
