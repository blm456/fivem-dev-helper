import { input } from "@inquirer/prompts";
import chalk from "chalk";
import extractZip from "extract-zip";
import path from "path";
import { loadConfig } from "../config/load-config.js";
import { selectFolder } from "../utils/file-selector.js";
import { fsu } from "../utils/file-utils.js";
import { getTemplatesDir } from "../utils/paths.js";
import { ARTIFACT_TEMPLATE_ZIP, TemplateType } from "./artifacts.js";

export async function installTemplate(type: TemplateType, target: string) {
  const templatesDir = await getTemplatesDir();
  await fsu.ensureDir(templatesDir);
  await fsu.ensureDir(target);

  const templatePath = path.join(templatesDir, ARTIFACT_TEMPLATE_ZIP[type]);

  if (!(await fsu.pathExists(templatePath))) {
    throw new Error(`Could not find template files for: ${type}`);
  }

  extractZip(templatePath, { dir: target });
}

/** Guides through the folder selection process for a template */
export async function selectTemplateLocation() {
  const config = await loadConfig();
  const selection = await selectFolder(config.paths.resources);

  // Check path is in resources folder
  const relativePath = path.relative(config.paths.resources, selection.path);
  if (
    selection.path !== config.paths.resources &&
    relativePath.startsWith("..")
  ) {
    throw new Error(
      "Template must be created inside of your resources folder!",
    );
  }

  const installRelative = await input({
    message: `Define relative path to put the template in. ${chalk.gray('(Can not contain spaces or any other character besides alphanumeric, "-", or "_")')}`,
    required: true,
  });

  // Check the sub-folder is formatted correctly
  if (!/^(\[[a-zA-Z0-9-_]+\][\/\\])*([a-zA-Z0-9-_/])+$/.test(installRelative)) {
    throw new Error(`Invalid relative path: ${installRelative}`);
  }

  const installPath = path.join(config.paths.resources, installRelative);

  return installPath;
}
