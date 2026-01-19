import extractZip from "extract-zip";
import fs from "fs/promises";
import path from "path";
import { getCliAssetPath } from "../utils/asset-utils.js";
import { fsu } from "../utils/file-utils.js";
import { getResourcesDir } from "../utils/paths.js";
import { resolveResourceGroupFolder } from "../utils/resource-utils.js";

export type GeneratedAssetName = "builders" | "server_cfg";

export type GeneratedAssetType = "file" | "zip";

export const GENERATED_ASSET_PATHS: Record<
  GeneratedAssetName,
  { path: string; type: GeneratedAssetType }
> = {
  builders: {
    path: "builders.zip",
    type: "zip",
  },
  server_cfg: {
    path: "default.server.cfg",
    type: "file",
  },
};

export async function installGeneratedAsset(
  type: GeneratedAssetName,
  target: string,
  overwrite: boolean = false,
) {
  const assetData = GENERATED_ASSET_PATHS[type];
  const assetPath = getCliAssetPath(assetData.path);

  if (!(await fsu.pathExists(assetPath)))
    throw new Error(`Generated asset "${type}" does not exist!`);

  if (assetData.type === "file") {
    if (await fsu.pathExists(target)) {
      if (!overwrite) throw new Error(`File already exists at path: ${target}`);

      await fsu.remove(target);
    }
    await fs.copyFile(assetPath, target);
    return;
  }

  if (assetData.type === "zip") {
    if (!(await fsu.pathExists(target))) {
      await fsu.ensureDir(target);
    } else if (!(await fsu.isDir(target))) {
      throw new Error(`Target path is not a directory: ${target} ${type}`);
    }

    if (!(await fsu.isEmpty(target))) {
      if (!overwrite)
        throw new Error(`Target directory is not empty: ${target} ${type}`);
      await fsu.emptyDir(target);
    }

    await extractZip(assetPath, { dir: target });
  }
}

export async function installGeneratedBuilders(
  target: string,
  overwrite: boolean = false,
) {
  const validation = await resolveResourceGroupFolder(target);

  if (!validation.valid) throw new Error(validation.reason);

  await installGeneratedAsset("builders", validation.path, overwrite);
}

export async function installGeneratedServerDefault(
  overwrite: boolean = false,
) {
  const resourcesDir = await getResourcesDir();

  await installGeneratedAsset(
    "server_cfg",
    path.join(resourcesDir, "server.cfg"),
  );
}
