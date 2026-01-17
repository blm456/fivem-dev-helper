import { BaseCommand } from "./base-command.js";
import { CfgCommand } from "./cfg-command.js";
import { InitCommand } from "./init-command.js";
import { RemoveCommand } from "./remove-command.js";
import { RunCommand } from "./run-command.js";
import { UpdateCommand } from "./update-command.js";

export const COMMANDS: BaseCommand[] = [
  new CfgCommand(),
  new InitCommand(),
  new RemoveCommand(),
  new RunCommand(),
  new UpdateCommand(),
];
