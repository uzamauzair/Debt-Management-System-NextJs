import NextAuth from "next-auth";
import { authOptions } from "~/server/auth/src/auth";

export default NextAuth(authOptions);
