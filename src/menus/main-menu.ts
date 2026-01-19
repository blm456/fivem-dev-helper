import {
  getDevServerStatus,
  startDevServer,
  stopDevServer,
} from "../server/dev-server.js";
import { ShowMenuOptions } from "../utils/menu-utils.js";
import { cfgMenu } from "./cfg-menu.js";
import { generatedMenu } from "./generated-menu.js";
import { templateMenu } from "./template-menu.js";

export async function mainMenu() {
  const status = await getDevServerStatus();

  await ShowMenuOptions(`Main Menu`, [
    {
      name: "⚡  Start Dev Server",
      disabled: status.running,
      description: "Start local dev server instance",
      async action() {
        await startDevServer();
        await mainMenu();
      },
    },
    {
      name: "🛑  Stop Dev Server",
      disabled: !status.running,
      description: "Stop local dev server instance.",
      async action() {
        await stopDevServer();
        await mainMenu();
      },
    },
    {
      name: "📝  CFG Presets",
      description: "Save/load server.cfg files",
      action: cfgMenu,
    },
    {
      name: "📜  Resource Templates",
      description: "Create new FiveM resources from a template.",
      async action() {
        await templateMenu();
      },
    },
    {
      name: "🧩  Generated Content",
      async action() {
        await generatedMenu();
      },
    },
    {
      name: "👋  Exit",
      description: "Exit the application.",
      action() {
        process.exit(0);
      },
    },
  ]);

  await mainMenu();
}
