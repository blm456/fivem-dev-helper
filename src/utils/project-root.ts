import path from "path";
import { fsu } from "./file-utils.js";
import { LAYOUT } from "../constants/layout.js";

export async function findProjectRoot(
  startDir = process.cwd(),
): Promise<string> {
  let current = path.resolve(startDir);
  const { root } = path.parse(current);

  while (true) {
    const candidate = path.join(current, LAYOUT.DEV_DIR);
    if (await fsu.pathExists(candidate)) {
      return current;
    }

    if (current === root) {
      throw new Error(
        "Not inside a FiveM Dev Helper project: '.fivem-dev' not found!",
      );
    }

    current = path.dirname(current);
  }
}

export async function isInProject() {
  try {
    await findProjectRoot();
    return true;
  } catch {
    return false;
  }
}

export async function projectRootPath(...paths: string[]) {
  const projectRoot = await findProjectRoot();
  return path.join(projectRoot, ...paths);
}
