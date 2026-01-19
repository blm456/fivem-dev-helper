import chalk from "chalk";
import { Command, Option } from "commander";
import path from "path";
import { loadConfig } from "../config/load-config.js";
import { templateMenu } from "../menus/template-menu.js";
import { getTemplateList, getTemplateVersion } from "../templates/artifacts.js";
import {
  installTemplate,
  isTemplateChildPathValid,
} from "../templates/install.js";
import { checkForTemplateUpdates } from "../templates/updater.js";
import { fsu } from "../utils/file-utils.js";
import { AppSpinner } from "../utils/spinner-utils.js";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";

export class TemplateCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    const template = program
      .command("template")
      .description("Use FiveM script templates");

    template
      .command("list")
      .description("List available templates to use")
      .action(
        this.commandAction(async () => {
          this.requireProject(ctx);

          // Get list of templates
          const templateList = await getTemplateList();

          // Show if no templates installed
          if (templateList.length === 0) {
            console.print("No templates installed.");
            return;
          }

          // Print template list
          console.print(chalk.underline("\nAvailable templates:"));
          for (const type of templateList) {
            console.print("*", type.name);
          }
        }),
      );

    template
      .command("version")
      .description("Displays the version of currently installed templates")
      .action(
        this.commandAction(async () => {
          this.requireProject(ctx);

          console.print(`Templates version: ${await getTemplateVersion()}`);
        }),
      );

    template
      .command("update")
      .description("Check for update in template files")
      .addOption(
        new Option(
          "--no-install",
          "Only checks for an update but will not install it",
        ).default(true),
      )
      .addOption(
        new Option(
          "-f, --force",
          "Forces the update even if the same version is installed",
        ).default(false),
      )
      .action(
        this.commandAction(
          async ({ install, force }: { install: boolean; force: boolean }) => {
            this.requireProject(ctx);

            // Check for template update
            const res = await checkForTemplateUpdates({
              force,
              installIfNew: install,
              ignoreTimeCheck: true,
            });
            console.print("[Auto Template Updater]", res.message);
          },
        ),
      );

    template
      .command("use")
      .description(
        "Create a new resource using a specified template. Not passing options will show the menu.",
      )
      .option(
        "-t, --template <template>",
        "The template to create the new resource with. Must be used with --path",
      )
      .option(
        "-p, --path <path>",
        "The path relative to the project resource folder to install the template in. Must be used with --template",
      )
      .action(
        this.commandAction(
          async ({
            template,
            path: rawPath,
          }: {
            template?: string;
            path?: string;
          }) => {
            if (
              // If neither options are passed, run the menu
              (typeof template !== "string" && typeof rawPath !== "string") ||
              (!template && !rawPath)
            ) {
              return await templateMenu(false, false);
            } else if (
              // If one option is passed, show an error
              (typeof template === "string" && typeof rawPath !== "string") ||
              (typeof template !== "string" && typeof rawPath === "string")
            ) {
              console.print(
                chalk.red(
                  "Template and path must both be specified if not using the menu.",
                ),
              );
              return;
            }

            /** COMMAND LINE CREATION */

            // Load the config and list of templates
            const config = await loadConfig();
            const templates = await getTemplateList();

            // Validate path
            const pathValid = await isTemplateChildPathValid(rawPath!);
            if (!pathValid.valid) {
              console.print(
                chalk.red(`Invalid path! Reason: ${pathValid.reason}`),
              );
              return;
            }

            // Validate template
            const templateData = templates.filter(
              (t) => t.name === template,
            )[0];
            if (!templateData) {
              console.print(
                chalk.red(
                  `Invalid template supplied. List of templates: ${templates.map((t) => t.name).join(", ")}`,
                ),
              );
              return;
            }

            // Get the absolute installation path
            const installPath = path.join(config.paths.resources, rawPath!);

            // Ensure the directory exists (Should already be called in validate template path)
            await fsu.ensureDir(installPath);

            // Start the spinner
            const spinner = new AppSpinner(
              `Installing template to: ${installPath}...`,
              true,
            );

            try {
              // Perform the install
              await installTemplate(templateData.name, installPath);

              // Stop the spinner
              spinner.stop();

              // Show completed message
              console.print(
                `Installed ${templateData.name} template to: ${installPath}`,
              );
            } catch (err) {
              // Stop spinner if active
              if (spinner.running) spinner.stop();

              // Display error message
              console.error(err instanceof Error ? err.message : err);
            }
          },
        ),
      );
  }
}
