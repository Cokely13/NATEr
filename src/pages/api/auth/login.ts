// pages/api/auth/login.ts
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";
import { prisma } from "../../../prisma/prisma";
import bcrypt from "bcrypt";

export default withIronSessionApiRoute(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  await req.session.save();

  res.status(200).json({ message: "Logged in" });
}, sessionOptions);
