// src/pages/api/auth/logout.ts
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession(req, res, sessionOptions);
  await session.destroy();
  res.status(200).json({ message: "Logged out" });
}
