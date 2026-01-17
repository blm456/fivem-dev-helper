import { Command } from "commander";

export interface CommandContext {
  program: Command;
  verbose: boolean;

  ensureInitialized: () => Promise<void>;
  openMenu: () => Promise<void>;
  run: () => Promise<void>;
}
