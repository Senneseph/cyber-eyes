/**
 * Log Levels
 * 
 * Defines the available log levels in order of increasing severity.
 */

/**
 * Log level enum
 */
export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log level numeric values for comparison
 */
export const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  [LogLevel.TRACE]: 0,
  [LogLevel.DEBUG]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.WARN]: 3,
  [LogLevel.ERROR]: 4,
  [LogLevel.FATAL]: 5
};

/**
 * Check if a log level is valid
 * @param level The log level to check
 * @returns Whether the level is valid
 */
export function isValidLogLevel(level: string): boolean {
  return Object.values(LogLevel).includes(level as LogLevel);
}

/**
 * Check if a log level meets the minimum threshold
 * @param level The log level to check
 * @param minLevel The minimum log level
 * @returns Whether the level meets the threshold
 */
export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[minLevel];
}
