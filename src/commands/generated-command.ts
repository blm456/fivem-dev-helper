import { Command } from "commander";
import { installGeneratedBuilders } from "../templates/generated.js";
import { AppSpinner } from "../utils/spinner-utils.js";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";

export class GeneratedCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    const generated = program
      .command("generated")
      .description("Install generated assets into your resource folder.");

    generated
      .command("builders")
      .description(
        "Installs builders scripts for webpack that disables building if '\"fivemIgnore\": true' is in the resource package.json",
      )
      .option(
        "-o, --overwrite",
        "Overwrites previously installed resources in the group folder.",
        false,
      )
      .argument(
        "<path>",
        "The path relative to your resources folder to install the builders to (Each folder must be a group folder with it's name in square brackets).",
      )
      .action(
        this.commandAction(
          async (path: string, options: { overwrite?: boolean }) => {
            const spinner = new AppSpinner("Installing builders...", true);
            try {
              await installGeneratedBuilders(path, options.overwrite);
            } catch (err) {
              spinner.stop();
              throw err;
            }
            spinner.stop();

            console.print(`Installed builders to: ${path}`);
            console.print(
              `\nAdding the builders to your server.cfg is not required. FiveM auto starts these as needed.`,
            );
          },
        ),
      );
  }
}
