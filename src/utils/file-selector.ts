import { fileSelector, ItemType } from "inquirer-file-selector";

export async function selectFolder(
  startingPath: string,
  message: string = "Select directory",
) {
  const selection = await fileSelector({
    message,
    type: ItemType.Directory,
    multiple: false,
    basePath: startingPath,
    showExcluded: false,
    filter(item) {
      return item.isDirectory;
    },
  });

  return selection;
}
