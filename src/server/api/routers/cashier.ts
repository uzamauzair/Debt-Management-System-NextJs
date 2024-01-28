import { z } from "zod";
import bcrypt from "bcryptjs";
import { superAdminProcedure, createTRPCRouter } from "../trpc"
import { getCashierRoleId } from "../../../utils/constant";

export const cashierRouter = createTRPCRouter({
    create: superAdminProcedure.input(z.object({
        username: z.string(),
        email: z.string()
    })).mutation(async ({ ctx, input }) => {
        // Generate a random password with hashing.
        const password = bcrypt.hashSync(Math.random().toString(36).substring(7), 10);
        //
        const cashierRoleId = await getCashierRoleId();
        return await ctx.prisma.users.create({
            data: {
                username: input.username,
                email: input.email,
                password,
                role_id: cashierRoleId!
            }
        })
    }),
    //
    deactive: superAdminProcedure.input(z.object({
        id: z.number()
    })).mutation(async ({ ctx, input }) => {

        const userState = await ctx.prisma.users.findUnique({
            where: {
                user_id: input.id
            },
            select: {
                deactivated: true,
                user_id: true
            }
        })
        //
        let active = false;
        if (userState?.deactivated === true) {
            active = true
        } else active = false
        const final = await ctx.prisma.users.update({
            where: {
                user_id: input.id
            },
            data: {
                deactivated: !active
            }
        })
        return final
    })

})