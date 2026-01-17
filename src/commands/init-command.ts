import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { fsu } from "../utils/file-utils.js";
import { getDevDir } from "../utils/paths.js";
import { isInProject } from "../utils/project-root.js";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";

export class InitCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    program
      .command("init")
      .description("Initialize a new project")
      .option(
        "-n, --no-install",
        "Do no install the server binaries after config completion",
      )
      .action(async (options: { install: boolean }) => {
        if (await isInProject()) {
          console.print(chalk.red("Project already initialized!"));
          const response = await confirm({
            message:
              "Are you sure you want to continue? All project data will be erased!",
          });

          if (!response) return;

          await fsu.remove(await getDevDir());
        }
        await this.ensureProject(ctx);
      });
  }
}
