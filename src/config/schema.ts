import { z } from "zod";

export const AppConfigSchema = z.object({
  paths: z.object({
    serverBinaries: z.string(),
    resources: z.string(),
  }),
  startupArgs: z.object({
    dev: z.array(z.string()),
    release: z.array(z.string()),
  }),
  fiveM: z.object({
    devPlatform: z.enum(["windows", "linux"]),
    releasePlatform: z.enum(["windows", "linux"]),
    releaseChannel: z.enum(["latest", "recommended", "optional", "critical"]),
    autoUpdateIntervalMs: z.number().optional(),
    latestUpdateCheck: z.number().optional(),
  }),
  types: z.object({
    namespace: z.string(),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
