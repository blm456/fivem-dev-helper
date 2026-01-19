import path from "path";
import { findProjectRoot } from "./project-root.js";
import { LAYOUT } from "../constants/layout.js";
import { loadConfig } from "../config/load-config.js";

export type TypesDirData = {
  base: string;
  client: string;
  server: string;
  shared: string;
};

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

export async function getTypesDir() {
  const typeDir = path.join(await getDevDir(), "types");

  return {
    base: typeDir,
    client: path.join(typeDir, "client"),
    server: path.join(typeDir, "server"),
    shared: path.join(typeDir, "shared"),
  };
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

export function isPathChild(
  target: string,
  parent: string,
  isRelative: boolean,
  includeSelf: boolean = true,
) {
  let relativeTarget = target;
  let absoluteTarget = target;

  if (!isRelative) relativeTarget = path.relative(parent, target);
  if (isRelative) absoluteTarget = path.join(parent, target);

  if (absoluteTarget === parent) {
    return includeSelf;
  }

  if (relativeTarget.startsWith("..")) return false;

  return true;
}
