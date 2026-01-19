import { promises as fs } from "fs";
import path from "path";

/** mkdir -p */
export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** rm -rf (Node 18+) */
export async function remove(target: string): Promise<void> {
  await fs.rm(target, { recursive: true, force: true });
}

/** empty a directory without removing it */
export async function emptyDir(dir: string): Promise<void> {
  try {
    const entries = await fs.readdir(dir);
    await Promise.all(
      entries.map((entry) =>
        fs.rm(path.join(dir, entry), { recursive: true, force: true }),
      ),
    );
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}

export async function isEmpty(dir: string) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length === 0;
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
  return false;
}

/** read JSON with proper typing */
export async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

/** write formatted JSON */
export async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/** exists check (async-safe) */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export class fsu {
  public static ensureDir = ensureDir;
  public static remove = remove;
  public static emptyDir = emptyDir;
  public static isEmpty = isEmpty;
  public static readJson = readJson;
  public static writeJson = writeJson;
  public static pathExists = pathExists;
}
