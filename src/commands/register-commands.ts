import { Command } from "commander";
import { CommandContext } from "./command-context.js";
import { COMMANDS } from "./index.js";

export function registerCommands(program: Command, ctx: CommandContext): void {
  for (const cmd of COMMANDS) {
    cmd.register(program, ctx);
  }
}
