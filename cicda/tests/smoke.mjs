// cyber-eyes smoke test. Run after `npm run build`.

import { CyberEyes, LogLevel, setLogLevel, shouldLog, getLogger } from '../../dist/index.js';

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log('  ok:', msg);
  else {
    console.error('  FAIL:', msg);
    failed++;
  }
}

// capture console output
const lines = [];
const orig = { info: console.info, error: console.error, debug: console.debug };
console.info = (x) => lines.push(['info', x]);
console.error = (x) => lines.push(['error', x]);
console.debug = (x) => lines.push(['debug', x]);

// level ordering
assert(shouldLog(LogLevel.ERROR, LogLevel.INFO), 'ERROR >= INFO');
assert(!shouldLog(LogLevel.DEBUG, LogLevel.INFO), 'DEBUG < INFO');

// logging
{
  setLogLevel(LogLevel.INFO);
  const log = new CyberEyes('pet-store', 'app');
  log.info({ message: 'hello', n: 1 });
  log.error({ message: 'boom' });
  const info = lines.find((l) => l[0] === 'info' && l[1].includes('"message":"hello"'));
  assert(!!info, 'info logged as JSON with message');
  const parsed = JSON.parse(info[1]);
  assert(parsed.service === 'pet-store' && parsed.component === 'app', 'entry has service/component');
  assert(parsed.data?.n === 1, 'entry carries extra data');
}

// level filtering
{
  lines.length = 0;
  setLogLevel(LogLevel.ERROR);
  const log = getLogger('svc', 'comp');
  log.info({ message: 'suppressed' });
  log.error({ message: 'visible' });
  assert(lines.length === 1 && lines[0][1].includes('"message":"visible"'), 'INFO suppressed at ERROR threshold');
}

console.info = orig.info;
console.error = orig.error;
console.debug = orig.debug;

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\ncyber-eyes smoke test passed.');
