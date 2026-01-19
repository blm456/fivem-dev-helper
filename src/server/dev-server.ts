import path from "path";
import { execa } from "execa";
import { spawn } from "node:child_process";
import { loadConfig } from "../config/load-config.js";
import {
  isProcessRunning,
  looksLikeFXServer,
  commandExists,
} from "../utils/process-utils.js";
import { fsu } from "../utils/file-utils.js";
import {
  getDevRuntimeDir,
  getDevStatePath,
  getResourcesServerCfgPath,
} from "../utils/paths.js";

type DevStartMethod = "win32_powershell" | "linux_tmux" | "posix_detached";

interface DevServerState {
  method: DevStartMethod;
  platform: NodeJS.Platform;
  pid?: number; // for win32_powershell + posix_detached
  tmuxSession?: string; // for linux_tmux
  startedAt: number;
  binariesPath: string;
  exePath: string;
}

async function readState(): Promise<DevServerState | null> {
  try {
    const stateFile = await getDevStatePath();
    if (!(await fsu.pathExists(stateFile))) return null;
    return (await fsu.readJson(stateFile)) as DevServerState;
  } catch {
    return null;
  }
}

async function writeState(state: DevServerState) {
  const stateFile = await getDevStatePath();
  await fsu.ensureDir(path.dirname(stateFile));
  await fsu.writeJson(stateFile, state);
}

async function clearState() {
  const stateFile = await getDevStatePath();
  await fsu.remove(stateFile);
}

function getFxServerExecutable(config: Awaited<ReturnType<typeof loadConfig>>) {
  if (config.fiveM.devPlatform === "windows") {
    return path.join(config.paths.serverBinaries, "FXServer.exe");
  }
  // Linux: commonly "FXServer" inside binaries dir
  return path.join(config.paths.serverBinaries, "FXServer");
}

function psEscapeSingleQuoted(s: string): string {
  // Escape for PowerShell single-quoted strings: ' => ''
  return s.replaceAll("'", "''");
}

function shEscape(s: string): string {
  // Strong POSIX shell quoting: wrap in single quotes; escape single quote as: '"'"'
  return `'${s.replaceAll("'", `'\"'\"'`)}'`;
}

export async function getDevServerStatus(): Promise<{
  running: boolean;
  reason?: string;
}> {
  const state = await readState();
  if (!state) return { running: false };

  // tmux-based
  if (state.method === "linux_tmux") {
    if (!state.tmuxSession) {
      await clearState();
      return {
        running: false,
        reason: "Missing tmux session in state; cleaned.",
      };
    }
    try {
      const { stdout } = await execa("tmux", [
        "has-session",
        "-t",
        state.tmuxSession,
      ]);
      // tmux has-session returns exit code 0 when exists; stdout typically empty
      return { running: true };
    } catch {
      await clearState();
      return {
        running: false,
        reason: "tmux session missing; cleaned stale state.",
      };
    }
  }

  // pid-based
  if (!state.pid || !Number.isFinite(state.pid)) {
    await clearState();
    return { running: false, reason: "Missing PID in state; cleaned." };
  }

  if (!isProcessRunning(state.pid)) {
    await clearState();
    return { running: false, reason: "PID not running; cleaned stale state." };
  }

  // Best-effort identity check: if it doesn't look like FXServer, warn but still treat as running.
  // (You can choose to treat this as NOT running to be strict.)
  const ok = await looksLikeFXServer(state.pid);
  if (!ok) {
    return {
      running: true,
      reason: "Process running but name does not look like FXServer.",
    };
  }

  return { running: true };
}

export async function startDevServer(): Promise<void> {
  const status = await getDevServerStatus();
  if (status.running) return;

  const runtimeDir = await getDevRuntimeDir();
  await fsu.ensureDir(runtimeDir);

  const serverCfg = await getResourcesServerCfgPath();
  if (!(await fsu.pathExists(serverCfg)))
    throw new Error("server.cfg is required in your resources folder!");

  const config = await loadConfig();
  const binariesPath = config.paths.serverBinaries;
  const exePath = getFxServerExecutable(config);
  const args = config.startupArgs.dev ?? [];

  const exeArgs = ["+exec", serverCfg.replaceAll("\\", "/"), ...args];

  // Basic sanity
  if (!(await fsu.pathExists(exePath))) {
    throw new Error(`FXServer executable not found at: ${exePath}`);
  }

  // WINDOWS: Start FXServer with PowerShell, get the actual PID via -PassThru
  if (process.platform === "win32") {
    const psScript = `
    $argList = @(${exeArgs.map((a) => `'${psEscapeSingleQuoted(a)}'`).join(", ")});
    $p = Start-Process -FilePath '${psEscapeSingleQuoted(exePath)}' -WorkingDirectory '${psEscapeSingleQuoted(runtimeDir)}' -ArgumentList $argList -PassThru;
    $p.Id
  `.trim();

    const { stdout } = await execa("powershell.exe", [
      "-NoProfile",
      "-Command",
      psScript,
    ]);
    const pid = Number(stdout.trim());
    if (!Number.isFinite(pid)) {
      throw new Error(
        `Failed to parse PID from PowerShell output: "${stdout}"`,
      );
    }

    await writeState({
      method: "win32_powershell",
      platform: process.platform,
      pid,
      startedAt: Date.now(),
      binariesPath,
      exePath,
    });

    return;
  }

  if (process.platform === "linux") {
    const hasTmux = await commandExists("tmux");
    if (hasTmux) {
      const session = "fivem-dev";

      try {
        await execa("tmux", ["kill-session", "-t", session]);
      } catch {}

      // Build a fully quoted command line:
      // cd '<runtimeDir>' && '<exePath>' '<arg1>' ...
      const cmd = [
        "cd",
        shEscape(runtimeDir),
        "&&",
        [exePath, ...exeArgs].map(shEscape).join(" "),
      ].join(" ");

      await execa("tmux", [
        "new-session",
        "-d",
        "-s",
        session,
        "bash",
        "-lc",
        cmd,
      ]);

      await writeState({
        method: "linux_tmux",
        platform: process.platform,
        tmuxSession: session,
        startedAt: Date.now(),
        binariesPath,
        exePath,
      });

      return;
    }
  }

  // POSIX fallback (linux/mac): detached spawn, no new terminal window
  const child = spawn(exePath, exeArgs, {
    cwd: runtimeDir,
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  if (!child.pid) {
    throw new Error("Failed to start FXServer: no PID returned.");
  }

  await writeState({
    method: "posix_detached",
    platform: process.platform,
    pid: child.pid,
    startedAt: Date.now(),
    binariesPath,
    exePath,
  });
}

export async function stopDevServer(): Promise<void> {
  const state = await readState();
  if (!state) return;

  // tmux stop
  if (state.method === "linux_tmux") {
    if (state.tmuxSession) {
      try {
        await execa("tmux", ["kill-session", "-t", state.tmuxSession]);
      } catch {
        // If session is already gone, treat as stopped
      }
    }
    await clearState();
    await fsu.emptyDir(await getDevRuntimeDir());
    return;
  }

  const pid = state.pid;
  if (!pid || !Number.isFinite(pid)) {
    await clearState();
    return;
  }

  // If it isn't running, clean state and exit
  if (!isProcessRunning(pid)) {
    await clearState();
    return;
  }

  // Windows: kill process tree
  if (process.platform === "win32") {
    try {
      await execa("taskkill", ["/PID", String(pid), "/T", "/F"]);
    } catch {
      // If taskkill fails, last resort:
      try {
        process.kill(pid);
      } catch {
        /* ignore */
      }
    }
    await clearState();
    await fsu.emptyDir(await getDevRuntimeDir());
    return;
  }

  // POSIX: SIGTERM then SIGKILL if needed
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    await clearState();
    return;
  }

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (!isProcessRunning(pid)) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (isProcessRunning(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // ignore
    }
  }

  await clearState();
  await fsu.emptyDir(await getDevRuntimeDir());
}
