import {
  getDevServerStatus,
  startDevServer,
  stopDevServer,
} from "../server/dev-server.js";
import { ShowMenuOptions } from "../utils/menu-utils.js";
import { cfgMenu } from "./cfg-menu.js";

export async function mainMenu() {
  const status = await getDevServerStatus();

  await ShowMenuOptions(`Main Menu`, [
    {
      name: "⚡  Start Dev Server",
      disabled: status.running,
      async action() {
        await startDevServer();
        await mainMenu();
      },
    },
    {
      name: "🛑  Stop Dev Server",
      disabled: !status.running,
      async action() {
        await stopDevServer();
        await mainMenu();
      },
    },
    {
      name: "CFG Presets",
      action: cfgMenu,
    },
    {
      name: "👋  Exit",
      action() {
        process.exit(0);
      },
    },
  ]);

  await mainMenu();
}
