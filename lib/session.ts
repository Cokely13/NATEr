// lib/session.ts
import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
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
