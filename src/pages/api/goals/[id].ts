// import type { NextApiRequest, NextApiResponse } from "next";
// import { getIronSession } from "iron-session";
// import { sessionOptions } from "../../../../lib/session";
// import { prisma } from "../../../../prisma/prisma";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getIronSession(req, res, sessionOptions);

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
