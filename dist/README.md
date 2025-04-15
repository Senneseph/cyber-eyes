# Cyber-Eyes Distribution

This directory contains the compiled distribution files for the Cyber-Eyes logging library.

## Files

- `cyber-eyes.js` - UMD build (for direct browser usage)
- `cyber-eyes.min.js` - Minified UMD build
- `cyber-eyes.esm.js` - ES Module build (for modern browsers and bundlers)
- `cyber-eyes.cjs.js` - CommonJS build (for Node.js)
- `cyber-eyes.d.ts` - TypeScript declaration files

## Usage

### Browser (UMD)

```html
<script src="cyber-eyes.min.js"></script>
<script>
  const logger = new CyberEyes('my-app', 'main');
  logger.info('Hello, world!');
</script>
```

### ES Modules

```javascript
import { CyberEyes, LogLevel } from './cyber-eyes.esm.js';

const logger = new CyberEyes('my-app', 'main');
logger.info('Hello, world!');
```

### Node.js (CommonJS)

```javascript
const { CyberEyes, LogLevel } = require('./cyber-eyes.cjs.js');

const logger = new CyberEyes('my-app', 'main');
logger.info('Hello, world!');
```

### TypeScript

```typescript
import { CyberEyes, LogLevel } from './cyber-eyes';

const logger = new CyberEyes('my-app', 'main');
logger.info('Hello, world!');
```

## CDN

You can also use the library from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@webax/cyber-eyes/dist/cyber-eyes.min.js"></script>
```

Or as an ES module:

```html
<script type="module">
  import { CyberEyes, LogLevel } from 'https://cdn.jsdelivr.net/npm/@webax/cyber-eyes/dist/cyber-eyes.esm.js';
  
  const logger = new CyberEyes('my-app', 'main');
  logger.info('Hello, world!');
</script>
```

## WebAXD Integration

As part of the WebAX ecosystem, Cyber-Eyes can be distributed through the WebAXD system. See the [WebAXD documentation](https://webax.dev/docs/webaxd) for more information.
