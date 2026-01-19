import { input } from "@inquirer/prompts";
import chalk from "chalk";
import extractZip from "extract-zip";
import path from "path";
import { loadConfig } from "../config/load-config.js";
import { templateMenu } from "../menus/template-menu.js";
import { selectFolder } from "../utils/file-selector.js";
import { fsu } from "../utils/file-utils.js";
import { getTemplatesDir } from "../utils/paths.js";
import { AppSpinner } from "../utils/spinner-utils.js";
import { ARTIFACT_TEMPLATE_ZIP, TemplateType } from "./artifacts.js";

export async function isTemplateChildPathValid(
  relativePath: string,
): Promise<{ valid: true } | { valid: false; reason: string }> {
  // Load config for resources folder
  const config = await loadConfig();

  // Check relative path formatting
  if (!/^(\[[a-zA-Z0-9-_]+\][\/\\])*([a-zA-Z0-9-_/])+$/.test(relativePath)) {
    return {
      valid: false,
      reason:
        "Invalid path. Path to resource can only be a child of the resource folder, any parent folders must be wrapped in square brackets, and the install folder must not be wrapped in square brackets.",
    };
  }

  // Get the absolute location from the relative path
  const absolutePath = path.join(config.paths.resources, relativePath);
  await fsu.ensureDir(absolutePath);

  // Check if the path is empty
  if (!(await fsu.isEmpty(absolutePath))) {
    return { valid: false, reason: "Path is not empty" };
  }

  return { valid: true };
}

export async function installTemplate(type: TemplateType, target: string) {
  // Load template directory
  const templatesDir = await getTemplatesDir();

  // Ensure templates dir and target dir exist
  await fsu.ensureDir(templatesDir);
  await fsu.ensureDir(target);

  // Join template archive path
  const templatePath = path.join(templatesDir, ARTIFACT_TEMPLATE_ZIP[type]);

  // Ensure template archive exists
  if (!(await fsu.pathExists(templatePath))) {
    throw new Error(`Could not find template files for: ${type}`);
  }

  // Perform extraction
  extractZip(templatePath, { dir: target });
}

/** Guides through the folder selection process for a template */
export async function selectTemplateLocation() {
  // Load config for resources folder
  const config = await loadConfig();

  // Prompt for base path input
  const selection = await selectFolder(config.paths.resources);

  // Check base path is in resources folder
  const relativePath = path.relative(config.paths.resources, selection.path);
  if (
    selection.path !== config.paths.resources && // Selection is not the resources folder
    relativePath.startsWith("..") // And the selection relative to resources folder has to go up a level
  ) {
    throw new Error(
      "Template must be created inside of your resources folder!",
    );
  }

  // Prompt for groups/resource name
  const installRelative = await input({
    message: `Define relative path to put the template in. ${chalk.gray('(Can not contain spaces or any other character besides alphanumeric, "-", or "_")')}`,
    required: true,
  });

  // Check the sub-folder is formatted correctly and empty
  const pathValid = await isTemplateChildPathValid(
    path.relative(
      config.paths.resources,
      path.join(selection.path, installRelative),
    ),
  );
  if (!pathValid.valid) {
    throw new Error(
      `Invalid relative path: ${installRelative}. Reason: ${pathValid.reason}`,
    );
  }

  // Join the base path and groups/resource name
  return path.join(selection.path, installRelative);
}

export async function runTemplateInstallationWizard(
  template: { name: TemplateType; path: string },
  opts: { showBack: boolean; showUpdate: boolean },
) {
  // Show instructions
  console.print(chalk.underline.bold("Steps to use:"));
  console.print(chalk.green("1)"), "Select starting directory");
  console.print(
    chalk.green("2)"),
    "Define relative path to put template in. (ex. '[core]/emergency' or 'chat')\n",
  );

  // Init spinner
  const spinner = new AppSpinner();

  try {
    // Select path
    const selectionPath = await selectTemplateLocation();

    // Start spinner
    spinner.update(
      `Installing ${template.name} template to: ${selectionPath}...`,
    );
    spinner.start();

    // Perform install
    await installTemplate(template.name, selectionPath);

    // Stop the spinner
    spinner.stop();

    // Show completed message
    console.print(`Installed ${template.name} template to: ${selectionPath}`);
  } catch (err) {
    // Stop spinner if active
    if (spinner.running) spinner.stop();

    // Display error message
    console.error(err instanceof Error ? err.message : err);

    // Redisplay template menu
    await templateMenu(opts.showBack, opts.showUpdate);
  }
}
