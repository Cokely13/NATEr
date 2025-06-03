// import type { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { method } = req;

//   if (method === "GET") {
//     try {
//       const { userId, date } = req.query;

//       if (!userId) {
//         return res.status(400).json({ error: "Missing userId" });
//       }

//       const allGoals = await prisma.goal.findMany({
//         where: { userId: Number(userId) },
//         include: { progressEntries: true },
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
//     console.log("Incoming data:", req.body);
//     try {
//       const { category, targetMinutes, frequency, description, date, userId } =
//         req.body;

//       if (!category || !targetMinutes || !frequency || !userId) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const newGoal = await prisma.goal.create({
//         data: {
//           category,
//           targetMinutes: Number(targetMinutes),
//           frequency,
//           description,
//           date: date ? new Date(date) : null,
//           userId: Number(userId),
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
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../../../lib/session";
import { prisma } from "../../../../prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession(req, res, sessionOptions);

  if (!session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const { method } = req;

  if (method === "GET") {
    try {
      const { date } = req.query;

      const allGoals = await prisma.goal.findMany({
        where: { userId },
        include: { progressEntries: true },
      });

      // Filter OneTime goals by date in JS
      let filtered = allGoals;

      if (date) {
        const today = new Date(date as string).toISOString().split("T")[0];
        filtered = allGoals.filter((goal) => {
          if (goal.frequency === "OneTime") {
            return goal.date?.toISOString().startsWith(today);
          }
          return true; // Daily and Weekly goals pass through
        });
      }

      res.status(200).json(filtered);
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
