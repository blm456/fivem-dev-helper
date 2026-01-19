import path from "path";
import { getResourcesDir, isPathChild } from "./paths.js";
import { PromiseResponse } from "./type-utils.js";

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
  return ResourceGroupPattern.test(path);
}

/**
 * Checks if the path is a valid resource folder (does not check if it exists)
 * @param path Relative path from resources folder
 * @returns If the relative path is valid
 */
export function isResourceFolder(path: string) {
  return ResourceFolderPattern.test(path);
}

/**
 * Checks if the target relative path is a child of the resources folder and matches the correct pattern
 * @param target Path relative to the resources folder
 * @returns If the relative path is valid and the absolute path if valid
 */
export async function resolveResourceGroupFolder(
  target: string,
): PromiseResponse<{ path: string }> {
  const resourceDir = await getResourcesDir();

  if (!isPathChild(target, resourceDir, true, false))
    return {
      valid: false,
      reason: `Path (${target}) is either the resource folder or is not inside it`,
    };

  if (!isResourceGroupFolder(target))
    return {
      valid: false,
      reason: `Path (${target}) does not match the required format`,
    };

  return { valid: true, path: path.join(resourceDir, target) };
}
/**
 * Checks if the target relative path is a child of the resources folder and matches the correct pattern
 * @param target Path relative to the resources folder
 * @returns If the relative path is valid and the absolute path if valid
 */
export async function resolveResourceFolder(
  target: string,
): PromiseResponse<{ path: string }> {
  const resourceDir = await getResourcesDir();

  if (!isPathChild(target, resourceDir, true, false))
    return {
      valid: false,
      reason: `Path (${target}) is either the resource folder or is not inside it`,
    };

  if (!isResourceFolder(target))
    return {
      valid: false,
      reason: `Path (${target}) does not match the required format`,
    };

  return { valid: true, path: path.join(resourceDir, target) };
}
