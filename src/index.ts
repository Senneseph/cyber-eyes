/**
 * Cyber-Eyes — the standardized logging system for WebAX applications.
 *
 * Structured, level-filtered logging scoped to a service + component, with
 * global and per-service/component level control.
 */

export { CyberEyes, getLogger } from './core/cyber-eyes.js';
export type { LogData } from './core/cyber-eyes.js';
export { LogLevel, LOG_LEVEL_VALUES, shouldLog, isValidLogLevel } from './core/log-level.js';
export {
  configure,
  setLogLevel,
  setServiceLogLevel,
  setComponentLogLevel,
  getLevelFor,
} from './core/config.js';
export type { Config } from './core/config.js';

import { CyberEyes } from './core/cyber-eyes.js';
export default CyberEyes;
