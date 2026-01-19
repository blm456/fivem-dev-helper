import { Command } from "commander";
import { CommandContext } from "./command-context.js";
import { findProjectRoot } from "../utils/project-root.js";

export abstract class BaseCommand {
  abstract register(program: Command, ctx: CommandContext): void;

  /** Requires the project to be initialized, otherwise an error is thrown */
  protected async requireProject(ctx: CommandContext) {
    try {
      await findProjectRoot();
    } catch {
      throw new Error(
        "This command requires initialization before being called. Run `fivem-dev init` first.",
      );
    }
  }

  protected async ensureProject(ctx: CommandContext) {
    await ctx.ensureInitialized();
  }

  protected commandAction(handler: (...args: any[]) => Promise<void>) {
    return (...args: any) => {
      void handler(...args).catch((err) => {
        if (!(err instanceof Error) || err.name !== "ExitPromptError") {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(msg);
          process.exit(1);
        }
      });
    };
  }
}
