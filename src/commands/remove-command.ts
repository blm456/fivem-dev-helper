import { Command } from "commander";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";
import { confirm } from "@inquirer/prompts";
import { fsu } from "../utils/file-utils.js";
import { getDevDir } from "../utils/paths.js";

export class RemoveCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    program
      .command("remove")
      .description("Removes all fivem-dev project data")
      .action(
        this.commandAction(async () => {
          await this.requireProject(ctx);
          const isSure = await confirm({
            message:
              "Are you sure you want to remove fivem-dev data? This action is not reversible.",
          });

          if (isSure) {
            await fsu.remove(await getDevDir());
            console.print("All fivem-dev data deleted for project");
          }
        }),
      );
  }
}
