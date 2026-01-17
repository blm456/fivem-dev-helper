import { fsu } from "../utils/file-utils.js";
import { getUpdateStatePath } from "../utils/paths.js";
import { ArtifactPlatform, ReleaseTier } from "./artifacts.js";

export interface UpdateState {
  lastCheck?: number;
  installed?: {
    platform: ArtifactPlatform;
    channel: ReleaseTier;
    version: string;
    url: string;
    installedAt: number;
  };
}

export async function loadUpdateState() {
  const p = await getUpdateStatePath();
  if (!(await fsu.pathExists(p))) return {};
  return fsu.readJson<UpdateState>(p);
}

export async function saveUpdateState(state: UpdateState) {
  const p = await getUpdateStatePath();
  await fsu.writeJson(p, state);
}
