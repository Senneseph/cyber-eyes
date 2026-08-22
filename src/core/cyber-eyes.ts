import { LogLevel, shouldLog } from './log-level.js';
import { getLevelFor } from './config.js';

/** A log record's data payload. */
export interface LogData {
  message?: string;
  [key: string]: unknown;
}

/**
 * CyberEyes — a structured logger scoped to a service + component.
 *
 * Emits a single JSON line per record (timestamp, level, service, component,
 * message, and any extra data). Level filtering is controlled globally and per
 * service/component via `core/config`.
 */
export class CyberEyes {
  private readonly service: string;
  private readonly component: string;

  constructor(service: string, component = 'default') {
    this.service = service;
    this.component = component;
  }

  private write(level: LogLevel, data: LogData): void {
    if (!shouldLog(level, getLevelFor(this.service, this.component))) return;

    const { message, ...rest } = data;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      component: this.component,
      ...(message !== undefined ? { message } : {}),
      ...(Object.keys(rest).length > 0 ? { data: rest } : {}),
    };

    const fn =
      level === LogLevel.ERROR || level === LogLevel.FATAL
        ? console.error
        : level === LogLevel.WARN
          ? console.warn
          : level === LogLevel.DEBUG || level === LogLevel.TRACE
            ? console.debug
            : console.info;

    fn(JSON.stringify(entry));
  }

  trace(data: LogData): void {
    this.write(LogLevel.TRACE, data);
  }
  debug(data: LogData): void {
    this.write(LogLevel.DEBUG, data);
  }
  info(data: LogData): void {
    this.write(LogLevel.INFO, data);
  }
  warn(data: LogData): void {
    this.write(LogLevel.WARN, data);
  }
  error(data: LogData): void {
    this.write(LogLevel.ERROR, data);
  }
  fatal(data: LogData): void {
    this.write(LogLevel.FATAL, data);
  }
}

/** Convenience factory: a logger for a service + component. */
export function getLogger(service: string, component = 'default'): CyberEyes {
  return new CyberEyes(service, component);
}
