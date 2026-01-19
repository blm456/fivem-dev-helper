import { Command } from "commander";
import { CommandContext } from "./commands/command-context.js";
import { registerCommands } from "./commands/register-commands.js";
import { ensureInitialized } from "./config/init.js";
import { mainMenu } from "./menus/main-menu.js";
import { checkAutoUpdate } from "./updater/updater.js";
import { initializeLogging } from "./utils/logging.js";

async function run() {
  // Pre Command Init
  const program = new Command();
  program
    .name("fivem-dev")
    .description("FiveM Dev Helper CLI")
    .option("-v, --verbose", "Enable verbose output");

  // Define command context
  const ctx = {
    program,
    get verbose() {
      return Boolean(program.opts().verbose);
    },
    ensureInitialized: async () => ensureInitialized(),
    openMenu: async () => mainMenu(),
    run: async () => {
      await ensureInitialized();
      await checkAutoUpdate();
      await mainMenu();
    },
  } satisfies CommandContext;

  // Initialize logging
  initializeLogging(ctx);

  // Register Commands
  registerCommands(program, ctx);

  // Parse without exiting the process on errors
  program.exitOverride();

  // Default behavior with no args
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    ctx.run();
    return;
  }

  // Parse commands
  await program.parseAsync(process.argv);
}

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name !== "ExitPromptError") {
    // Rethrow unknown errors
    throw error;
  }
});

run().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(msg);
  process.exit(1);
});
