import { getServerEnvironment } from "@/lib/env/server";

type LogContext = Record<string, boolean | number | string | null | undefined>;

function write(level: "debug" | "info" | "warn" | "error", message: string, context: LogContext) {
  const { LOG_LEVEL } = getServerEnvironment();
  if (LOG_LEVEL === "silent") return;

  const order = { debug: 10, info: 20, warn: 30, error: 40 } as const;
  if (order[level] < order[LOG_LEVEL as keyof typeof order]) return;

  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else if (level === "debug") console.debug(payload);
  else console.info(payload);
}

export const logger = {
  debug: (message: string, context: LogContext = {}) => write("debug", message, context),
  info: (message: string, context: LogContext = {}) => write("info", message, context),
  warn: (message: string, context: LogContext = {}) => write("warn", message, context),
  error: (message: string, context: LogContext = {}) => write("error", message, context),
};
