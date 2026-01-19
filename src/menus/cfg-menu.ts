import { confirm, input } from "@inquirer/prompts";
import {
  deleteCfgPreset,
  doesCfgPresetExist,
  listCfgPresets,
  loadCfgPresetToResources,
  saveCfgPresetFromResources,
} from "../server/cfg-preset.js";
import { ShowMenuOptions } from "../utils/menu-utils.js";
import { mainMenu } from "./main-menu.js";

async function showCfgPresetMenu(name: string) {
  await ShowMenuOptions(
    `${name} Preset`,
    [
      {
        name: "🚀  Load Preset",
        async action() {
          const res = await loadCfgPresetToResources(name);
          console.print(`CFG preset "${name}" loaded!\n`);
          if (res.backupPath) {
            console.print(`Old CFG file backed up to: ${res.backupPath}\n`);
          }
          await cfgMenu();
        },
      },
      {
        name: "🗑️   Delete Preset",
        async action() {
          const c = await confirm({
            message: `Are you sure you want to delete preset "${name}"?`,
          });

          if (!c) return await showCfgPresetMenu(name);

          await deleteCfgPreset(name);
          console.print(`CFG preset "${name}" deleted!\n`);
          await cfgMenu();
        },
      },
    ],
    cfgMenu,
  );
}

export async function cfgMenu() {
  const cfgs = await listCfgPresets();

  await ShowMenuOptions(
    "Server CFG Presets",
    [
      ...cfgs.map((cfg) => ({
        name: `⚙️   ${cfg}`,
        async action() {
          await showCfgPresetMenu(cfg);
        },
      })),
      {
        name: "🆕  Save New Preset",
        async action() {
          const presetName = await input({
            message:
              'Name your preset (No spaces or special characters besides ".", "-", and "_"):',
          });

          if (presetName && presetName !== "") {
            if (await doesCfgPresetExist(presetName)) {
              const c = await confirm({
                message:
                  "CFG preset already saved with that name. Would you like to overwrite it?",
              });
              if (!c) return await cfgMenu();
            }
            const res = await saveCfgPresetFromResources(presetName, {
              overwrite: true,
            });
            console.print(`New CFG preset saved as "${presetName}"!\n`);
          }
          await cfgMenu();
        },
        description: "Create a new preset from your current server.cfg",
      },
    ],
    mainMenu,
  );
}
