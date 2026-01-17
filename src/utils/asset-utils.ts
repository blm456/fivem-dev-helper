import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { ensureDir, fsu } from "./file-utils.js";

export function getCliAssetPath(relativePathFromPackageRoot: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const packageRoot = path.resolve(__dirname, "..", "..");

  return path.join(packageRoot, "assets", relativePathFromPackageRoot);
}

export async function installCliAssetToPath(
  assetPathFromAssets: string,
  target: string,
) {
  const assetPath = getCliAssetPath(assetPathFromAssets);

  if (!(await fsu.pathExists(assetPath)))
    throw new Error(
      `Unresolved asset path (${assetPathFromAssets}): ${assetPath}`,
    );
  await ensureDir(path.dirname(target));

  await fs.copyFile(assetPath, target);
}
