import { z } from "zod";
import { ApiError } from "./errors";
import { logger } from "./logger";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(15),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),
  APP_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  DEFAULT_ADMIN_EMAIL: z.string().email(),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8),
  DEFAULT_ADMIN_NAME: z.string().min(1).default("Super Admin"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN_MINUTES: process.env.JWT_ACCESS_EXPIRES_IN_MINUTES,
    JWT_REFRESH_EXPIRES_IN_DAYS: process.env.JWT_REFRESH_EXPIRES_IN_DAYS,
    APP_URL: process.env.APP_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
    DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME ?? "Super Admin",
  });

  if (!parsed.success) {
    const invalidKeys = parsed.error.issues.map((issue) => issue.path.join("."));
    logger.error("Server environment configuration is invalid", { invalidKeys });
    throw new ApiError(500, "SERVER_MISCONFIGURED", "Server environment configuration is invalid");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_target, property) {
    return loadEnv()[property as keyof Env];
  },
});
