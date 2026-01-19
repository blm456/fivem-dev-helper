import { fsu, pathExists } from "../utils/file-utils.js";
import { promises as fs } from "fs";
import {
  getCfgPresetDir,
  getCfgPresetPath,
  getResourcesServerCfgPath,
} from "../utils/paths.js";
import path from "path";
import { installCliAssetToPath } from "../utils/asset-utils.js";

export function validatePresetName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Preset name is required");
  if (trimmed.length > 64)
    throw new Error("Preset name cannot be longer than 64 characters");
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed))
    throw new Error(
      `Invalid preset name. Use only letters, numbers, ".", "_", or ".".`,
    );
  if (trimmed === "." || trimmed === "..")
    throw new Error("Invalid preset name");
  return trimmed;
}

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function listCfgPresets() {
  const dir = await getCfgPresetDir();
  if (!(await fsu.pathExists(dir))) return [];

  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".cfg"))
    .map((e) => e.name.slice(0, -4))
    .sort((a, b) => a.localeCompare(b));
}

export async function doesCfgPresetExist(nameRaw: string) {
  const name = validatePresetName(nameRaw);

  const presetDir = await getCfgPresetDir();
  await fsu.ensureDir(presetDir);

  const sourceCfgPath = await getResourcesServerCfgPath();
  return await fsu.pathExists(sourceCfgPath);
}

export async function saveCfgPresetFromResources(
  nameRaw: string,
  opts?: { overwrite?: boolean },
) {
  const name = validatePresetName(nameRaw);

  const presetDir = await getCfgPresetDir();
  await fsu.ensureDir(presetDir);

  const sourceCfgPath = await getResourcesServerCfgPath();
  if (!(await fsu.pathExists(sourceCfgPath)))
    throw new Error(
      `No server.cfg found in resources folder: ${sourceCfgPath}`,
    );

  const targetPresetPath = await getCfgPresetPath(name);
  if (!opts?.overwrite && (await pathExists(targetPresetPath)))
    throw new Error(
      "Preset already exists with that path and overwriting is false",
    );

  const content = await fs.readFile(sourceCfgPath, "utf8");
  await fs.writeFile(targetPresetPath, content, "utf8");
  return targetPresetPath;
}

export async function loadCfgPresetToResources(
  nameRaw: string,
): Promise<{ presetPath: string; targetPath: string; backupPath?: string }> {
  const name = validatePresetName(nameRaw);

  const presetPath = await getCfgPresetPath(name);
  if (!(await pathExists(presetPath))) {
    throw new Error(`Preset "${name}" not found at: ${presetPath}`);
  }

  const targetPath = await getResourcesServerCfgPath();
  await fsu.ensureDir(path.dirname(targetPath));

  let backupPath: string | undefined;
  if (await pathExists(targetPath)) {
    backupPath = `${targetPath}.bak.${nowStamp()}`;
    await fs.copyFile(targetPath, backupPath);
  }

  const content = await fs.readFile(presetPath, "utf8");
  await fs.writeFile(targetPath, content, "utf8");

  return { presetPath, targetPath, backupPath };
}

export async function deleteCfgPreset(nameRaw: string): Promise<void> {
  const name = validatePresetName(nameRaw);
  const presetPath = await getCfgPresetPath(name);

  if (!(await pathExists(presetPath))) {
    throw new Error(`Preset "${name}" not found.`);
  }
  await fsu.remove(presetPath);
}

export async function loadDefaultCfgFile() {
  const targetPath = await getResourcesServerCfgPath();
  await fsu.ensureDir(path.dirname(targetPath));

  let backupPath: string | undefined;
  if (await pathExists(targetPath)) {
    backupPath = `${targetPath}.bak.${nowStamp()}`;
    await fs.copyFile(targetPath, backupPath);
  }

  await installCliAssetToPath("default.server.cfg", targetPath);

  return { targetPath, backupPath };
}
