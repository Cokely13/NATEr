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
  const friendId = parseInt(req.query.id as string);

  if (isNaN(friendId)) {
    return res.status(400).json({ error: "Invalid friend ID" });
  }

  if (method === "PUT") {
    try {
      const { status, tier } = req.body;

      const existingFriend = await prisma.friend.findUnique({
        where: { id: friendId },
      });

      if (!existingFriend) {
        return res.status(404).json({ error: "Friend request not found" });
      }

      // Must be the recipient to accept
      if (status && existingFriend.recipientId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this request" });
      }

      const updated = await prisma.friend.update({
        where: { id: friendId },
        data: {
          ...(status ? { status } : {}),
          ...(tier ? { tier } : {}),
        },
      });

      res.status(200).json(updated);
    } catch (err) {
      console.error("PUT /api/friends/[id] error:", err);
      res.status(500).json({ error: "Failed to update friend request" });
    }
  } else if (method === "DELETE") {
    try {
      const existing = await prisma.friend.findUnique({
        where: { id: friendId },
      });

      if (
        !existing ||
        (existing.requesterId !== userId && existing.recipientId !== userId)
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this friend" });
      }

      await prisma.friend.delete({ where: { id: friendId } });
      res.status(204).end();
    } catch (err) {
      console.error("DELETE /api/friends/[id] error:", err);
      res.status(500).json({ error: "Failed to delete friend" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
