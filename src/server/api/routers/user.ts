import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { emailRouter } from "./email";
import { ONE_HOUR, digits } from "../../../utils/constant";

export const userRouter = createTRPCRouter({
    //
    forgotPassword: publicProcedure.input(z.object({ email: z.string() })).mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.users.findFirstOrThrow({ where: { email: input.email } });
        if (!user) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Account doesnt exists",
            });
        }
        //
        let OTP = "";
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        //
        const email = emailRouter.createCaller({ ...ctx });
        await email.sendEmail({
            receiver: input.email,
            subject: "One Time Password by Smart Debt Manager",
            text: `You have requested for a One Time Password. Your OTP is ${OTP}, if this was not requested by you, contact us through this mail. Thank you!`,
        });
        const salt = bcrypt.genSaltSync(10);
        const hashedOtp = bcrypt.hashSync(OTP, salt);
        //
        await ctx.prisma.verification.deleteMany({ where: { userId: user?.user_id } });
        await ctx.prisma.verification.create({ data: { userId: user?.user_id ?? "", otp: hashedOtp } });
        return user;
    }),
    //
    resetPassword: publicProcedure
        .input(z.object({ email: z.string(), otp: z.string(), password: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.users.findUnique({ where: { email: input.email } });
            if (!user) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Account doesnt exists",
                });
            }
            //
            const request = await ctx.prisma.verification.findFirst({ where: { userId: user.user_id } });
            if (!request) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Reset request not found",
                });
            }
            //
            const otpVerified = bcrypt.compareSync(input.otp, request?.otp ?? "");
            if (!otpVerified) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid OTP",
                });
            }
            if (new Date(request?.createdAt ?? "").getTime() + ONE_HOUR < Date.now()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "OTP has expired",
                });
            }
            //
            await ctx.prisma.verification.delete({ where: { id: request?.id } });
            //
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(input.password, salt);
            //
            return await ctx.prisma.users.update({ where: { user_id: user.user_id }, data: { password: hashedPassword } });
        }),
});
