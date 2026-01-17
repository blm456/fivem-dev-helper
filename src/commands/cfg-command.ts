import { Command } from "commander";
import { BaseCommand } from "./base-command.js";
import { CommandContext } from "./command-context.js";
import {
  deleteCfgPreset,
  listCfgPresets,
  loadCfgPresetToResources,
  loadDefaultCfgFile,
  saveCfgPresetFromResources,
} from "../server/cfg-preset.js";

export class CfgCommand extends BaseCommand {
  register(program: Command, ctx: CommandContext): void {
    const cfg = program
      .command("cfg")
      .description("server.cfg preset management");

    cfg
      .command("list")
      .description("List available server.cfg presets")
      .action(
        this.commandAction(async () => {
          await this.requireProject(ctx);
          const presets = await listCfgPresets();
          if (!presets.length) {
            console.print("No presets found.");
            return;
          }
          for (const p of presets) console.print(p);
        }),
      );

    cfg
      .command("save")
      .description("Save the current resources/server.cfg as a named preset")
      .argument("<name>", "Preset name (letters/numbers/._-)")
      .option("-o, --overwrite", "Overwrite existing preset")
      .action(
        this.commandAction(
          async (name: string, options: { overwrite?: boolean }) => {
            await this.requireProject(ctx);
            const out = await saveCfgPresetFromResources(name, {
              overwrite: Boolean(options.overwrite),
            });
            console.print(`Saved preset "${name}" to: ${out}`);
          },
        ),
      );

    cfg
      .command("load")
      .description(
        "Load a named preset into resources/server.cfg (backs up existing server.cfg)",
      )
      .argument("<name>", "Preset name")
      .action(
        this.commandAction(async (name: string) => {
          await this.requireProject(ctx);
          const res = await loadCfgPresetToResources(name);
          console.print(`Loaded preset ${name} to ${res.targetPath}`);
          if (res.backupPath)
            console.print(`\nLast CFG file backed up to: ${res.backupPath}`);
        }),
      );

    cfg
      .command("delete")
      .description("Delete a named preset")
      .argument("<name>", "Preset name")
      .action(
        this.commandAction(async (name: string) => {
          await this.requireProject(ctx);
          await deleteCfgPreset(name);
          console.print(`Deleted preset: ${name}`);
        }),
      );

    cfg
      .command("default")
      .description("Load the default server.cfg file")
      .action(
        this.commandAction(async () => {
          this.requireProject(ctx);
          const res = await loadDefaultCfgFile();
          console.print(`Default server.cfg loaded to: ${res.targetPath}`);

          if (res.backupPath) {
            console.print(`\nLast CFG file backed up to: ${res.backupPath}`);
          }
        }),
      );
  }
}
