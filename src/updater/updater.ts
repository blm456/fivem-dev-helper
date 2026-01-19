import ora from "ora";
import path from "path";
import { loadConfig } from "../config/load-config.js";
import { fsu } from "../utils/file-utils.js";
import { getTmpDir } from "../utils/paths.js";
import { fetchLatestArtifact, ReleaseTier } from "./artifacts.js";
import { downloadFile } from "./download.js";
import { installArtifact } from "./install.js";
import { loadUpdateState, saveUpdateState } from "./state.js";

export interface CheckOptions {
  force?: boolean;
  ignoreTimeCheck?: boolean;
  installIfNew?: boolean;
  tierOverride?: ReleaseTier;
}

function mapConfigToTier(releaseChannel: string | undefined): ReleaseTier {
  const v = (releaseChannel ?? "latest").toLowerCase();
  if (v === "critical") return "critical";
  if (v === "recommended") return "recommended";
  if (v === "optional") return "optional";
  return "latest";
}

export async function checkForUpdates(opts: CheckOptions = {}): Promise<{
  checked: boolean;
  updated: boolean;
  currentVersion?: string;
  latestVersion?: string;
  message: string;
}> {
  const config = await loadConfig();
  const state = await loadUpdateState();

  const now = Date.now();
  const interval = config.fiveM.autoUpdateIntervalMs;

  if (!opts.force && !opts.ignoreTimeCheck && interval && interval > 0) {
    const last = state.lastCheck ?? 0;
    if (now - last < interval) {
      return {
        checked: false,
        updated: false,
        message: "Auto-update check not due yet.",
      };
    }
  }

  state.lastCheck = now;
  await saveUpdateState(state);

  const platform = config.fiveM.devPlatform;
  const tier =
    opts.tierOverride ?? mapConfigToTier(config.fiveM.releaseChannel);

  const spinner = ora({
    text: "Fetching artifacts...",
    hideCursor: true,
    indent: 1,
  });

  spinner.start();
  const latest = await fetchLatestArtifact(platform, tier);

  const installedVersion = state.installed?.version;
  const isNew = installedVersion !== latest.version;

  if (!isNew && !opts.force) {
    spinner.stop();
    return {
      checked: true,
      updated: false,
      currentVersion: installedVersion,
      latestVersion: latest.version,
      message: `No update available (${tier} ${latest.version})`,
    };
  }

  if (!opts.installIfNew && !opts.force) {
    spinner.stop();
    return {
      checked: true,
      updated: false,
      currentVersion: installedVersion,
      latestVersion: latest.version,
      message: `Update available (${tier}): ${installedVersion ?? "none"} -> ${latest.version}`,
    };
  }

  const tmpDir = await getTmpDir();
  await fsu.ensureDir(tmpDir);

  const archivePath = path.join(
    tmpDir,
    `${latest.platform}-${latest.tier}-${latest.version}-${latest.filename}`,
  );

  spinner.text = "Downloading update...";
  await downloadFile(latest.url, archivePath);

  spinner.text = "Installing update...";
  await installArtifact(latest, archivePath, {
    targetDir: config.paths.serverBinaries,
    tmpDir,
  });

  state.installed = {
    platform: latest.platform,
    channel: latest.tier,
    version: latest.version,
    url: latest.url,
    installedAt: now,
  };
  await saveUpdateState(state);

  await fsu.remove(archivePath);

  spinner.stop();
  return {
    checked: true,
    updated: true,
    currentVersion: installedVersion,
    latestVersion: latest.version,
    message: `Updated to ${tier} ${latest.version}.`,
  };
}

export async function checkAutoUpdate() {
  const res = await checkForUpdates({ force: false, installIfNew: true });

  if (res.checked) {
    console.log("[Auto FiveM Updater]", res.message);
  }
}
