import fs from "fs/promises";
import extractZip from "extract-zip";
import { ensureDir, fsu } from "../utils/file-utils.js";
import { LatestArtifact } from "./artifacts.js";
import path from "path";
import { execa } from "execa";

export interface InstallOptions {
  targetDir: string;
  tmpDir: string;
}

async function safeSwapDir(stagedDir: string, targetDir: string) {
  const stamp = Date.now();
  const oldDir = `${targetDir}.old.${stamp}`;

  try {
    await fs.access(targetDir);
    await fs.rename(targetDir, oldDir);
  } catch {
    // No existing targetDir
  }

  await fs.rename(stagedDir, targetDir);

  try {
    await fsu.remove(oldDir);
  } catch {
    // Ignore
  }
}

export async function installArtifact(
  artifact: LatestArtifact,
  archivePath: string,
  opts: InstallOptions,
) {
  await ensureDir(opts.tmpDir);

  const staging = path.join(
    opts.tmpDir,
    `stage-${artifact.platform}-${Date.now()}`,
  );
  await fsu.ensureDir(staging);

  if (artifact.platform === "windows") {
    await extractZip(archivePath, { dir: staging });
    await safeSwapDir(staging, opts.targetDir);
    return;
  }

  // TODO: Replace with unzipper to ensure functionality
  // Requires tar available (standard on most distributions)
  await execa("tar", ["-xJf", archivePath, "-C", staging], {
    stdio: "inherit",
  });
  await safeSwapDir(staging, opts.targetDir);
}
