import { execa } from "execa";

/** Signal 0 check: true if PID exists and is accessible */
export function isProcessRunning(pid: number): boolean {
  if (!Number.isFinite(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Check process name */
export async function getProcessName(pid: number): Promise<string | null> {
  if (!Number.isFinite(pid) || pid <= 0) return null;

  // WINDOWS
  if (process.platform === "win32") {
    try {
      const { stdout } = await execa("tasklist", [
        "/FO",
        "CSV",
        "/NH",
        "/FI",
        `PID eq ${pid}`,
      ]);
      const line = stdout.trim();
      if (!line || line.toLowerCase().includes("no tasks")) return null;

      const m = line.match(/^"([^"]+)/);
      return m?.[1] ?? null;
    } catch {
      return null;
    }
  }

  // LINUX / MAC
  try {
    const { stdout } = await execa("ps", ["-p", String(pid), "-o", "comm="]);
    const name = stdout.trim();
    return name.length ? name : null;
  } catch {
    return null;
  }
}

/** Returns true if the process name suggests FXServer */
export async function looksLikeFXServer(pid: number): Promise<boolean> {
  const name = await getProcessName(pid);
  if (!name) return false;

  const n = name.toLowerCase();
  // Windows: FXServer.exe; Linux: FXServer (often)
  return n.includes("fxserver");
}

/** Run a command and return true if it exists on PATH */
export async function commandExists(cmd: string): Promise<boolean> {
  try {
    // `command -v` is POSIX; on mac/linux. We'll avoid on Windows.
    if (process.platform === "win32") {
      await execa("where", [cmd]);
      return true;
    }
    await execa("sh", ["-lc", `command -v ${cmd} >/dev/null 2>&1`]);
    return true;
  } catch {
    return false;
  }
}
