export const LAYOUT = {
  DEV_DIR: ".fivem-dev",

  DIRS: {
    CACHE: "cache",
    CFG_FILES: "cfg-presets",
    COMPILED: "compiled",
    BINARIES: "binaries",
    TYPES: "types",
    TMP: "tmp",
    DEV_RUNTIME: "dev",
  },

  FILES: {
    CONFIG: "config.json",
    DEV_SERVER_STATE: "devServer.state.json",
    UPDATE_STATE: "update.state.json",
  },
} as const;
