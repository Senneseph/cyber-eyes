# Cyber-Eyes

A comprehensive, high-performance logging system for WebAX applications.

## Overview

Cyber-Eyes is a logging library designed for the WebAX ecosystem, with a particular focus on the Cyberdeck platform. It provides granular, context-aware logging with dynamic control over log levels, enabling developers to implement detailed logging while maintaining optimal performance in production.

## Key Features

- **Dynamic Granularity**: Adjust log levels at runtime for specific components
- **OpenAPI Integration**: Dynamically enable logging for specific API calls
- **Trace Context**: Track requests across service boundaries
- **Performance First**: Minimal overhead in production environments
- **Standardized Format**: Consistent JSON structure for all logs
- **Function Instrumentation**: Automatic entry/exit logging for functions

## Installation

```bash
npm install @webax/cyber-eyes
```

## Basic Usage

```javascript
import { CyberEyes, LogLevel } from '@webax/cyber-eyes';

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

## Dynamic Log Level Control

One of the key features of Cyber-Eyes is the ability to dynamically control log levels at runtime:

```javascript
// Set global log level
CyberEyes.setLogLevel(LogLevel.INFO);

// Set log level for a specific service
CyberEyes.setServiceLogLevel('game-service', LogLevel.DEBUG);

// Set log level for a specific component
CyberEyes.setComponentLogLevel('game-service', 'rom-loader', LogLevel.TRACE);
```

For API calls, clients can request a specific log level for that request:

```http
GET /api/games HTTP/1.1
X-Log-Level: DEBUG
```

## Function Instrumentation

Cyber-Eyes can automatically log function entry and exit:

```javascript
// Define a function with automatic logging
const loadROM = logger.wrapFunction((romPath, options) => {
  // Function implementation
  return doLoadROM(romPath, options);
}, { name: 'loadROM' });

// Use the wrapped function
const result = loadROM('games/super-mario-bros.nes', { region: 'NTSC' });
```

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

Cyber-Eyes integrates seamlessly with OpenAPI and provides dynamic log level control through API parameters:

```javascript
// Express.js example
app.use(CyberEyes.createOpenAPILoggerMiddleware({
  service: 'games-api'
}));

// Axios example
axios.interceptors.request.use(
  CyberEyes.apiClient.logRequest,
  CyberEyes.apiClient.logError
);

axios.interceptors.response.use(
  CyberEyes.apiClient.logResponse,
  CyberEyes.apiClient.logError
);

// Request with log level parameter
axios.get('/api/games', {
  params: {
    'log-level': 'DEBUG'
  }
}).then(response => {
  // Access logs returned from the server
  const logs = response.data.logs;
  if (logs) {
    console.log('Server logs:', logs);
  }
});
```

When a `log-level` parameter is included in the request, the server will:

1. Temporarily set the log level for that specific request
2. Collect all logs generated during request processing
3. Include relevant logs in the API response

This allows for dynamic debugging without changing server configuration.

## Performance Considerations

Cyber-Eyes is designed to be high-performance, with features like:

- **Lazy Evaluation**: Expensive operations are only evaluated if needed
- **Sampling**: Log only a percentage of entries for high-volume logs
- **Buffering**: Buffer logs and flush periodically to reduce I/O overhead

```javascript
CyberEyes.configure({
  sampling: {
    enabled: true,
    rate: 0.1 // Log 10% of entries
  },
  buffering: {
    enabled: true,
    size: 100,
    flushInterval: 5000 // Flush every 5 seconds
  }
});
```

## Log Format

All logs follow a standardized JSON format:

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

## Project Structure

This repository follows the WebAX project structure:

- `/app` - Interactive demo application for Cyber-Eyes
- `/cicd` - Continuous integration and deployment configuration
- `/develop` - Development files (source code, tests, examples)
- `/dist` - Distribution files (compiled library)
- `/docs` - Documentation

## Documentation

For detailed documentation, see:

- [Specification](./docs/SPECIFICATION.md): Detailed specification of the Cyber-Eyes logging system
- [API Reference](./docs/API.md): Complete API reference
- [Examples](./develop/examples/): Example implementations

## Integration with WebAX

As part of the WebAX ecosystem, Cyber-Eyes:

- Is included in the WebAX-Lib standard library
- Integrates with the Cyberdeck Launcher for system-wide logging
- Provides consistent logging across all WebAX applications
- Supports the WebAX distribution and networking architecture

## License

MIT
