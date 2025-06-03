// lib/session.ts
import { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "nater_user",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// Add typing for req.session.user
declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      name: string;
      email: string;
    };
  }
}
