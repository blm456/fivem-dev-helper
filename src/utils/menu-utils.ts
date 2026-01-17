import { select } from "@inquirer/prompts";
import chalk from "chalk";

export interface MenuOptions {
  name: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  action: () => void | Promise<void>;
}

export type MenuOptionsList = MenuOptions[];

export async function ShowMenuOptions(
  message: string,
  options: MenuOptionsList,
  onBackOption?: () => Promise<void>,
) {
  const choices = options
    .map((c, i) => ({
      name: c.name,
      description: c.description,
      short: c.short,
      disabled: c.disabled,
      value: i,
    }))
    .filter((c) => !c.disabled);
  if (onBackOption) {
    choices.push({
      name: "Back",
      value: choices.length,
      description: "Go back to the previous menu",
      short: undefined,
      disabled: false,
    });
  }
  const selection = await select(
    {
      message: `${chalk.cyan("FiveM Menu Helper")} ${chalk.bold.gray("→")} ${chalk.green(message)}`,
      choices,
      loop: false,
    },
    { clearPromptOnDone: true },
  );
  if (selection === choices.length - 1 && onBackOption) {
    await onBackOption();
  }
  await options[selection]?.action();
}
