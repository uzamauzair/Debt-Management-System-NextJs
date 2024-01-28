import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET: process.env.NODE_ENV === "production" ? z.string().min(1) : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess((str) => process.env.VERCEL_URL ?? str, process.env.VERCEL ? z.string().min(1) : z.string().url()),
    GMAIL_ADDRESS: z.string(),
    GMAIL_PASSWORD: z.string(),
    SMS_GATEWAY_API_URL: z.string(),
    SMS_GATEWAY_ACCESS_TOKEN: z.string(),
    SMS_GATEWAY_SENDER_ID: z.string(),
    CLOUD_REGION: z.string(),
    CLOUD_ACCESS_KEY_ID: z.string(),
    CLOUD_SECRET_ACCESS_KEY_ID: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CUSTOMER_NIC: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    SMS_GATEWAY_API_URL: process.env.SMS_GATEWAY_API_URL,
    SMS_GATEWAY_ACCESS_TOKEN: process.env.SMS_GATEWAY_ACCESS_TOKEN,
    SMS_GATEWAY_SENDER_ID: process.env.SMS_GATEWAY_SENDER_ID,
    CLOUD_REGION: process.env.CLOUD_REGION,
    CLOUD_ACCESS_KEY_ID: process.env.CLOUD_ACCESS_KEY_ID,
    CLOUD_SECRET_ACCESS_KEY_ID: process.env.CLOUD_SECRET_ACCESS_KEY_ID,
    NEXT_PUBLIC_CUSTOMER_NIC: process.env.NEXT_PUBLIC_CUSTOMER_NIC,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
