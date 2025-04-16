/**
 * Cyber-Eyes Logging System
 * 
 * A comprehensive, high-performance logging system for WebAX applications.
 */

export { CyberEyes } from './core/cyber-eyes';
export { LogLevel } from './core/log-level';
export { configure, setLogLevel, getLogger } from './core/config';
export { startTrace, getTraceContext, setTraceContext, startChildSpan } from './core/trace';
export { wrapFunction, createMethodDecorator } from './core/instrumentation';
export { createOpenAPILoggerMiddleware, wrapOpenAPIOperation } from './openapi/server';
export { apiClient } from './openapi/client';

// Default export
import { CyberEyes } from './core/cyber-eyes';
export default CyberEyes;
