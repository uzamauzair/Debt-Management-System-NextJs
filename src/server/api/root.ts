import { createTRPCRouter } from "./trpc";
import { cashierRouter } from "./routers/cashier";
import { userRouter } from "./routers/user";
import { customerRouter } from "./routers/customers";
import { emailRouter } from "./routers/email";
import { transactionRouter } from "./routers/transaction";
import { s3Router } from "./routers/s3";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  cashier: cashierRouter,
  user: userRouter,
  customer: customerRouter,
  email: emailRouter,
  transaction: transactionRouter,
  s3: s3Router
});
// export type definition of API
export type AppRouter = typeof appRouter;
