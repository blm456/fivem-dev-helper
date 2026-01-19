export const LAYOUT = {
  DEV_DIR: ".fivem-dev",

  DIRS: {
    CACHE: "cache",
    CFG_FILES: "cfg-presets",
    COMPILED: "compiled",
    TEMPLATES: "templates",
    TYPES: "types",
    TMP: "tmp",
    DEV_RUNTIME: "dev",
  },

  FILES: {
    CONFIG: "config.json",
    DEV_SERVER_STATE: "devServer.state.json",
    UPDATE_STATE: "update.state.json",
    TEMPLATE_STATE: "templates.state.json",
  },
} as const;
