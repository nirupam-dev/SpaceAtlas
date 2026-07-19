/**
 * Unit tests for the centralized logger utility.
 */
import { createLogger } from "@/lib/logger";

describe("createLogger", () => {
  let consoleSpy: {
    info: jest.SpiedFunction<typeof console.info>;
    warn: jest.SpiedFunction<typeof console.warn>;
    error: jest.SpiedFunction<typeof console.error>;
  };

  beforeEach(() => {
    consoleSpy = {
      info: jest.spyOn(console, "info").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
      error: jest.spyOn(console, "error").mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a scoped logger with info, warn, error methods", () => {
    const log = createLogger("TestComponent");
    expect(log).toHaveProperty("info");
    expect(log).toHaveProperty("warn");
    expect(log).toHaveProperty("error");
  });

  it("logs errors with component context", () => {
    const log = createLogger("SpaceWeather");
    log.error("Failed to fetch data", { status: 500 });

    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    const logMessage = consoleSpy.error.mock.calls[0][0] as string;
    expect(logMessage).toContain("[ERROR]");
    expect(logMessage).toContain("[SpaceWeather]");
    expect(logMessage).toContain("Failed to fetch data");
  });

  it("logs warnings with component context", () => {
    const log = createLogger("LiveLaunches");
    log.warn("Fallback image not found", { query: "Falcon 9" });

    expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    const logMessage = consoleSpy.warn.mock.calls[0][0] as string;
    expect(logMessage).toContain("[WARN]");
    expect(logMessage).toContain("[LiveLaunches]");
  });

  it("logs info with component context", () => {
    const log = createLogger("AsteroidWatch");
    log.info("Loaded 15 NEOs");

    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    const logMessage = consoleSpy.info.mock.calls[0][0] as string;
    expect(logMessage).toContain("[INFO]");
    expect(logMessage).toContain("[AsteroidWatch]");
  });

  it("passes metadata object alongside the log message", () => {
    const log = createLogger("Test");
    const meta = { statusCode: 404, endpoint: "/api/neo" };
    log.error("Not found", meta);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR][Test]"),
      meta
    );
  });
});
