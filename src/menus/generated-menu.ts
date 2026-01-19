import { input } from "@inquirer/prompts";
import {
  installGeneratedBuilders,
  installGeneratedServerDefault,
} from "../templates/generated.js";
import { selectFolder } from "../utils/file-selector.js";
import { ShowMenuOptions } from "../utils/menu-utils.js";
import { getResourcesDir } from "../utils/paths.js";
import path from "path";
import { mainMenu } from "./main-menu.js";

export async function generatedMenu() {
  await ShowMenuOptions(
    "Generated Items",
    [
      {
        name: "🛠️   Builder Resources",
        description: "Install builders for node resources",
        async action() {
          const resDir = await getResourcesDir();
          const folder = await selectFolder(resDir, "Select parent folder");

          const groupFolder = await input({
            message:
              "Enter group folder name to install the builders scripts to (wrapped in square brackets]",
          });

          await installGeneratedBuilders(path.join(folder.path, groupFolder));
        },
      },
      {
        name: "⚙️   Default server.cfg (Will overwrite current)",
        description: "Install the default FiveM server.cfg",
        async action() {
          await installGeneratedServerDefault(true);
        },
      },
    ],
    mainMenu,
  );
}
