const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const julesCode = fs.readFileSync(path.join(__dirname, '../jules.js'), 'utf8');

function setupContext() {
  const context = vm.createContext({
    Logger: { log: (msg) => { context.lastLog = msg; } },
    module: {}
  });
  vm.runInContext(julesCode, context);
  return context;
}

function runTests() {
  const context = setupContext();
  const { getStatusEmoji } = context;

  // IDLE
  assert.strictEqual(getStatusEmoji('IDLE'), '😴');
  assert.strictEqual(getStatusEmoji('idle'), '😴');
  assert.strictEqual(getStatusEmoji('Idle'), '😴');

  // RUNNING, ANALYZING, PLANNING
  assert.strictEqual(getStatusEmoji('RUNNING'), '⚙️');
  assert.strictEqual(getStatusEmoji('ANALYZING'), '⚙️');
  assert.strictEqual(getStatusEmoji('PLANNING'), '⚙️');

  // AWAITING_USER_FEEDBACK
  assert.strictEqual(getStatusEmoji('AWAITING_USER_FEEDBACK'), '❓[**ACTION NEEDED**]');

  // COMPLETED
  assert.strictEqual(getStatusEmoji('COMPLETED'), '✅');

  // FAILED
  assert.strictEqual(getStatusEmoji('FAILED'), '❌');

  // null, undefined, empty
  assert.strictEqual(getStatusEmoji(null), '⚪');
  assert.strictEqual(getStatusEmoji(undefined), '⚪');
  assert.strictEqual(getStatusEmoji(''), '⚪');

  // unknown
  assert.strictEqual(getStatusEmoji('UNKNOWN'), '🌀');

  // non-string
  assert.strictEqual(getStatusEmoji(true), '🌀');
}

runTests();
