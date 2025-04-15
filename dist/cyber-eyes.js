/**
 * Cyber-Eyes Logging System v0.1.0
 * A comprehensive, high-performance logging system for WebAX applications
 *
 * Copyright (c) 2023 WebAX Team
 * Licensed under the MIT License
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CyberEyes = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Log levels
   */
  var LogLevel = {
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
  var LOG_LEVEL_VALUES = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  };

  /**
   * Default configuration
   */
  var defaultConfig = {
    defaultLevel: LogLevel.INFO,
    transports: [
      { type: 'console', colorize: true }
    ]
  };

  /**
   * Global configuration
   */
  var config = Object.assign({}, defaultConfig);

  /**
   * Component-specific log levels
   */
  var componentLevels = new Map();

  /**
   * Current trace context
   */
  var traceContext = {
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
    config = Object.assign({}, config, options);
  }

  /**
   * Set the global log level
   * @param {string} level The log level
   */
  function setLogLevel(level) {
    if (!Object.values(LogLevel).includes(level)) {
      throw new Error("Invalid log level: " + level);
    }
    config.defaultLevel = level;
  }

  /**
   * Set the log level for a specific service
   * @param {string} service The service name
   * @param {string} level The log level
   */
  function setServiceLogLevel(service, level) {
    if (!Object.values(LogLevel).includes(level)) {
      throw new Error("Invalid log level: " + level);
    }
    componentLevels.set(service, level);
  }

  /**
   * Set the log level for a specific component
   * @param {string} service The service name
   * @param {string} component The component name
   * @param {string} level The log level
   */
  function setComponentLogLevel(service, component, level) {
    if (!Object.values(LogLevel).includes(level)) {
      throw new Error("Invalid log level: " + level);
    }
    componentLevels.set(service + ":" + component, level);
  }

  /**
   * Start a new trace
   * @param {string} [traceId] Optional trace ID
   * @returns {Object} The trace context
   */
  function startTrace(traceId) {
    if (traceId === void 0) { traceId = null; }
    traceContext = {
      traceId: traceId || generateId(),
      spanId: generateId()
    };
    return Object.assign({}, traceContext);
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
    return Object.assign({}, traceContext);
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
  var CyberEyes = /** @class */ (function () {
    /**
     * Create a new logger
     * @param {string} service The service name
     * @param {string} component The component name
     */
    function CyberEyes(service, component) {
      this.service = service;
      this.component = component;

      // Bind methods to ensure 'this' context
      this.trace = this.trace.bind(this);
      this.debug = this.debug.bind(this);
      this.info = this.info.bind(this);
      this.warn = this.warn.bind(this);
      this.error = this.error.bind(this);
      this.fatal = this.fatal.bind(this);
      this.log = this.log.bind(this);
      this.wrapFunction = this.wrapFunction.bind(this);
    }

    /**
     * Get the effective log level for this component
     * @returns {string} The log level
     */
    CyberEyes.prototype.getEffectiveLevel = function () {
      var componentKey = this.service + ":" + this.component;
      if (componentLevels.has(componentKey)) {
        return componentLevels.get(componentKey);
      }
      if (componentLevels.has(this.service)) {
        return componentLevels.get(this.service);
      }
      return config.defaultLevel;
    };

    /**
     * Check if a log level should be logged
     * @param {string} level The log level
     * @returns {boolean} Whether the level should be logged
     */
    CyberEyes.prototype.shouldLog = function (level) {
      var effectiveLevel = this.getEffectiveLevel();
      return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[effectiveLevel];
    };

    /**
     * Log a message at TRACE level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.trace = function (data) {
      this.log(LogLevel.TRACE, data);
    };

    /**
     * Log a message at DEBUG level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.debug = function (data) {
      this.log(LogLevel.DEBUG, data);
    };

    /**
     * Log a message at INFO level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.info = function (data) {
      this.log(LogLevel.INFO, data);
    };

    /**
     * Log a message at WARN level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.warn = function (data) {
      this.log(LogLevel.WARN, data);
    };

    /**
     * Log a message at ERROR level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.error = function (data) {
      this.log(LogLevel.ERROR, data);
    };

    /**
     * Log a message at FATAL level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.fatal = function (data) {
      this.log(LogLevel.FATAL, data);
    };

    /**
     * Internal logging method
     * @param {string} level The log level
     * @param {Object|string} data The log data or message
     */
    CyberEyes.prototype.log = function (level, data) {
      // Check if we should log this level
      if (!this.shouldLog(level)) return;

      // Normalize data
      var logData = typeof data === 'string'
        ? { message: data }
        : (data || {});

      // Create log entry
      var logEntry = Object.assign({
        timestamp: new Date().toISOString(),
        level: level,
        service: this.service,
        component: this.component
      }, logData);

      // Add trace context if available
      if (traceContext.traceId) {
        logEntry.traceId = traceContext.traceId;
        logEntry.spanId = traceContext.spanId;
      }

      // Process log entry
      this.processLogEntry(logEntry);
    };

    /**
     * Process a log entry
     * @param {Object} logEntry The log entry
     */
    CyberEyes.prototype.processLogEntry = function (logEntry) {
      // Log to configured transports
      for (var i = 0; i < config.transports.length; i++) {
        var transport = config.transports[i];
        if (transport.type === 'console') {
          this.logToConsole(logEntry, transport);
        }
      }
    };

    /**
     * Log to console
     * @param {Object} logEntry The log entry
     * @param {Object} options Transport options
     */
    CyberEyes.prototype.logToConsole = function (logEntry, options) {
      var level = logEntry.level, message = logEntry.message, rest = Object.assign({}, logEntry);
      delete rest.level;
      delete rest.message;

      var prefix = "[" + level + "] [" + this.service + ":" + this.component + "]";

      switch (level) {
        case LogLevel.TRACE:
        case LogLevel.DEBUG:
          console.debug(prefix + " " + (message || ''), message ? rest : logEntry);
          break;
        case LogLevel.INFO:
          console.info(prefix + " " + (message || ''), message ? rest : logEntry);
          break;
        case LogLevel.WARN:
          console.warn(prefix + " " + (message || ''), message ? rest : logEntry);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(prefix + " " + (message || ''), message ? rest : logEntry);
          break;
      }
    };

    /**
     * Wrap a function with automatic entry/exit logging
     * @param {Function} fn - The function to wrap
     * @param {Object} options - Options for the wrapper
     * @returns {Function} The wrapped function
     */
    CyberEyes.prototype.wrapFunction = function(fn, options) {
      if (options === void 0) { options = {}; }

      var logger = this;
      var functionName = options.name || fn.name || 'anonymous';

      return function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        var startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

        // Entry log
        logger.trace({
          function: functionName,
          message: "Entering " + functionName,
          params: args
        });

        try {
          var result = fn.apply(this, args);

          // Handle promises
          if (result instanceof Promise) {
            return result.then(
              // Success handler
              function(value) {
                var duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

                logger.trace({
                  function: functionName,
                  message: "Exiting " + functionName,
                  result: value,
                  duration: duration
                });

                return value;
              },
              // Error handler
              function(error) {
                var duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

                logger.error({
                  function: functionName,
                  message: "Error in " + functionName + ": " + error.message,
                  error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                  },
                  duration: duration
                });

                throw error;
              }
            );
          }

          // Handle synchronous functions
          var duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

          logger.trace({
            function: functionName,
            message: "Exiting " + functionName,
            result: result,
            duration: duration
          });

          return result;
        } catch (error) {
          var duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

          logger.error({
            function: functionName,
            message: "Error in " + functionName + ": " + error.message,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            duration: duration
          });

          throw error;
        }
      };
    };

    return CyberEyes;
  }());

  // Export public API
  exports.CyberEyes = CyberEyes;
  exports.LogLevel = LogLevel;
  exports.configure = configure;
  exports.getTraceContext = getTraceContext;
  exports.setComponentLogLevel = setComponentLogLevel;
  exports.setLogLevel = setLogLevel;
  exports.setServiceLogLevel = setServiceLogLevel;
  exports.setTraceContext = setTraceContext;
  exports.startChildSpan = startChildSpan;
  exports.startTrace = startTrace;
  exports.default = CyberEyes;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
