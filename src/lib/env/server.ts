import { z } from "zod";

const serverEnvironmentSchema = z.object({
  APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).default("info"),
  FIREBASE_CONFIG: z.string().optional(),
  FIREBASE_WEBAPP_CONFIG: z.string().optional(),
  K_SERVICE: z.string().optional(),
  GIT_COMMIT_SHA: z.string().optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  return serverEnvironmentSchema.parse({
    APP_ENV: process.env.APP_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
    FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG,
    K_SERVICE: process.env.K_SERVICE,
    GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA,
  });
}
