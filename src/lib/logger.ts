/**
 * Centralized logger for SpaceAtlas.
 *
 * In production this would forward to an observability service (Sentry, Datadog, etc.).
 * Locally it pretty-prints to the console with context so developers can quickly
 * trace failures back to the originating component or API route.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  component: string;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

const IS_DEV = process.env.NODE_ENV !== "production";

function formatEntry(entry: LogEntry): string {
  const tag = `[${entry.level.toUpperCase()}][${entry.component}]`;
  return `${tag} ${entry.message}`;
}

function emit(entry: LogEntry) {
  // In production, you'd POST to /api/log or Sentry.captureException here
  if (IS_DEV) {
    const formatted = formatEntry(entry);
    switch (entry.level) {
      case "error":
        console.error(formatted, entry.meta ?? "");
        break;
      case "warn":
        console.warn(formatted, entry.meta ?? "");
        break;
      default:
        console.info(formatted, entry.meta ?? "");
    }
  }
}

/**
 * Create a scoped logger for a specific component or module.
 *
 * @example
 * const log = createLogger("SpaceWeather");
 * log.error("Failed to fetch CME data", { status: 500 });
 */
export function createLogger(component: string) {
  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    emit({ level, component, message, meta, timestamp: new Date().toISOString() });
  };

  return {
    info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  };
}

export type Logger = ReturnType<typeof createLogger>;
