// types/ironSessionTypes.ts
import "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      name: string;
      email: string;
    };
  }
}
