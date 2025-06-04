import { getIronSession } from "iron-session";
import { sessionOptions } from "../../../../lib/session";
import { prisma } from "../../../../prisma/prisma";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, password } = req.body;

  const user = await prisma.user.findFirst({ where: { name } });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const session = await getIronSession(req, res, sessionOptions);
  session.user = { id: user.id, name: user.name, email: user.email };
  await session.save();

  res
    .status(200)
    .json({
      message: "Logged in",
      user: { id: user.id, name: user.name, email: user.email },
    });
}
