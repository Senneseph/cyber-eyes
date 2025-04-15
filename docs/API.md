# Cyber-Eyes API Reference

## Table of Contents

- [Core API](#core-api)
  - [CyberEyes Class](#cybereyes-class)
  - [LogLevel Enum](#loglevel-enum)
  - [Global Functions](#global-functions)
- [Configuration](#configuration)
  - [Configuration Options](#configuration-options)
  - [Transport Configuration](#transport-configuration)
- [Logging Methods](#logging-methods)
  - [Basic Logging](#basic-logging)
  - [Structured Logging](#structured-logging)
- [Function Instrumentation](#function-instrumentation)
  - [Function Wrapping](#function-wrapping)
  - [Method Decorators](#method-decorators)
- [Trace Context](#trace-context)
  - [Trace Management](#trace-management)
  - [Context Propagation](#context-propagation)
- [OpenAPI Integration](#openapi-integration)
  - [Server Middleware](#server-middleware)
  - [Client Interceptors](#client-interceptors)
- [Advanced Features](#advanced-features)
  - [Sampling](#sampling)
  - [Buffering](#buffering)
  - [Filtering](#filtering)

## Core API

### CyberEyes Class

The main class for creating loggers.

#### Constructor

```javascript
new CyberEyes(service, component, options)
```

- `service` (string): The name of the service generating logs
- `component` (string): The name of the component within the service
- `options` (object, optional): Configuration options for this logger instance

#### Example

```javascript
const logger = new CyberEyes('game-service', 'rom-loader', {
  level: LogLevel.DEBUG
});
```

### LogLevel Enum

Defines the available log levels.

```javascript
const LogLevel = {
  TRACE: 'TRACE',
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};
```

### Global Functions

#### setLogLevel

Sets the global minimum log level.

```javascript
CyberEyes.setLogLevel(level)
```

- `level` (LogLevel): The minimum log level to display

#### configure

Configures the global logger settings.

```javascript
CyberEyes.configure(options)
```

- `options` (object): Configuration options

#### getLogger

Gets or creates a logger for a specific service and component.

```javascript
CyberEyes.getLogger(service, component, options)
```

- `service` (string): The service name
- `component` (string): The component name
- `options` (object, optional): Configuration options
- Returns: A CyberEyes logger instance

## Configuration

### Configuration Options

```javascript
CyberEyes.configure({
  // Default log level
  defaultLevel: LogLevel.INFO,
  
  // Sampling configuration
  sampling: {
    enabled: true,
    rate: 0.1 // Log 10% of entries
  },
  
  // Buffering configuration
  buffering: {
    enabled: true,
    size: 100,
    flushInterval: 5000 // Flush every 5 seconds
  },
  
  // Redaction configuration
  redaction: {
    enabled: true,
    keys: ['password', 'token', 'secret', 'key', 'credential', 'authorization'],
    replacementText: '[REDACTED]'
  },
  
  // Transport configuration
  transports: [
    { type: 'console' },
    { 
      type: 'http', 
      url: 'https://logs.example.com/collect',
      batchSize: 50
    }
  ]
});
```

### Transport Configuration

#### Console Transport

```javascript
{
  type: 'console',
  colorize: true,
  includeTimestamp: true
}
```

#### HTTP Transport

```javascript
{
  type: 'http',
  url: 'https://logs.example.com/collect',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  batchSize: 50,
  retryCount: 3,
  retryDelay: 1000
}
```

#### File Transport (Node.js only)

```javascript
{
  type: 'file',
  filename: 'logs/app.log',
  maxSize: '10m',
  maxFiles: 5,
  compress: true
}
```

#### IndexedDB Transport (Browser only)

```javascript
{
  type: 'indexeddb',
  dbName: 'cyber-eyes-logs',
  storeName: 'logs',
  maxEntries: 10000
}
```

## Logging Methods

### Basic Logging

```javascript
logger.trace(message, ...args)
logger.debug(message, ...args)
logger.info(message, ...args)
logger.warn(message, ...args)
logger.error(message, ...args)
logger.fatal(message, ...args)
```

- `message` (string): The log message
- `args` (any): Additional arguments to include in the log

#### Example

```javascript
logger.info('User logged in', { userId: 'user123' });
```

### Structured Logging

```javascript
logger.trace(data)
logger.debug(data)
logger.info(data)
logger.warn(data)
logger.error(data)
logger.fatal(data)
```

- `data` (object): Structured log data

#### Example

```javascript
logger.info({
  message: 'User logged in',
  userId: 'user123',
  timestamp: new Date().toISOString(),
  context: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
});
```

## Function Instrumentation

### Function Wrapping

Wraps a function with automatic entry/exit logging.

```javascript
logger.wrapFunction(fn, options)
```

- `fn` (function): The function to wrap
- `options` (object): Options for the wrapped function
  - `name` (string): Name of the function (defaults to fn.name)
  - `level` (LogLevel): Log level for entry/exit logs (defaults to TRACE)
  - `logParams` (boolean): Whether to log function parameters (defaults to true)
  - `logResult` (boolean): Whether to log function result (defaults to true)
- Returns: The wrapped function

#### Example

```javascript
const loadROM = logger.wrapFunction((romPath, options) => {
  // Function implementation
  return doLoadROM(romPath, options);
}, { 
  name: 'loadROM',
  level: LogLevel.DEBUG
});
```

### Method Decorators

Decorates a class method with automatic entry/exit logging.

```javascript
CyberEyes.log(options)
```

- `options` (object): Options for the decorated method
  - `level` (LogLevel): Log level for entry/exit logs (defaults to TRACE)
  - `logParams` (boolean): Whether to log method parameters (defaults to true)
  - `logResult` (boolean): Whether to log method result (defaults to true)
- Returns: Method decorator

#### Example

```javascript
class EmulatorService {
  @CyberEyes.log({
    level: LogLevel.DEBUG,
    logParams: true,
    logResult: true
  })
  async loadROM(romPath, options) {
    // Method implementation
    return this.doLoadROM(romPath, options);
  }
}
```

## Trace Context

### Trace Management

#### startTrace

Starts a new trace context.

```javascript
CyberEyes.startTrace(traceId)
```

- `traceId` (string, optional): Optional trace ID (generated if not provided)
- Returns: The trace context object

#### getTraceContext

Gets the current trace context.

```javascript
CyberEyes.getTraceContext()
```

- Returns: The current trace context object

#### setTraceContext

Sets the current trace context.

```javascript
CyberEyes.setTraceContext(context)
```

- `context` (object): The trace context object
  - `traceId` (string): The trace ID
  - `spanId` (string, optional): The span ID (generated if not provided)

### Context Propagation

#### extractTraceContext

Extracts trace context from HTTP headers or other sources.

```javascript
CyberEyes.extractTraceContext(headers)
```

- `headers` (object): HTTP headers or similar object
- Returns: The extracted trace context, or null if not found

#### injectTraceContext

Injects the current trace context into HTTP headers or other targets.

```javascript
CyberEyes.injectTraceContext(headers)
```

- `headers` (object): HTTP headers or similar object to inject into
- Returns: The modified headers object

## OpenAPI Integration

### Server Middleware

#### createOpenAPILoggerMiddleware

Creates middleware for logging OpenAPI requests and responses.

```javascript
CyberEyes.createOpenAPILoggerMiddleware(options)
```

- `options` (object): Middleware options
  - `service` (string): The service name (defaults to 'api')
  - `level` (LogLevel): Default log level (defaults to INFO)
  - `logRequest` (boolean): Whether to log requests (defaults to true)
  - `logResponse` (boolean): Whether to log responses (defaults to true)
  - `logHeaders` (boolean): Whether to log headers (defaults to true)
  - `logBody` (boolean): Whether to log request/response bodies (defaults to true)
  - `maxBodySize` (number): Maximum body size to log in bytes (defaults to 10240)
- Returns: Middleware function

#### Example (Express.js)

```javascript
app.use(CyberEyes.createOpenAPILoggerMiddleware({
  service: 'games-api',
  level: LogLevel.INFO
}));
```

### Client Interceptors

#### apiClient

Object containing API client interceptors.

```javascript
CyberEyes.apiClient.logRequest(config)
CyberEyes.apiClient.logResponse(response)
CyberEyes.apiClient.logError(error)
```

#### Example (Axios)

```javascript
axios.interceptors.request.use(
  CyberEyes.apiClient.logRequest,
  CyberEyes.apiClient.logError
);

axios.interceptors.response.use(
  CyberEyes.apiClient.logResponse,
  CyberEyes.apiClient.logError
);
```

## Advanced Features

### Sampling

Controls the percentage of logs that are actually output.

```javascript
CyberEyes.configure({
  sampling: {
    enabled: true,
    rate: 0.1, // Log 10% of entries
    consistent: true // Use consistent sampling based on traceId
  }
});
```

### Buffering

Buffers logs and flushes them periodically or when the buffer is full.

```javascript
CyberEyes.configure({
  buffering: {
    enabled: true,
    size: 100, // Buffer size
    flushInterval: 5000, // Flush every 5 seconds
    flushOnExit: true // Flush when the application exits
  }
});
```

### Filtering

Filters logs based on various criteria.

```javascript
CyberEyes.configure({
  filters: [
    {
      // Only log errors from the 'auth' service
      service: 'auth',
      level: LogLevel.ERROR
    },
    {
      // Log everything from the 'payment' service
      service: 'payment'
    },
    {
      // Log only specific functions from any service
      function: ['processPayment', 'validateCard']
    }
  ]
});
```
