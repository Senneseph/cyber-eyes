/**
 * Cyber-Eyes Basic Usage Example
 * 
 * This example demonstrates the basic usage of the Cyber-Eyes logging system.
 */

// Import the Cyber-Eyes library
import { CyberEyes, LogLevel } from '@webax/cyber-eyes';

// Configure the global logger settings
CyberEyes.configure({
  defaultLevel: LogLevel.INFO,
  transports: [
    { type: 'console', colorize: true }
  ]
});

// Create a logger for a specific service and component
const logger = new CyberEyes('game-service', 'rom-loader');

// Basic logging examples
logger.trace('This is a trace message'); // Won't be logged (below default level)
logger.debug('This is a debug message'); // Won't be logged (below default level)
logger.info('This is an info message'); // Will be logged
logger.warn('This is a warning message'); // Will be logged
logger.error('This is an error message'); // Will be logged
logger.fatal('This is a fatal message'); // Will be logged

// Structured logging examples
logger.info({
  message: 'Game loaded successfully',
  gameId: 'super-mario-bros',
  loadTime: 120,
  context: {
    userId: 'user123',
    sessionId: 'session456'
  }
});

// Error logging example
try {
  throw new Error('Failed to load game');
} catch (error) {
  logger.error({
    message: 'Error loading game',
    gameId: 'super-mario-bros',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });
}

// Function wrapping example
const loadGame = logger.wrapFunction((gameId, options) => {
  logger.info({
    message: `Loading game ${gameId}`,
    options
  });
  
  // Simulate game loading
  if (gameId === 'invalid-game') {
    throw new Error('Game not found');
  }
  
  return {
    id: gameId,
    name: 'Super Mario Bros',
    size: 40976
  };
}, { name: 'loadGame' });

// Use the wrapped function
try {
  const game = loadGame('super-mario-bros', { region: 'NTSC' });
  console.log('Loaded game:', game);
} catch (error) {
  console.error('Failed to load game:', error.message);
}

// Try with an error
try {
  const game = loadGame('invalid-game', { region: 'NTSC' });
} catch (error) {
  console.error('Expected error:', error.message);
}

// Changing log levels dynamically
logger.info('Changing log level to DEBUG');
CyberEyes.setLogLevel(LogLevel.DEBUG);

// Now debug messages will be logged
logger.debug('This debug message will now be logged');

// Component-specific log levels
const romLogger = new CyberEyes('game-service', 'rom-parser');
CyberEyes.setComponentLogLevel('game-service', 'rom-parser', LogLevel.TRACE);

// This will be logged even though the global level is DEBUG
romLogger.trace('This trace message will be logged for the rom-parser component');

// But trace messages for other components still won't be logged
logger.trace('This trace message still won\'t be logged for the rom-loader component');

// Trace context example
const traceContext = CyberEyes.startTrace();
logger.info({
  message: 'Started a new trace',
  traceId: traceContext.traceId,
  spanId: traceContext.spanId
});

// Child spans
function processROM() {
  const parentSpanId = CyberEyes.getTraceContext().spanId;
  const childSpan = CyberEyes.startChildSpan();
  
  logger.info({
    message: 'Processing ROM in a child span',
    parentSpanId,
    spanId: childSpan.spanId
  });
  
  // Restore parent span
  CyberEyes.setTraceContext({
    traceId: childSpan.traceId,
    spanId: parentSpanId
  });
}

processROM();

// Lazy evaluation example
const expensiveOperation = () => {
  logger.info('Calculating expensive result...');
  // Simulate expensive calculation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += i;
  }
  return result;
};

// This won't execute expensiveOperation() if the TRACE level is not enabled
logger.trace({
  message: 'Expensive calculation result',
  result: () => expensiveOperation()
});

// But this will execute it because INFO level is enabled
logger.info({
  message: 'Expensive calculation result',
  result: () => expensiveOperation()
});
