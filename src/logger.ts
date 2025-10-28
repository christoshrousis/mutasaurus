/**
 * A simple logging utility that respects silent mode.
 *
 * When silent mode is enabled, console.log output is suppressed,
 * but console.error and console.warn are still output.
 */
export class Logger {
  private static silent = false;

  /**
   * Set the silent mode for the logger.
   * @param silent Whether to suppress console.log output
   */
  static setSilentMode(silent: boolean): void {
    Logger.silent = silent;
  }

  /**
   * Log a message to the console if not in silent mode.
   * @param args The arguments to log
   */
  static log(...args: unknown[]): void {
    if (!Logger.silent) {
      console.log(...args);
    }
  }

  /**
   * Write to stdout if not in silent mode.
   * @param data The data to write
   */
  static stdoutWrite(data: Uint8Array): void {
    if (!Logger.silent) {
      Deno.stdout.writeSync(data);
    }
  }
}
