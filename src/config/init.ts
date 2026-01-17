import { input, select } from "@inquirer/prompts";
import { configExists, saveConfig } from "./load-config.js";
import path from "path";
import { fsu } from "../utils/file-utils.js";
import { AppConfig } from "./schema.js";
import { findProjectRoot } from "../utils/project-root.js";
import { LAYOUT } from "../constants/layout.js";

export async function runInitWizard() {
  const cwd = process.cwd();

  const projectParentPath = await input({
    message: "Absolute path to project root:",
    default: cwd,
    required: true,
  });

  await fsu.ensureDir(projectParentPath);
  const devDir = path.join(projectParentPath, LAYOUT.DEV_DIR);

  const answers = {
    serverBinaries: await input({
      message: "Absolute path to server binaries (must be empty):",
      default: path.join(projectParentPath, "binaries"),
      required: true,
    }),
    resources: await input({
      message: "Absolute path to resources folder:",
      default: path.join(projectParentPath, "resources"),
      required: true,
    }),
    devPlatform: await select({
      message: "FiveM dev server platform:",
      choices: [
        {
          name: "Windows",
          value: "windows",
        },
        {
          name: "Linux",
          value: "linux",
        },
      ],
    }),
    releasePlatform: await select({
      message: "FiveM release server platform (for project release):",
      choices: [
        {
          name: "Windows",
          value: "windows",
        },
        {
          name: "Linux",
          value: "linux",
        },
      ],
    }),
    namespace: await input({
      message: "Type project namespace (for use in development):",
      required: true,
    }),
  };

  await fsu.ensureDir(answers.serverBinaries);
  await fsu.ensureDir(answers.resources);
  await fsu.ensureDir(devDir);

  await saveConfig({
    paths: {
      serverBinaries: answers.serverBinaries,
      resources: answers.resources,
    },
    startupArgs: {
      dev: [],
      release: [],
    },
    fiveM: {
      devPlatform: answers.devPlatform as AppConfig["fiveM"]["devPlatform"],
      releasePlatform:
        answers.releasePlatform as AppConfig["fiveM"]["releasePlatform"],
      releaseChannel: "latest",
      autoUpdateIntervalMs: 1000 * 60 * 60 * 24 * 7,
    },
    types: {
      namespace: answers.namespace,
    },
  });

  for (const key of Object.keys(LAYOUT.DIRS)) {
    await fsu.ensureDir(
      path.join(devDir, LAYOUT.DIRS[key as keyof typeof LAYOUT.DIRS]),
    );
  }
}

export async function ensureInitialized() {
  try {
    await findProjectRoot();
    if (await configExists()) return;
  } catch {
    // proceed...
  }

  await runInitWizard();
}
