import path from "path";
import { loadConfig } from "../config/load-config.js";
import { fsu } from "../utils/file-utils.js";
import fs from "fs/promises";
import { getTemplatesDir, getTmpDir } from "../utils/paths.js";
import {
  downloadLatestReleaseZip,
  fetchLatestTemplateArtifact,
} from "./artifacts.js";
import { loadTemplateState, saveTemplateState } from "./state.js";
import ora from "ora";

export interface TemplateCheckOptions {
  force?: boolean;
  ignoreTimeCheck?: boolean;
  installIfNew?: boolean;
}

export async function checkForTemplateUpdates(
  ops: TemplateCheckOptions = {},
): Promise<{
  checked: boolean;
  updated: boolean;
  currentVersion?: string;
  latestVersion?: string;
  message: string;
}> {
  const config = await loadConfig();
  const state = await loadTemplateState();

  const now = Date.now();
  const interval = config.fiveM.autoUpdateIntervalMs;

  if (!ops.force && !ops.ignoreTimeCheck && interval && interval > 0) {
    const last = state.lastCheck ?? 0;
    if (now - last < interval) {
      return {
        checked: false,
        updated: false,
        message: "Auto template update not due yet.",
      };
    }
  }

  state.lastCheck = now;
  await saveTemplateState(state);

  const spinner = ora({
    text: "Fetching latest template version...",
    hideCursor: true,
    indent: 1,
  });

  spinner.start();

  const latestArtifact = await fetchLatestTemplateArtifact();

  const installedVersion = state.installed?.tag_name;
  const isNew = installedVersion !== latestArtifact.tag_name;

  if (!isNew && !ops.force) {
    spinner.stop();
    return {
      checked: true,
      updated: false,
      currentVersion: installedVersion,
      latestVersion: latestArtifact.tag_name,
      message: `No template updates available (${latestArtifact.tag_name})`,
    };
  }

  if (!ops.installIfNew && !ops.force) {
    spinner.stop();
    return {
      checked: true,
      updated: false,
      currentVersion: installedVersion,
      latestVersion: latestArtifact.tag_name,
      message: `Template update available: ${installedVersion ?? "none"} -> ${latestArtifact.tag_name}`,
    };
  }

  const tmpDir = await getTmpDir();
  await fsu.ensureDir(tmpDir);

  spinner.text = "Downloading templates update...";

  const result = await downloadLatestReleaseZip({
    outputDir: tmpDir,
    releaseData: latestArtifact,
  });

  spinner.text = "Installing template update...";

  const templateDir = await getTemplatesDir();
  await fsu.ensureDir(templateDir);

  // Move downloaded zips
  for (const installedZip of result.downloaded) {
    const templatePath = path.join(templateDir, installedZip.filename);

    if (await fsu.pathExists(templatePath)) await fsu.remove(templatePath);

    await fs.copyFile(installedZip.path, templatePath);
    await fsu.remove(installedZip.path);
  }

  state.installed = {
    installedAt: now,
    tag_name: latestArtifact.tag_name,
  };
  await saveTemplateState(state);

  spinner.stop();
  return {
    checked: true,
    updated: true,
    currentVersion: installedVersion,
    latestVersion: latestArtifact.tag_name,
    message: `Updated templates to ${latestArtifact.tag_name}`,
  };
}

export async function checkTemplatesAutoUpdate() {
  const res = await checkForTemplateUpdates({
    force: false,
    installIfNew: true,
  });

  if (res.checked) console.log("[Auto Template Updater]", res.message);
}
