import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  type NextAuthOptions,
  type DefaultSession
} from "next-auth";
import { prisma } from "../../db";

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
type UserRoles = "superAdmin" | "cashier"
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: UserRoles;
    } & DefaultSession["user"];
  }
}
//
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 600 // 10minutes
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return Promise.resolve(token)
    },
    session({ session, token }) {
      if (token.user) {
        const t = token.user as {
          id: number;
          email: string;
          role: UserRoles;
        };
        session.user = {
          id: t.id,
          email: t.email,
          role: t.role,
        }
      }
      return Promise.resolve(session)
    }
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const cashier = await prisma.users.findUnique({
          where: {
            email: credentials?.email, role: {
              role_type: "cashier"
            },
          },
          include: {
            role: {
              select: {
                role_type: true
              }
            }
          }
        });
        // if user is a cashier
        if (cashier && cashier.deactivated === false) {
          const cashierVerified = bcrypt.compareSync(credentials?.password || "", cashier.password)
          if (cashierVerified) {
            return {
              id: cashier.user_id.toString(),
              email: cashier.email,
              role: cashier.role.role_type
            };
          }
        }
        // if user is a super admin
        const superAdmin = await prisma.users.findUnique({
          where: {
            email: credentials?.email,
            role: {
              role_type: "superAdmin"
            }
          }, include: {
            role: {
              select: {
                role_type: true
              }
            }
          }
        });
        //
        if (superAdmin) {
          const superAdminVerified = bcrypt.compareSync(credentials?.password || "", superAdmin.password);
          if (superAdminVerified) {
            return {
              id: superAdmin.user_id.toString(),
              email: superAdmin.email,
              role: superAdmin.role.role_type
            };
          }
        }
        return null;
      }
    })
  ],
};

