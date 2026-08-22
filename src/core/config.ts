import { LogLevel } from './log-level.js';

export interface Config {
  defaultLevel: LogLevel;
  serviceLevels: Record<string, LogLevel>;
  componentLevels: Record<string, LogLevel>;
}

let config: Config = {
  defaultLevel: LogLevel.INFO,
  serviceLevels: {},
  componentLevels: {},
};

/** Merge configuration (global). */
export function configure(partial: Partial<Config>): void {
  config = { ...config, ...partial };
}

/** Set the global minimum log level. */
export function setLogLevel(level: LogLevel): void {
  config.defaultLevel = level;
}

/** Set the minimum log level for a service. */
export function setServiceLogLevel(service: string, level: LogLevel): void {
  config.serviceLevels[service] = level;
}

/** Set the minimum log level for a service + component. */
export function setComponentLogLevel(service: string, component: string, level: LogLevel): void {
  config.componentLevels[`${service}:${component}`] = level;
}

/** Resolve the effective minimum level for a service + component. */
export function getLevelFor(service: string, component: string): LogLevel {
  return (
    config.componentLevels[`${service}:${component}`] ??
    config.serviceLevels[service] ??
    config.defaultLevel
  );
}
