import { test, expect } from "@jest/globals";
import { AppRouter, appRouter } from "../../root";
import { prisma } from "../../../db"; // Import PrismaClientKnownRequestError
import { Session } from "next-auth";
import { TRPCError, inferProcedureInput } from "@trpc/server";

describe("Cashier API", () => {
    // Mock session data
    const mockSession: Session = {
        expires: new Date().toISOString(),
        user: { id: 1, role: "superAdmin" }
    };

    // Create TRPC caller
    const caller = appRouter.createCaller({ session: mockSession, prisma: prisma });

    test("should create a cashier successfully", async () => {
        // Define the input data
        const input: inferProcedureInput<AppRouter["cashier"]["create"]> = {
            username: "Abu Ayyub Al34",
            email: "abdcd5@gmail.com",
        };

        // Perform the cashier creation
        const result = await caller.cashier.create(input);

        // Define the expected response structure
        const expectedResponse = {
            user_id: expect.any(Number),
            username: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
            role_id: expect.any(Number),
            created_time: expect.any(Date),
            deactivated: expect.any(Boolean),
        };

        // Verify that the result matches the expected response structure
        expect(result).toMatchObject(expectedResponse);
    });

    test("should handle duplicate email error", async () => {
        const input: inferProcedureInput<AppRouter["cashier"]["create"]> = {
            username: "Abu Ayyub Al345",
            email: "abd01@gmail.com",
        };

        let error: Error | undefined;
        try {
            await caller.cashier.create(input);
        } catch (err) {
            error = err as Error;
        }

        // Verify that the error is an instance of TRPCError (or the correct error type)
        expect(error).toBeInstanceOf(TRPCError);

        // Use optional chaining (?) to safely access the message property
        expect(error?.message).toMatch("Unique constraint failed on the fields: (`email`)");
    });
});
