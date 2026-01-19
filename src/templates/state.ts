import { fsu } from "../utils/file-utils.js";
import { getTemplateStatePath } from "../utils/paths.js";

export interface TemplateState {
  lastCheck?: number;
  installed?: {
    tag_name: string;
    installedAt: number;
  };
}

export async function loadTemplateState() {
  const p = await getTemplateStatePath();
  if (!(await fsu.pathExists(p))) return {};
  return fsu.readJson<TemplateState>(p);
}

export async function saveTemplateState(state: TemplateState) {
  const p = await getTemplateStatePath();
  await fsu.writeJson(p, state);
}
