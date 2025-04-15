# Cyber-Eyes Logging Specification

## Overview

Cyber-Eyes is a comprehensive logging system designed for the WebAX ecosystem, with a particular focus on the Cyberdeck platform. It provides granular, context-aware logging with dynamic control over log levels, enabling developers to implement detailed logging while maintaining optimal performance in production.

## Core Principles

1. **Complete Introspection**: Every function call, parameter, and response should be loggable
2. **Dynamic Granularity**: Log levels can be adjusted at runtime for specific components
3. **Context Propagation**: Trace context flows through the entire application
4. **OpenAPI Integration**: Logging can be dynamically enabled for specific API calls
5. **Standardized Format**: All logs follow a consistent JSON structure
6. **Performance First**: Minimal overhead in production environments

## Log Format

### JSON Structure

All logs are structured as JSON objects with the following fields:

```json
{
  "timestamp": "2025-04-13T12:34:56.789Z",
  "level": "INFO",
  "service": "emulator",
  "component": "nes",
  "function": "loadROM",
  "traceId": "abc123def456",
  "spanId": "789ghi012",
  "message": "ROM loaded successfully",
  "params": {
    "romPath": "games/super_mario_bros.nes",
    "options": {
      "region": "NTSC"
    }
  },
  "result": {
    "success": true,
    "romSize": 40976,
    "checksumValid": true
  },
  "duration": 12.34,
  "context": {
    "userId": "user123",
    "sessionId": "session456"
  }
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | String | ISO 8601 timestamp of when the log was created |
| `level` | String | Log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL) |
| `service` | String | Name of the service generating the log |
| `component` | String | Name of the component within the service |
| `function` | String | Name of the function being logged |
| `traceId` | String | Unique identifier for the current trace (request) |
| `spanId` | String | Unique identifier for the current span (operation) |
| `message` | String | Human-readable log message |
| `params` | Object | Input parameters to the function (optional) |
| `result` | Object | Return value or output of the function (optional) |
| `duration` | Number | Execution time in milliseconds (optional) |
| `context` | Object | Additional contextual information (optional) |
| `error` | Object | Error details if applicable (optional) |

## Severity Levels

Cyber-Eyes defines six log levels in order of increasing severity:

| Level | Description | Example Use |
|-------|-------------|-------------|
| `TRACE` | Extremely detailed information | Function entry/exit, variable values |
| `DEBUG` | Detailed information for debugging | Intermediate calculation results |
| `INFO` | Normal operational information | ROM loaded, game started |
| `WARN` | Potential issues that don't affect operation | Slow performance, deprecated feature use |
| `ERROR` | Errors that affect specific operations | Failed to load ROM, API error |
| `FATAL` | Critical errors that may crash the system | Out of memory, unhandled exception |

## Dynamic Log Level Control

### Global Log Level

The global minimum log level can be set for the entire application:

```javascript
CyberEyes.setLogLevel(LogLevel.INFO);
```

### Component-Specific Log Levels

Log levels can be set for specific services or components:

```javascript
CyberEyes.setComponentLogLevel('emulator', 'nes', LogLevel.DEBUG);
```

### Request-Specific Log Levels

For API calls, clients can request a specific log level for that request:

```http
GET /api/games HTTP/1.1
X-Log-Level: DEBUG
```

## Trace Context

### Trace and Span IDs

Each request or user interaction initiates a trace with a unique `traceId`. Within that trace, each operation (function call, API request, etc.) gets a unique `spanId`. This allows for distributed tracing across services.

```javascript
// Start a new trace
const traceContext = CyberEyes.startTrace();
// { traceId: 'abc123...', spanId: 'def456...' }

// Get the current trace context
const currentContext = CyberEyes.getTraceContext();

// Set the trace context (e.g., from an incoming request)
CyberEyes.setTraceContext({ traceId: 'ghi789...', spanId: 'jkl012...' });
```

### Context Propagation

Trace context is propagated through:

1. **HTTP Headers**: `X-Trace-ID` and `X-Span-ID`
2. **Function Calls**: Automatically when using wrapped functions
3. **Event Listeners**: Via the event payload
4. **Worker Threads**: Via the message payload

## Function Instrumentation

### Manual Logging

Functions can be manually instrumented with entry and exit logging:

```javascript
function loadROM(romPath, options) {
  // Entry log
  logger.trace({
    function: "loadROM",
    message: "Entering loadROM function",
    params: { romPath, options }
  });

  const startTime = performance.now();

  try {
    // Function implementation
    const result = doLoadROM(romPath, options);

    // Exit log (success)
    logger.trace({
      function: "loadROM",
      message: "Exiting loadROM function",
      result: result,
      duration: performance.now() - startTime
    });

    return result;
  } catch (error) {
    // Exit log (error)
    logger.error({
      function: "loadROM",
      message: `Error in loadROM: ${error.message}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      duration: performance.now() - startTime
    });

    throw error;
  }
}
```

### Automatic Function Wrapping

Functions can be automatically wrapped to add entry/exit logging:

```javascript
// Define a function with automatic logging
const loadROM = logger.wrapFunction((romPath, options) => {
  // Function implementation
  return doLoadROM(romPath, options);
}, { name: 'loadROM' });
```

### Method Decorators

For class methods, decorators can be used:

```javascript
class EmulatorService {
  @CyberEyes.log()
  async loadROM(romPath, options) {
    // Method implementation
    return this.doLoadROM(romPath, options);
  }
}
```

## OpenAPI Integration

### Server-Side Integration

For server-side OpenAPI implementations, Cyber-Eyes provides middleware that:

1. Logs all API requests and responses
2. Respects client-requested log levels via the `log-level` parameter
3. Propagates trace context
4. Provides detailed performance metrics
5. Returns relevant logs in the API response when requested

```javascript
// Express.js example
app.use(CyberEyes.createOpenAPILoggerMiddleware({
  service: 'games-api'
}));
```

#### Log Level Parameter

API clients can request logs by including a `log-level` parameter in their request:

```http
GET /api/games?log-level=DEBUG HTTP/1.1
```

Or in the request body for POST/PUT operations:

```json
{
  "name": "New Game",
  "description": "Game description",
  "log-level": "DEBUG"
}
```

When a `log-level` parameter is provided, the API response will include a `logs` field containing all logs generated during the request processing that meet or exceed the specified level:

```json
{
  "data": [...],
  "logs": [
    {
      "timestamp": "2025-04-13T12:34:56.789Z",
      "level": "INFO",
      "service": "games-api",
      "component": "database",
      "message": "Retrieved 10 games from database",
      "duration": 12.34
    },
    {
      "timestamp": "2025-04-13T12:34:56.800Z",
      "level": "DEBUG",
      "service": "games-api",
      "component": "cache",
      "message": "Cache miss for query: popular-games"
    }
  ]
}
```

### Client-Side Integration

For API clients, Cyber-Eyes provides interceptors that:

1. Log all API requests and responses
2. Allow requesting specific log levels for operations
3. Propagate trace context
4. Track request performance
5. Process returned logs from the server

```javascript
// Axios example
axios.interceptors.request.use(
  CyberEyes.apiClient.logRequest,
  CyberEyes.apiClient.logError
);

axios.interceptors.response.use(
  CyberEyes.apiClient.logResponse,
  CyberEyes.apiClient.logError
);

// Request with log level
axios.get('/api/games', {
  params: {
    'log-level': 'DEBUG'
  }
}).then(response => {
  // Access logs returned from the server
  const logs = response.data.logs;
  if (logs) {
    logs.forEach(log => {
      console.log(`[${log.level}] ${log.message}`);
    });
  }
});
```

## Performance Considerations

### Lazy Evaluation

Expensive operations in log messages are evaluated only if the log will actually be output:

```javascript
logger.debug({
  message: "Complex calculation result",
  result: () => performExpensiveCalculation() // Only called if DEBUG level is enabled
});
```

### Sampling

For high-volume logs, sampling can be enabled:

```javascript
CyberEyes.configure({
  sampling: {
    enabled: true,
    rate: 0.1 // Log 10% of entries
  }
});
```

### Buffering

Logs can be buffered and flushed periodically to reduce I/O overhead:

```javascript
CyberEyes.configure({
  buffering: {
    enabled: true,
    size: 100,
    flushInterval: 5000 // Flush every 5 seconds
  }
});
```

## Log Storage and Analysis

### Local Storage

During development, logs can be stored locally:

1. **Console**: Output to browser or Node.js console
2. **File**: Write to log files (Node.js)
3. **IndexedDB**: Store in browser database

### Remote Storage

In production, logs can be sent to remote systems:

1. **HTTP Endpoint**: Send logs to a collection service
2. **WebSocket**: Stream logs in real-time
3. **Service Worker**: Queue and batch logs for sending

### Log Viewer

The Cyber-Eyes Log Viewer provides:

1. **Filtering**: By service, component, level, etc.
2. **Search**: Full-text search across logs
3. **Trace View**: Visualize request flow across components
4. **Timeline**: View logs chronologically
5. **Export**: Download logs for offline analysis

## Security Considerations

### Sensitive Data

Cyber-Eyes automatically redacts sensitive information:

1. **Passwords**: Any field containing 'password', 'pwd', etc.
2. **Tokens**: Authentication tokens, API keys, etc.
3. **Personal Data**: SSNs, credit card numbers, etc.

### Compliance

For compliance with regulations like GDPR:

1. **Data Minimization**: Only log what's necessary
2. **Retention Policies**: Automatically delete old logs
3. **Access Control**: Restrict who can view logs

## Implementation Requirements

### Core Library

The core Cyber-Eyes library must:

1. Be lightweight (<10KB gzipped)
2. Have zero dependencies
3. Support both browser and Node.js environments
4. Be tree-shakable for minimal bundle size

### Extensions

Additional functionality is provided through extensions:

1. **OpenAPI**: Integration with OpenAPI/Swagger
2. **Transport**: Various log transport mechanisms
3. **Viewer**: UI for viewing and analyzing logs
4. **Storage**: Different storage backends

## Integration with WebAX

As part of the WebAX ecosystem, Cyber-Eyes:

1. Is included in the WebAX-Lib standard library
2. Integrates with the Cyberdeck Launcher for system-wide logging
3. Provides consistent logging across all WebAX applications
4. Supports the WebAX distribution and networking architecture

## Example Implementation

### Basic Usage

```javascript
import { CyberEyes, LogLevel } from 'webax-lib/cyber-eyes';

// Create a logger for a specific service and component
const logger = new CyberEyes('game-service', 'rom-loader');

// Set the global minimum log level
CyberEyes.setLogLevel(LogLevel.INFO);

// Log an informational message
logger.info({
  message: 'Game loaded successfully',
  gameId: 'super-mario-bros',
  loadTime: 120
});

// Log an error
try {
  // Some operation that might fail
} catch (error) {
  logger.error({
    message: 'Failed to load game',
    gameId: 'super-mario-bros',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });
}
```

### Advanced Usage

```javascript
import { CyberEyes, LogLevel } from 'webax-lib/cyber-eyes';

// Configure the logger
CyberEyes.configure({
  defaultLevel: LogLevel.INFO,
  sampling: {
    enabled: true,
    rate: 0.5 // Log 50% of entries
  },
  transports: [
    { type: 'console' },
    {
      type: 'http',
      url: 'https://logs.example.com/collect',
      batchSize: 50
    }
  ]
});

// Create a logger
const logger = new CyberEyes('user-service', 'authentication');

// Create a wrapped function with automatic logging
const authenticateUser = logger.wrapFunction(
  async (username, password) => {
    // Authentication logic
    const user = await database.findUser(username);

    if (!user || !comparePassword(password, user.passwordHash)) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      roles: user.roles
    };
  },
  { name: 'authenticateUser' }
);

// Use the wrapped function
try {
  const user = await authenticateUser('johndoe', 'password123');

  // Additional logging
  logger.info({
    message: 'User authenticated successfully',
    userId: user.id,
    context: {
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }
  });
} catch (error) {
  // Error already logged by the wrapped function
  // Handle the error
}
```

## Conclusion

The Cyber-Eyes logging system provides a comprehensive solution for logging in WebAX applications, with a focus on performance, flexibility, and developer experience. By following this specification, developers can implement consistent, detailed logging across their applications while maintaining control over performance and resource usage.
