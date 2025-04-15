/**
 * Cyber-Eyes Demo Application
 *
 * This file contains the interactive demo for the Cyber-Eyes logging system.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the demo
  initDemo();
});

/**
 * Initialize the demo application
 */
function initDemo() {
  // Initialize Cyber-Eyes
  CyberEyes.configure({
    defaultLevel: CyberEyes.LogLevel.INFO,
    transports: [
      { type: 'console', colorize: true }
    ]
  });

  // Create loggers for different components
  const loggers = {
    ui: new CyberEyes('demo', 'ui'),
    api: new CyberEyes('demo', 'api'),
    game: new CyberEyes('demo', 'game'),
    audio: new CyberEyes('demo', 'audio'),
    input: new CyberEyes('demo', 'input')
  };

  // Get DOM elements
  const logOutput = document.getElementById('log-output');
  const componentSelect = document.getElementById('component-select');
  const autoScrollCheckbox = document.getElementById('auto-scroll');
  const clearLogsButton = document.getElementById('btn-clear-logs');
  const logLevelRadios = document.querySelectorAll('input[name="log-level"]');

  // Set up log level change handlers
  logLevelRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const level = e.target.value;
      CyberEyes.setLogLevel(level);
      addLogEntry({
        level: 'INFO',
        message: `Global log level set to ${level}`,
        service: 'demo',
        component: 'ui',
        timestamp: new Date().toISOString()
      });
    });
  });

  // Set up component-specific log level
  componentSelect.addEventListener('change', (e) => {
    const component = e.target.value;
    if (component === 'all') {
      // Reset all components to global level
      Object.keys(loggers).forEach(comp => {
        const level = getSelectedLogLevel();
        CyberEyes.setComponentLogLevel('demo', comp, level);
      });

      addLogEntry({
        level: 'INFO',
        message: `All components set to ${getSelectedLogLevel()}`,
        service: 'demo',
        component: 'ui',
        timestamp: new Date().toISOString()
      });
    } else {
      // Set specific component to TRACE for detailed logging
      CyberEyes.setComponentLogLevel('demo', component, CyberEyes.LogLevel.TRACE);

      addLogEntry({
        level: 'INFO',
        message: `Component '${component}' set to TRACE level`,
        service: 'demo',
        component: 'ui',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Set up log buttons
  document.getElementById('btn-log-trace').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].trace({
      message: 'This is a TRACE message',
      details: 'Very detailed information for debugging'
    });
  });

  document.getElementById('btn-log-debug').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].debug({
      message: 'This is a DEBUG message',
      details: 'Detailed information useful for debugging'
    });
  });

  document.getElementById('btn-log-info').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].info({
      message: 'This is an INFO message',
      details: 'Normal operational information'
    });
  });

  document.getElementById('btn-log-warn').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].warn({
      message: 'This is a WARN message',
      details: 'Warning about potential issues'
    });
  });

  document.getElementById('btn-log-error').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].error({
      message: 'This is an ERROR message',
      details: 'Error that affects operation'
    });
  });

  document.getElementById('btn-log-fatal').addEventListener('click', () => {
    const component = getSelectedComponent();
    loggers[component].fatal({
      message: 'This is a FATAL message',
      details: 'Critical error that may crash the system'
    });
  });

  // Set up scenario buttons
  document.getElementById('btn-scenario-game').addEventListener('click', () => {
    runGameScenario(loggers);
  });

  document.getElementById('btn-scenario-api').addEventListener('click', () => {
    runApiScenario(loggers);
  });

  document.getElementById('btn-scenario-error').addEventListener('click', () => {
    runErrorScenario(loggers);
  });

  document.getElementById('btn-scenario-trace').addEventListener('click', () => {
    runTraceScenario(loggers);
  });

  // Set up clear logs button
  clearLogsButton.addEventListener('click', () => {
    logOutput.innerHTML = '';
    CyberEyes.clearLogs();
  });

  // Override console methods to capture logs
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  console.log = function(...args) {
    originalConsole.log(...args);
    processConsoleLog('DEBUG', ...args);
  };

  console.debug = function(...args) {
    originalConsole.debug(...args);
    processConsoleLog('DEBUG', ...args);
  };

  console.info = function(...args) {
    originalConsole.info(...args);
    processConsoleLog('INFO', ...args);
  };

  console.warn = function(...args) {
    originalConsole.warn(...args);
    processConsoleLog('WARN', ...args);
  };

  console.error = function(...args) {
    originalConsole.error(...args);
    processConsoleLog('ERROR', ...args);
  };

  // Process console logs
  function processConsoleLog(level, ...args) {
    // Check if this is a Cyber-Eyes log
    if (args.length >= 2 && typeof args[0] === 'string' && args[0].includes('[')) {
      const match = args[0].match(/\[([A-Z]+)\] \[([^:]+):([^\]]+)\]/);
      if (match) {
        const logLevel = match[1];
        const service = match[2];
        const component = match[3];

        // Extract message
        const message = args[0].substring(args[0].indexOf(']') + 1).trim();

        // Extract data
        const data = args.length > 1 ? args[1] : {};

        // Get the latest log from CyberEyes.getLogs() instead of creating a new one
        const logs = CyberEyes.getLogs();
        if (logs.length > 0) {
          const latestLog = logs[logs.length - 1];
          if (latestLog.level === logLevel && latestLog.service === service && latestLog.component === component) {
            addLogEntry(latestLog);
            return;
          }
        }

        // Fallback to creating a new log entry
        addLogEntry({
          level: logLevel,
          message,
          service,
          component,
          data,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Add a log entry to the UI
  function addLogEntry(entry) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${entry.level.toLowerCase()}`;

    // Format timestamp
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    // Create log content
    logEntry.innerHTML = `<span class="log-timestamp">${timestamp}</span> <span class="log-level">[${entry.level}]</span> <span class="log-source">[${entry.service}:${entry.component}]</span> <span class="log-message">${entry.message}</span>`;

    // Add data if available
    if (entry.data) {
      const dataStr = JSON.stringify(entry.data, null, 2);
      if (dataStr !== '{}') {
        const dataElement = document.createElement('pre');
        dataElement.className = 'log-data';
        dataElement.textContent = dataStr;
        logEntry.appendChild(dataElement);
      }
    }

    // Add to log output
    logOutput.appendChild(logEntry);

    // Auto-scroll if enabled
    if (autoScrollCheckbox.checked) {
      logOutput.scrollTop = logOutput.scrollHeight;
    }
  }

  // Helper function to get selected component
  function getSelectedComponent() {
    const component = componentSelect.value;
    return component === 'all' ? 'ui' : component;
  }

  // Helper function to get selected log level
  function getSelectedLogLevel() {
    const selected = document.querySelector('input[name="log-level"]:checked');
    return selected ? selected.value : 'INFO';
  }

  // Log initial message
  loggers.ui.info({
    message: 'Cyber-Eyes Demo initialized',
    timestamp: new Date().toISOString()
  });
}

/**
 * Run the game loading scenario
 * @param {Object} loggers The logger instances
 */
function runGameScenario(loggers) {
  // Start a new trace
  const trace = CyberEyes.startTrace();

  loggers.ui.info({
    message: 'User requested to load game',
    gameId: 'super-mario-bros',
    traceId: trace.traceId
  });

  // Game engine logs
  setTimeout(() => {
    loggers.game.debug({
      message: 'Initializing game engine',
      engineVersion: '1.0.0'
    });

    setTimeout(() => {
      loggers.game.debug({
        message: 'Loading ROM file',
        romPath: 'games/super-mario-bros.nes'
      });

      setTimeout(() => {
        loggers.game.info({
          message: 'ROM loaded successfully',
          romSize: 40976,
          checksumValid: true
        });

        // Audio logs
        setTimeout(() => {
          loggers.audio.debug({
            message: 'Initializing audio subsystem',
            sampleRate: 44100,
            channels: 2
          });

          setTimeout(() => {
            loggers.audio.info({
              message: 'Audio system ready',
              latency: 20
            });

            // Input logs
            setTimeout(() => {
              loggers.input.debug({
                message: 'Configuring input devices',
                devices: ['keyboard', 'gamepad']
              });

              setTimeout(() => {
                loggers.input.info({
                  message: 'Input devices configured',
                  activeControllers: 1
                });

                // Game started
                setTimeout(() => {
                  loggers.game.info({
                    message: 'Game started successfully',
                    gameId: 'super-mario-bros',
                    loadTime: 1250
                  });

                  loggers.ui.info({
                    message: 'Game is now running',
                    fps: 60
                  });
                }, 300);
              }, 200);
            }, 200);
          }, 200);
        }, 300);
      }, 500);
    }, 300);
  }, 200);
}

/**
 * Run the API request scenario
 * @param {Object} loggers The logger instances
 */
function runApiScenario(loggers) {
  // Start a new trace
  const trace = CyberEyes.startTrace();

  loggers.ui.info({
    message: 'User requested high scores',
    traceId: trace.traceId
  });

  // API request
  loggers.api.debug({
    message: 'Preparing API request',
    endpoint: '/api/scores',
    method: 'GET',
    params: { game: 'super-mario-bros', limit: 10 }
  });

  setTimeout(() => {
    loggers.api.debug({
      message: 'Sending API request',
      url: 'https://api.example.com/scores?game=super-mario-bros&limit=10'
    });

    setTimeout(() => {
      // Simulate network delay
      loggers.api.debug({
        message: 'Received API response',
        statusCode: 200,
        responseTime: 320
      });

      setTimeout(() => {
        loggers.api.info({
          message: 'API request completed successfully',
          dataSize: 1024
        });

        setTimeout(() => {
          loggers.ui.info({
            message: 'High scores displayed to user',
            scores: [
              { player: 'Player1', score: 50000 },
              { player: 'Player2', score: 45000 },
              { player: 'Player3', score: 40000 }
            ]
          });
        }, 200);
      }, 100);
    }, 500);
  }, 200);
}

/**
 * Run the error scenario
 * @param {Object} loggers The logger instances
 */
function runErrorScenario(loggers) {
  // Start a new trace
  const trace = CyberEyes.startTrace();

  loggers.ui.info({
    message: 'User requested to load game',
    gameId: 'invalid-game',
    traceId: trace.traceId
  });

  setTimeout(() => {
    loggers.game.debug({
      message: 'Initializing game engine',
      engineVersion: '1.0.0'
    });

    setTimeout(() => {
      loggers.game.debug({
        message: 'Loading ROM file',
        romPath: 'games/invalid-game.nes'
      });

      setTimeout(() => {
        loggers.game.warn({
          message: 'ROM file not found',
          romPath: 'games/invalid-game.nes'
        });

        setTimeout(() => {
          loggers.game.error({
            message: 'Failed to load ROM file',
            error: {
              name: 'FileNotFoundError',
              message: 'ROM file not found: games/invalid-game.nes',
              stack: 'Error: ROM file not found\n    at loadROM (game.js:42)\n    at startGame (engine.js:15)'
            }
          });

          setTimeout(() => {
            loggers.ui.error({
              message: 'Error loading game',
              gameId: 'invalid-game',
              errorMessage: 'ROM file not found'
            });
          }, 200);
        }, 300);
      }, 500);
    }, 300);
  }, 200);
}

/**
 * Run the trace context scenario
 * @param {Object} loggers The logger instances
 */
function runTraceScenario(loggers) {
  // Start a new trace
  const trace = CyberEyes.startTrace();

  loggers.ui.info({
    message: 'Starting distributed trace example',
    traceId: trace.traceId,
    spanId: trace.spanId
  });

  // UI component
  setTimeout(() => {
    const uiSpan = CyberEyes.startChildSpan();

    loggers.ui.debug({
      message: 'UI processing request',
      parentSpanId: trace.spanId,
      spanId: uiSpan.spanId
    });

    // API component
    setTimeout(() => {
      const apiSpan = CyberEyes.startChildSpan();

      loggers.api.debug({
        message: 'API handling request',
        parentSpanId: uiSpan.spanId,
        spanId: apiSpan.spanId
      });

      // Game component
      setTimeout(() => {
        const gameSpan = CyberEyes.startChildSpan();

        loggers.game.debug({
          message: 'Game engine processing',
          parentSpanId: apiSpan.spanId,
          spanId: gameSpan.spanId
        });

        setTimeout(() => {
          loggers.game.info({
            message: 'Game engine completed processing',
            spanId: gameSpan.spanId,
            duration: 250
          });

          // Back to API
          setTimeout(() => {
            loggers.api.info({
              message: 'API completed processing',
              spanId: apiSpan.spanId,
              duration: 450
            });

            // Back to UI
            setTimeout(() => {
              loggers.ui.info({
                message: 'UI completed processing',
                spanId: uiSpan.spanId,
                duration: 700
              });

              // Complete trace
              setTimeout(() => {
                loggers.ui.info({
                  message: 'Distributed trace completed',
                  traceId: trace.traceId,
                  totalDuration: 1000
                });
              }, 100);
            }, 100);
          }, 100);
        }, 250);
      }, 200);
    }, 150);
  }, 100);
}
