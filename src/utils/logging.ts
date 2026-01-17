import chalk from "chalk";
import { CommandContext } from "../commands/command-context.js";

declare global {
  interface Console {
    print: (...data: any[]) => void;
  }
}

export function initializeLogging(ctx: CommandContext) {
  const errorHandlers = {
    debug: {
      handler: console.debug,
      color: chalk.cyan,
      requireVerbose: true,
    },
    info: {
      handler: console.info,
      color: chalk.blue,
      requireVerbose: true,
    },
    log: {
      handler: console.log,
      color: chalk.gray,
      requireVerbose: false,
    },
    warn: {
      handler: console.warn,
      color: chalk.yellow,
      requireVerbose: false,
    },
    error: {
      handler: console.error,
      color: chalk.red,
      requireVerbose: false,
    },
  };

  function interceptConsole(type: keyof typeof errorHandlers, ...data: any[]) {
    const errData = errorHandlers[type];
    if (errData.requireVerbose && !ctx.verbose) return;
    const now = new Date();
    errData.handler(
      errData.color(`[${type.toUpperCase()} ${now.toLocaleString("en-us")}]:`),
      ...data,
    );
  }

  console.debug = (...data: any[]) => {
    interceptConsole("debug", ...data);
  };

  console.info = (...data: any[]) => {
    interceptConsole("info", ...data);
  };

  console.log = (...data: any[]) => {
    interceptConsole("log", ...data);
  };

  console.warn = (...data: any[]) => {
    interceptConsole("warn", ...data);
  };

  console.error = (...data: any[]) => {
    interceptConsole("error", ...data);
  };

  console.print = (...data: any[]) => {
    errorHandlers.log.handler(...data);
  };
}
