import { createWriteStream } from "fs";
import { ensureDir, fsu } from "../utils/file-utils.js";
import fs from "fs/promises";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function renameWithRetries(from: string, to: string, attempts = 0) {
  if (await fsu.pathExists(to)) {
    await fsu.remove(to);
  }

  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      await fs.rename(from, to);
      return;
    } catch (err: any) {
      lastErr = err;

      const code = err?.code as string | undefined;
      const transient =
        code === "EPERM" || code === "EBUSY" || code === "EACCES";
      const crossDevice = code === "EXDEV";

      if (crossDevice) break;
      if (!transient) break;

      const backoff = Math.round(50 * Math.pow(1.5, i));
      await sleep(backoff);
    }
  }

  // Fallback: copy then unlink
  try {
    await ensureDir(path.dirname(to));
    await fs.copyFile(from, to);
    await fs.unlink(from);
  } catch (err) {
    if (lastErr) throw lastErr;
    throw err;
  }
}

export async function downloadFile(url: string, destPath: string) {
  await fsu.ensureDir(path.dirname(destPath));

  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${url} (${res.status})`);
  }

  const tmp = `${destPath}.part`;
  const fileStream = createWriteStream(tmp);

  try {
    const body = Readable.fromWeb(res.body as any);
    await pipeline(body, fileStream);
  } catch (err) {
    try {
      await fsu.remove(tmp);
    } catch {}
    throw err;
  }

  await fs.rename(tmp, destPath);
}
