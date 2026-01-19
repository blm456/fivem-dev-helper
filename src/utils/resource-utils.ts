/** Pattern for group folders relative to the resources folder */
export const ResourceGroupPattern =
  /^(\[[a-zA-Z0-9-_]+\][\/\\])*(\[[a-zA-Z0-9-_/]+\])$/;

/** Pattern for resource folder potentially in group folder relative to resources folder */
export const ResourceFolderPattern =
  /^(\[[a-zA-Z0-9-_]+\][\/\\])*([a-zA-Z0-9-_/])+$/;

/**
 * Checks if the path is a valid resource group folder (does not check if it exists)
 * @param path Relative path from resources folder
 * @returns If the relative path is a valid resource group folder
 */
export function isResourceGroupFolder(path: string) {
  return ResourceFolderPattern.test(path);
}

/**
 * Checks if the path is a valid resource folder (does not check if it exists)
 * @param path Relative path from resources folder
 * @returns If the relative path is valid
 */
export function isResourceFolder(path: string) {
  return ResourceFolderPattern.test(path);
}
