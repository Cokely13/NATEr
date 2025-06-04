// lib/withUser.ts
import { GetServerSidePropsContext } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./session";
import "../types/ironSessionTypes.ts";

export function requireUser(
  gssp: (ctx: GetServerSidePropsContext, user: any) => Promise<{ props: any }>
) {
  return async function handler(ctx: GetServerSidePropsContext) {
    const req = ctx.req;
    const res = ctx.res;

    const session = await getIronSession(req, res, sessionOptions);
    const user = session.user;

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const gsspData = await gssp(ctx, user);

    return {
      props: {
        user,
        ...("props" in gsspData ? gsspData.props : {}),
      },
    };
  };
}
