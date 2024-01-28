import { test, expect } from "@jest/globals";
import { AppRouter, appRouter } from "../../root";
import { prisma } from "../../../db"; // Import PrismaClientKnownRequestError
import { Session } from "next-auth";
import { inferProcedureInput } from "@trpc/server";

describe("Transaction API", () => {
    // Mock session data
    const mockSession: Session = {
        expires: new Date().toISOString(),
        user: { id: 1, role: "superAdmin" } || { id: 4, role: "cashier" }
    };

    // Create TRPC caller
    const caller = appRouter.createCaller({ session: mockSession, prisma: prisma });

    test("should create a transaction successfully", async () => {
        // Define the input data
        const input: inferProcedureInput<AppRouter["transaction"]["create"]> = {
            customer_id: "17",
            amount: 5502,
            type: "debt",
            transaction_details: "Bill No 45678"
        };

        // Perform the cashier creation
        const result = await caller.transaction.create(input);

        // Define the expected response structure
        const expectedResponse = {
            transaction_id: expect.any(Number),
            user_id: expect.any(Number),
            customer_id: expect.any(Number),
            amount: expect.any(Number),
            transaction_details: expect.any(String),
            transaction_type: expect.any(String),
            transaction_date: expect.any(Date)
        };

        // Verify that the result matches the expected response structure
        expect(result).toMatchObject(expectedResponse);
    })

})