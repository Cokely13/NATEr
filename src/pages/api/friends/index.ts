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
      const friends = await prisma.friend.findMany({
        where: {
          OR: [{ requesterId: userId }, { recipientId: userId }],
        },
        include: {
          requester: true,
          recipient: true,
        },
      });

      res.status(200).json(friends);
    } catch (err) {
      console.error("GET /api/friends error:", err);
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  } else if (method === "POST") {
    try {
      const { recipientId } = req.body;

      if (!recipientId) {
        return res.status(400).json({ error: "Missing recipientId" });
      }

      const existing = await prisma.friend.findFirst({
        where: {
          OR: [
            { requesterId: userId, recipientId },
            { requesterId: recipientId, recipientId: userId },
          ],
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Friend request already exists" });
      }

      const newFriend = await prisma.friend.create({
        data: {
          requesterId: userId,
          recipientId,
        },
      });

      res.status(201).json(newFriend);
    } catch (err) {
      console.error("POST /api/friends error:", err);
      res.status(500).json({ error: "Failed to send friend request" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
