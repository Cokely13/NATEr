// // src/pages/api/auth/getUser.ts
// import { getIronSession } from "iron-session";
// import { sessionOptions } from "../../../../lib/session";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getIronSession(req, res, sessionOptions);
//   if (!session.user) {
//     return res.status(401).json({ user: null });
//   }
//   res.status(200).json({ user: session.user });
// }

// src/pages/api/auth/getUser.ts
import { getIronSession, IronSessionData } from "iron-session";
import { sessionOptions } from "../../../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = (await getIronSession(
    req,
    res,
    sessionOptions
  )) as IronSessionData;

  if (!session.user) {
    return res.status(401).json({ user: null });
  }

  res.status(200).json({ user: session.user });
}
