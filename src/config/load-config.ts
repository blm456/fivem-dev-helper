import { existsSync } from "fs";
import { fsu } from "../utils/file-utils.js";
import { AppConfig, AppConfigSchema } from "./schema.js";
import { getConfigPath, getProjectRoot } from "../utils/paths.js";

export async function loadConfig(): Promise<AppConfig> {
  const configPath = await getConfigPath();
  const raw = await fsu.readJson(configPath);
  return AppConfigSchema.parse(raw);
}

export async function saveConfig(config: AppConfig) {
  const configPath = await getConfigPath();
  await fsu.ensureDir(await getProjectRoot());
  await fsu.writeJson(configPath, config);
}

export async function configExists() {
  const configPath = await getConfigPath();
  // TODO: Check config values for accuracy (ie. resource path exists, serverCfg resources exist, etc.)
  return existsSync(configPath);
}
