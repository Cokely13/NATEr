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
//   const { method } = req;

//   if (method === "GET") {
//     try {
//       const { date } = req.query;

//       const allGoals = await prisma.goal.findMany({
//         where: { userId },
//         include: {
//           progressEntries: true,
//           sharedWith: {
//             include: {
//               user: true, // this is the friend it's shared **with**
//             },
//           },
//         },
//       });

//       // Filter OneTime goals by date in JS
//       let filtered = allGoals;

//       if (date) {
//         const today = new Date(date as string).toISOString().split("T")[0];
//         filtered = allGoals.filter((goal) => {
//           if (goal.frequency === "OneTime") {
//             return goal.date?.toISOString().startsWith(today);
//           }
//           return true; // Daily and Weekly goals pass through
//         });
//       }

//       res.status(200).json(filtered);
//     } catch (error) {
//       console.error("GET /api/goals error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   } else if (method === "POST") {
//     try {
//       const { category, targetMinutes, frequency, description, date } =
//         req.body;

//       if (!category || !targetMinutes || !frequency) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const newGoal = await prisma.goal.create({
//         data: {
//           category,
//           targetMinutes: Number(targetMinutes),
//           frequency,
//           description,
//           date: date ? new Date(date) : null,
//           userId,
//         },
//       });

//       res.status(201).json(newGoal);
//     } catch (err: any) {
//       console.error("POST /api/goals error:", err);
//       res.status(500).json({ error: "Something went wrong" });
//     }
//   } else {
//     res.setHeader("Allow", ["GET", "POST"]);
//     res.status(405).end(`Method ${method} Not Allowed`);
//   }
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
  const { method } = req;

  if (method === "GET") {
    try {
      const { date } = req.query;

      const [ownedGoals, sharedGoals] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          include: {
            progressEntries: true,
            sharedWith: {
              include: { user: true },
            },
          },
        }),
        prisma.sharedGoal.findMany({
          where: { userId },
          include: {
            goal: {
              include: {
                user: true,
                progressEntries: true,
                sharedWith: {
                  include: { user: true },
                },
              },
            },
          },
        }),
      ]);

      const sharedGoalObjs = sharedGoals.map((s) => s.goal);
      let combinedGoals = [...ownedGoals, ...sharedGoalObjs];

      if (date) {
        const today = new Date(date as string).toISOString().split("T")[0];
        combinedGoals = combinedGoals.filter((goal) => {
          if (goal.frequency === "OneTime") {
            return goal.date?.toISOString().startsWith(today);
          }
          return true;
        });
      }

      res.status(200).json(combinedGoals);
    } catch (error) {
      console.error("GET /api/goals error:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else if (method === "POST") {
    try {
      const { category, targetMinutes, frequency, description, date } =
        req.body;

      if (!category || !targetMinutes || !frequency) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newGoal = await prisma.goal.create({
        data: {
          category,
          targetMinutes: Number(targetMinutes),
          frequency,
          description,
          date: date ? new Date(date) : null,
          userId,
        },
      });

      res.status(201).json(newGoal);
    } catch (err: any) {
      console.error("POST /api/goals error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
