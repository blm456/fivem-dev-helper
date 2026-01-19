import path from "path";
import { findProjectRoot } from "./project-root.js";
import { LAYOUT } from "../constants/layout.js";
import { loadConfig } from "../config/load-config.js";

export async function getProjectRoot() {
  return await findProjectRoot();
}

export async function getDevDir() {
  return path.join(await getProjectRoot(), LAYOUT.DEV_DIR);
}

export async function getConfigPath() {
  return path.join(await getDevDir(), LAYOUT.FILES.CONFIG);
}

export async function getCacheDir() {
  return path.join(await getDevDir(), LAYOUT.DIRS.CACHE);
}

export async function getCompiledDir() {
  return path.join(await getDevDir(), LAYOUT.DIRS.COMPILED);
}

export async function getDevStatePath() {
  return path.join(await getDevDir(), LAYOUT.FILES.DEV_SERVER_STATE);
}

export async function getServerBinaries() {
  const cfg = await loadConfig();
  return cfg.paths.serverBinaries;
}

export async function getResourcesDir() {
  const cfg = await loadConfig();
  return cfg.paths.resources;
}

export async function getCfgPresetDir() {
  return path.join(await getDevDir(), LAYOUT.DIRS.CFG_FILES);
}

export async function getResourcesServerCfgPath() {
  return path.join(await getResourcesDir(), "server.cfg");
}

export async function getCfgPresetPath(name: string) {
  return path.join(await getCfgPresetDir(), `${name}.cfg`);
}

export async function getTmpDir() {
  return path.join(await getDevDir(), LAYOUT.DIRS.TMP);
}

export async function getUpdateStatePath() {
  return path.join(await getDevDir(), LAYOUT.FILES.UPDATE_STATE);
}

export async function getDevRuntimeDir() {
  return path.join(await getCacheDir(), LAYOUT.DIRS.DEV_RUNTIME);
}

export async function getTemplateStatePath() {
  return path.join(await getDevDir(), LAYOUT.FILES.TEMPLATE_STATE);
}

export async function getTemplatesDir() {
  return path.join(await getDevDir(), LAYOUT.DIRS.TEMPLATES);
}
