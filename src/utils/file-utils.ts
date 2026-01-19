import { promises as fs } from "fs";
import path from "path";

export class fsu {
  public static async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  public static async remove(target: string): Promise<void> {
    await fs.rm(target, { recursive: true, force: true });
  }

  public static async emptyDir(dir: string): Promise<void> {
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

  public static async isEmpty(dir: string) {
    try {
      const entries = await fs.readdir(dir);
      return entries.length === 0;
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
    return false;
  }

  public static async isDir(dir: string) {
    if (!(await this.pathExists(dir))) return false;

    const stats = await fs.stat(dir);
    return stats.isDirectory();
  }

  public static async doesDirExist(dir: string) {
    if (!(await this.pathExists(dir))) return false;
    if (!(await this.isDir(dir))) return false;
    return true;
  }

  public static async readJson<T>(file: string): Promise<T> {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  }

  public static async writeJson(file: string, data: unknown): Promise<void> {
    await this.ensureDir(path.dirname(file));
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
  }

  public static async pathExists(p: string): Promise<boolean> {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  }
}
