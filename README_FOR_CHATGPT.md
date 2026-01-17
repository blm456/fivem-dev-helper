# README_FOR_CHATGPT.md

## Project: FiveM Dev Helper CLI

A **globally installable Node.js + TypeScript CLI** to assist with developing, running, and packaging FiveM servers and resources.

The CLI is:
- **Menu-first** (Inquirer)
- Backed by **Commander subcommands** as shortcuts
- **Project-scoped** in state (no global runtime state outside a project)

The CLI itself is installed globally, but it always operates against a **local FiveM project**, discovered dynamically.

---

## Core Architectural Principle (Critical)

> **The CLI package root is NOT the FiveM project root.**

There are always two distinct roots:

1. **CLI Package Root**
   - Where the globally-installed CLI lives
   - Contains compiled JS, assets, and bundled defaults
   - Example contents:
     - `dist/`
     - `assets/default.server.cfg`
     - `package.json`

2. **Project Root**
   - Discovered by walking parent directories looking for:
     ```
     .fivem-dev/
     ```
   - All runtime state, caches, configs, and generated files live here

**These must never be confused or merged.**

---

## Tech Stack

- **Node.js** (ESM only)
- **TypeScript**
- **fs/promises only** (no fs-extra)
- **commander** – CLI commands
- **inquirer** – interactive menus
- **execa** – process execution
- **extract-zip** – Windows archive extraction
- System `tar` – Linux `.tar.xz` extraction
- **zod** – configuration validation

---

## Project Root Discovery

- CLI may be run from **any subdirectory**
- Project root is discovered by **walking upward**
- Presence of `.fivem-dev/` defines the root
- No commands assume `process.cwd()` is the root

---

## Project State Layout

All project-managed state lives under a single directory:

```
.fivem-dev/
```

### Layout Contract (Single Source of Truth)

All file and directory names are defined in:

```
src/constants/layout.ts
```

Nothing else is allowed to hardcode paths.

### Standard Layout

```
.fivem-dev/
├─ cache/
├─ compiled/
├─ binaries/
├─ types/
├─ tmp/
├─ cfg-presets/
└─ config.json
```

---

## Utilities & Conventions

### Filesystem
- Helpers live in `src/utils/fsUtils.ts`
- Uses `fs/promises` only
- Common helpers:
  - `ensureDir`
  - `remove`
  - `emptyDir`
  - `readJson`
  - `writeJson`
  - `pathExists`

### Paths
- All project paths resolved via `src/utils/paths.ts`
- CLI package paths resolved via `import.meta.url`
- No module accesses `.fivem-dev` directly

---

## Command System

- Built on **Commander**
- Modular, class-based architecture

Core pieces:
- `BaseCommand`
- `CommandContext`
- Per-command classes
- Central command registry

### Default UX

- `fivem-dev` → interactive menu
- Commands act as accelerators:
  - `fivem-dev init`
  - `fivem-dev dev start`
  - `fivem-dev cfg load <name>`
  - `fivem-dev update check`

---

## Initialization (`fivem-dev init`)

- Initializes a project in the **current directory**
- Creates `.fivem-dev/` and required subfolders
- If `.fivem-dev/` exists in a parent directory, initialization is skipped

---

## server.cfg Preset System

The CLI **does not generate configs**.
It manages **named presets**.

### Storage

```
.fivem-dev/cfg-presets/<name>.cfg
```

### Commands

- `fivem-dev cfg list`
- `fivem-dev cfg save <name> [--overwrite]`
- `fivem-dev cfg load <name>`
- `fivem-dev cfg delete <name>`

### Behavior

- Presets are plain `server.cfg` files
- Loading a preset writes to `<resources>/server.cfg`
- Existing configs are backed up with timestamps
- Preset names are strictly validated

---

## Bundled Default server.cfg (Global CLI Asset)

- `default.server.cfg` is bundled with the **CLI package**
- Lives under:
  ```
  assets/default.server.cfg
  ```
- Included in the published package via `package.json` `files`
- Copied into a project’s resources directory when requested

### Key Rule

> **Bundled assets are resolved relative to the CLI install location, not the project root.**

They are accessed using `import.meta.url`, never `process.cwd()`.

---

## FiveM Server Auto-Updater

Uses **official FiveM changelog JSON APIs**.

### Endpoints

- Windows:
  - https://changelogs-live.fivem.net/api/changelog/versions/win32/server
  - Archive: `server.zip`
- Linux:
  - https://changelogs-live.fivem.net/api/changelog/versions/linux/server
  - Archive: `fx.tar.xz`

### Release Channels

- `critical`
- `recommended`
- `optional`
- `latest`

### Behavior

- Safe download into temp directory
- Extract into staging
- Atomic swap into server binaries directory
- State tracked in:
  ```
  .fivem-dev/cache/update.state.json
  ```

---

## Dev Server Lifecycle

Implemented in `src/server/devServer.ts`.

### Features

- Windows + Linux support
- PID validation (no blind kills)
- Process identity checks
- Windows:
  - PowerShell `Start-Process -PassThru`
  - `taskkill /T`
- Linux:
  - Prefers `tmux`
  - Fallback to detached spawn
- State stored in:
  ```
  .fivem-dev/cache/devServer.state.json
  ```

---

## Design Constraints (Non‑Negotiable)

- No hardcoded paths
- No global runtime state outside `.fivem-dev`
- No silent failures
- Defensive coding over convenience
- CLI must work from any subdirectory
- Menu UX remains first‑class

---

## Usage in ChatGPT

When starting a new ChatGPT conversation for this project:

1. Paste **this file** as the first message
2. Add a short note describing the feature you’re working on
3. Treat each chat as a focused feature branch

This prevents context loss and re-explaining architecture.
