/**
 * Cyber-Eyes OpenAPI Integration Example
 * 
 * This example demonstrates how to integrate Cyber-Eyes with OpenAPI on both
 * the server and client sides.
 */

// Server-side integration (Express.js)
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend';
import { CyberEyes, LogLevel } from '@webax/cyber-eyes';

// Configure Cyber-Eyes
CyberEyes.configure({
  defaultLevel: LogLevel.INFO,
  transports: [
    { type: 'console', colorize: true },
    { 
      type: 'http', 
      url: 'https://logs.example.com/collect',
      batchSize: 50
    }
  ]
});

// Create an Express app
const app = express();
app.use(express.json());

// Create an OpenAPI backend
const api = new OpenAPIBackend({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Games API',
      version: '1.0.0'
    },
    paths: {
      '/games': {
        get: {
          operationId: 'getGames',
          responses: {
            '200': {
              description: 'List of games',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/games/{id}': {
        get: {
          operationId: 'getGameById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Game details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Game not found'
            }
          }
        }
      }
    }
  },
  handlers: {
    // Wrap operation handlers with Cyber-Eyes logging
    getGames: CyberEyes.wrapOpenAPIOperation(async (req, res) => {
      const logger = CyberEyes.getOperationLogger('getGames', 'games-api');
      
      logger.info({
        message: 'Fetching games list',
        query: req.query
      });
      
      // Simulate database query
      const games = [
        { id: 'game1', name: 'Super Mario Bros' },
        { id: 'game2', name: 'The Legend of Zelda' }
      ];
      
      return games;
    }, { operationId: 'getGames' }),
    
    getGameById: CyberEyes.wrapOpenAPIOperation(async (req, res) => {
      const logger = CyberEyes.getOperationLogger('getGameById', 'games-api');
      
      const { id } = req.params;
      
      logger.info({
        message: `Fetching game with ID: ${id}`,
        gameId: id
      });
      
      // Simulate database query
      if (id === 'game1') {
        return {
          id: 'game1',
          name: 'Super Mario Bros',
          description: 'Classic platformer game'
        };
      } else if (id === 'game2') {
        return {
          id: 'game2',
          name: 'The Legend of Zelda',
          description: 'Action-adventure game'
        };
      } else {
        logger.warn({
          message: `Game not found: ${id}`,
          gameId: id
        });
        
        res.status(404);
        return { error: 'Game not found' };
      }
    }, { operationId: 'getGameById' }),
    
    validationFail: (req, res, errors) => {
      const logger = new CyberEyes('games-api', 'validation');
      
      logger.error({
        message: 'Request validation failed',
        errors,
        path: req.path,
        method: req.method
      });
      
      res.status(400).json({ errors });
    },
    
    notFound: (req, res) => {
      const logger = new CyberEyes('games-api', 'router');
      
      logger.warn({
        message: 'Endpoint not found',
        path: req.path,
        method: req.method
      });
      
      res.status(404).json({ error: 'Not found' });
    }
  }
});

// Initialize the API
api.init();

// Add Cyber-Eyes middleware
app.use(CyberEyes.createOpenAPILoggerMiddleware({
  service: 'games-api'
}));

// Add OpenAPI middleware
app.use((req, res, next) => api.handleRequest(req, res, next));

// Start the server
app.listen(3000, () => {
  const logger = new CyberEyes('games-api', 'server');
  logger.info('Server started on port 3000');
});

// Client-side integration (Axios)
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
});

// Add Cyber-Eyes interceptors
apiClient.interceptors.request.use(
  CyberEyes.apiClient.logRequest,
  CyberEyes.apiClient.logError
);

apiClient.interceptors.response.use(
  CyberEyes.apiClient.logResponse,
  CyberEyes.apiClient.logError
);

// Example API calls
async function fetchGames() {
  try {
    // Request with normal log level
    const response = await apiClient.get('/games');
    console.log('Games:', response.data);
    
    // Request with detailed logging
    const detailedResponse = await apiClient.get('/games', {
      headers: {
        'X-Log-Level': LogLevel.TRACE
      }
    });
    
    // Request for a specific game
    const gameResponse = await apiClient.get('/games/game1');
    console.log('Game details:', gameResponse.data);
    
    // Request for a non-existent game
    try {
      await apiClient.get('/games/nonexistent');
    } catch (error) {
      console.error('Expected error:', error.message);
    }
  } catch (error) {
    console.error('Error fetching games:', error.message);
  }
}

// Run the client example
fetchGames();
