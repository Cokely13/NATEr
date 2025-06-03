// pages/api/auth/logout.ts
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";

export default withIronSessionApiRoute(async (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logged out" });
}, sessionOptions);
