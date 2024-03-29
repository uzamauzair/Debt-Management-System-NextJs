import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
} from "next";
import { getServerSession as $getServerSession } from "next-auth";
import { authOptions } from "./auth"
type GetServerSessionContext =
    | {
        req: GetServerSidePropsContext["req"];
        res: GetServerSidePropsContext["res"];
    }
    | { req: NextApiRequest; res: NextApiResponse };
export const getServerAuthSession = (ctx: GetServerSessionContext) => {
    return $getServerSession(ctx.req, ctx.res, authOptions);
};
