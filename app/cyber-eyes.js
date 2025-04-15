/**
 * Cyber-Eyes Logging System - Demo Version
 *
 * This is a simplified version of the Cyber-Eyes logging system for the demo.
 * It implements the core functionality but is not the full library.
 */

(function(global) {
  'use strict';

  /**
   * Log levels
   */
  const LogLevel = {
    TRACE: 'TRACE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    FATAL: 'FATAL'
  };

  /**
   * Log level values for comparison
   */
  const LOG_LEVEL_VALUES = {
    [LogLevel.TRACE]: 0,
    [LogLevel.DEBUG]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.WARN]: 3,
    [LogLevel.ERROR]: 4,
    [LogLevel.FATAL]: 5
  };

  /**
   * Default configuration
   */
  let config = {
    defaultLevel: LogLevel.INFO,
    transports: [
      { type: 'console', colorize: true }
    ]
  };

  /**
   * Component-specific log levels
   */
  const componentLevels = new Map();

  /**
   * Current trace context
   */
  let traceContext = {
    traceId: null,
    spanId: null
  };

  /**
   * Generate a random ID
   * @returns {string} A random ID
   */
  function generateId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Configure the logger
   * @param {Object} options Configuration options
   */
  function configure(options) {
    config = { ...config, ...options };
  }

  /**
   * Set the global log level
   * @param {string} level The log level
   */
  function setLogLevel(level) {
    if (!Object.values(LogLevel).includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    config.defaultLevel = level;
  }

  /**
   * Set the log level for a specific component
   * @param {string} service The service name
   * @param {string} component The component name
   * @param {string} level The log level
   */
  function setComponentLogLevel(service, component, level) {
    if (!Object.values(LogLevel).includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    componentLevels.set(`${service}:${component}`, level);
  }

  /**
   * Start a new trace
   * @param {string} [traceId] Optional trace ID
   * @returns {Object} The trace context
   */
  function startTrace(traceId = null) {
    traceContext = {
      traceId: traceId || generateId(),
      spanId: generateId()
    };
    return { ...traceContext };
  }

  /**
   * Start a child span within the current trace
   * @returns {Object} The child span context
   */
  function startChildSpan() {
    if (!traceContext.traceId) {
      return startTrace();
    }

    return {
      traceId: traceContext.traceId,
      spanId: generateId(),
      parentSpanId: traceContext.spanId
    };
  }

  /**
   * Get the current trace context
   * @returns {Object} The trace context
   */
  function getTraceContext() {
    return { ...traceContext };
  }

  /**
   * Set the trace context
   * @param {Object} context The trace context
   */
  function setTraceContext(context) {
    if (context && context.traceId) {
      traceContext = {
        traceId: context.traceId,
        spanId: context.spanId || generateId()
      };
    }
  }

  /**
   * CyberEyes logger class
   */
  class CyberEyes {
    /**
     * Create a new logger
     * @param {string} service The service name
     * @param {string} component The component name
     */
    constructor(service, component) {
      this.service = service;
      this.component = component;

      // Bind methods
      this.trace = this.trace.bind(this);
      this.debug = this.debug.bind(this);
      this.info = this.info.bind(this);
      this.warn = this.warn.bind(this);
      this.error = this.error.bind(this);
      this.fatal = this.fatal.bind(this);
    }

    /**
     * Get the effective log level for this component
     * @returns {string} The log level
     */
    getEffectiveLevel() {
      const componentKey = `${this.service}:${this.component}`;
      return componentLevels.has(componentKey)
        ? componentLevels.get(componentKey)
        : config.defaultLevel;
    }

    /**
     * Check if a log level should be logged
     * @param {string} level The log level
     * @returns {boolean} Whether the level should be logged
     */
    shouldLog(level) {
      const effectiveLevel = this.getEffectiveLevel();
      return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[effectiveLevel];
    }

    /**
     * Log a message at TRACE level
     * @param {Object|string} data The log data or message
     */
    trace(data) {
      this.log(LogLevel.TRACE, data);
    }

    /**
     * Log a message at DEBUG level
     * @param {Object|string} data The log data or message
     */
    debug(data) {
      this.log(LogLevel.DEBUG, data);
    }

    /**
     * Log a message at INFO level
     * @param {Object|string} data The log data or message
     */
    info(data) {
      this.log(LogLevel.INFO, data);
    }

    /**
     * Log a message at WARN level
     * @param {Object|string} data The log data or message
     */
    warn(data) {
      this.log(LogLevel.WARN, data);
    }

    /**
     * Log a message at ERROR level
     * @param {Object|string} data The log data or message
     */
    error(data) {
      this.log(LogLevel.ERROR, data);
    }

    /**
     * Log a message at FATAL level
     * @param {Object|string} data The log data or message
     */
    fatal(data) {
      this.log(LogLevel.FATAL, data);
    }

    /**
     * Internal logging method
     * @param {string} level The log level
     * @param {Object|string} data The log data or message
     */
    log(level, data) {
      // Check if we should log this level
      if (!this.shouldLog(level)) return;

      // Normalize data
      const logData = typeof data === 'string'
        ? { message: data }
        : (data || {});

      // Create log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        service: this.service,
        component: this.component,
        ...logData
      };

      // Add trace context if available
      if (traceContext.traceId) {
        logEntry.traceId = traceContext.traceId;
        logEntry.spanId = traceContext.spanId;
      }

      // Log to console
      this.logToConsole(logEntry);
    }

    /**
     * Log to console
     * @param {Object} logEntry The log entry
     */
    logToConsole(logEntry) {
      const { level, message, ...rest } = logEntry;
      const prefix = `[${level}] [${this.service}:${this.component}]`;

      switch (level) {
        case LogLevel.TRACE:
        case LogLevel.DEBUG:
          console.debug(`${prefix} ${message || ''}`, message ? rest : logEntry);
          break;
        case LogLevel.INFO:
          console.info(`${prefix} ${message || ''}`, message ? rest : logEntry);
          break;
        case LogLevel.WARN:
          console.warn(`${prefix} ${message || ''}`, message ? rest : logEntry);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(`${prefix} ${message || ''}`, message ? rest : logEntry);
          break;
      }
    }
  }

  // Store logs in memory for the demo
  let logs = [];

  /**
   * Get all logs
   * @returns {Array} The logs
   */
  function getLogs() {
    return [...logs];
  }

  /**
   * Clear all logs
   */
  function clearLogs() {
    logs = [];
  }

  // Override the processLogEntry method to store logs in memory
  const originalProcessLogEntry = CyberEyes.prototype.processLogEntry;
  CyberEyes.prototype.processLogEntry = function(logEntry) {
    // Call the original method
    if (originalProcessLogEntry) {
      originalProcessLogEntry.call(this, logEntry);
    } else {
      // Log to configured transports
      for (let i = 0; i < config.transports.length; i++) {
        const transport = config.transports[i];
        if (transport.type === 'console') {
          this.logToConsole(logEntry, transport);
        }
      }
    }

    // Store the log entry in memory
    logs.push({...logEntry});

    // Limit the number of logs to 1000
    if (logs.length > 1000) {
      logs.shift();
    }
  };

  // Export to global scope
  const CyberEyesExport = CyberEyes;
  CyberEyesExport.LogLevel = LogLevel;
  CyberEyesExport.configure = configure;
  CyberEyesExport.setLogLevel = setLogLevel;
  CyberEyesExport.setComponentLogLevel = setComponentLogLevel;
  CyberEyesExport.startTrace = startTrace;
  CyberEyesExport.startChildSpan = startChildSpan;
  CyberEyesExport.getTraceContext = getTraceContext;
  CyberEyesExport.setTraceContext = setTraceContext;
  CyberEyesExport.getLogs = getLogs;
  CyberEyesExport.clearLogs = clearLogs;

  global.CyberEyes = CyberEyesExport;
})(typeof window !== 'undefined' ? window : global);
