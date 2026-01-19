import { Command } from "commander";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";
import { getAllTypedResources } from "../typegen/generate.js";

export class TypesCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    program
      .command("types")
      .description("Generate shared types for use across your project")
      .action(
        this.commandAction(async () => {
          await getAllTypedResources();
        }),
      );
  }
}
