# Cyber-Eyes Development

This directory contains the development files for the Cyber-Eyes project.

## Directory Structure

- `src/` - Source code
- `tests/` - Test files
- `examples/` - Example implementations
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `rollup.config.js` - Rollup configuration
- `jest.config.js` - Jest configuration

## Development Workflow

1. Make changes to the source code in `src/`
2. Write tests in `tests/`
3. Run tests with `npm test`
4. Build the library with `npm run build`
5. Update examples if necessary

## Key Features

### Dynamic Log Level Control

Cyber-Eyes supports dynamic control of log levels at runtime, allowing for granular control over what gets logged. This is particularly useful for debugging specific components without flooding logs with information from other components.

### OpenAPI Integration

One of the key features of Cyber-Eyes is its integration with OpenAPI. When a client makes an API request, they can include a `log-level` parameter to request logs for that specific operation:

```http
GET /api/games?log-level=DEBUG HTTP/1.1
```

The server will then:

1. Temporarily set the log level for that specific request
2. Collect all logs generated during request processing
3. Include relevant logs in the API response

This allows for dynamic debugging without changing server configuration or requiring access to server logs.

## Building the Library

The library is built using Rollup, which creates multiple output formats:

- CommonJS (for Node.js)
- ES Modules (for modern browsers and bundlers)
- UMD (for direct browser usage)

To build the library:

```bash
npm run build
```

The output files will be placed in the `dist/` directory.

## Testing

Tests are written using Jest and can be run with:

```bash
npm test
```

For watch mode during development:

```bash
npm test -- --watch
```

## Linting

Linting is done with ESLint:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

## Documentation

API documentation is generated from source code comments using TypeDoc:

```bash
npm run docs
```

The output will be placed in the `docs/api/` directory.
