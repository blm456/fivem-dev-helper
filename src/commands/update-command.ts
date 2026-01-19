import { Command, Option } from "commander";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";
import { ReleaseTier } from "../updater/artifacts.js";
import { checkForUpdates } from "../updater/updater.js";

export class UpdateCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    program
      .command("update")
      .description(
        "Check for update to FiveM server binaries (and install if new)",
      )
      .addOption(
        new Option(
          "--no-install",
          "Only check for updates but do not install",
        ).default(true),
      )
      .addOption(
        new Option(
          "-c, --channel [channel]",
          "Set the release channel to update from",
        ).choices(["latest", "recommended", "optional", "critical"]),
      )
      .addOption(
        new Option(
          "-f, --force",
          "Forces the update even if the same version is installed",
        ).default(false),
      )
      .action(
        this.commandAction(
          async (options: {
            install: boolean;
            force: boolean;
            channel?: ReleaseTier;
          }) => {
            await this.requireProject(ctx);
            const res = await checkForUpdates({
              force: options.force,
              tierOverride: options.channel,
              installIfNew: options.install,
              ignoreTimeCheck: true,
            });
            console.log("[Auto FiveM Updater]", res.message);
          },
        ),
      );
  }
}
