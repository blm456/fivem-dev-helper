import { Command } from "commander";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";

export class RunCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    program
      .command("run")
      .description(
        "Runs the CL-UI portion of the application (same as not passing any command)",
      )
      .action(
        this.commandAction(async () => {
          await ctx.run();
        }),
      );
  }
}
