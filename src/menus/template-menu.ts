import { getTemplateList, getTemplateVersion } from "../templates/artifacts.js";
import { runTemplateInstallationWizard } from "../templates/install.js";
import { checkForTemplateUpdates } from "../templates/updater.js";
import { ShowMenuOptions } from "../utils/menu-utils.js";
import { mainMenu } from "./main-menu.js";

export async function templateMenu(
  showBack: boolean = true,
  showUpdate: boolean = true,
) {
  const templateVersion = await getTemplateVersion();
  const templateList = await getTemplateList();

  await ShowMenuOptions(
    `Templates (Version: ${templateVersion})`,
    [
      ...templateList.map((template) => ({
        name: `📜  ${template.name} Template`,
        async action() {
          await runTemplateInstallationWizard(template, {
            showBack,
            showUpdate,
          });
        },
      })),
      {
        name: "🔄  Check for updates",
        disabled: !showUpdate,
        async action() {
          const res = await checkForTemplateUpdates({
            ignoreTimeCheck: true,
            installIfNew: true,
          });

          console.print(`[Auto Template Updater] ${res.message}\n`);

          await templateMenu(showBack, showUpdate);
        },
      },
    ],
    showBack ? mainMenu : undefined,
  );
}
