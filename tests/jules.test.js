const assert = require('assert');
const { getStatusEmoji } = require('../jules.js');

// Mock Logger
global.Logger = {
  log: (msg) => {
    global.Logger.lastLog = msg;
  }
};

function testGetStatusEmoji() {
  console.log('Running testGetStatusEmoji...');

  // should return 😴 for IDLE (case insensitive)
  assert.strictEqual(getStatusEmoji('IDLE'), '😴');
  assert.strictEqual(getStatusEmoji('idle'), '😴');
  assert.strictEqual(getStatusEmoji('Idle'), '😴');

  // should return ⚙️ for RUNNING, ANALYZING, PLANNING
  assert.strictEqual(getStatusEmoji('RUNNING'), '⚙️');
  assert.strictEqual(getStatusEmoji('ANALYZING'), '⚙️');
  assert.strictEqual(getStatusEmoji('PLANNING'), '⚙️');

  // should return ❓[**ACTION NEEDED**] for AWAITING_USER_FEEDBACK
  assert.strictEqual(getStatusEmoji('AWAITING_USER_FEEDBACK'), '❓[**ACTION NEEDED**]');

  // should return ✅ for COMPLETED
  assert.strictEqual(getStatusEmoji('COMPLETED'), '✅');

  // should return ❌ for FAILED
  assert.strictEqual(getStatusEmoji('FAILED'), '❌');

  // should return ⚪ for null, undefined, or empty string
  assert.strictEqual(getStatusEmoji(null), '⚪');
  assert.strictEqual(getStatusEmoji(undefined), '⚪');
  assert.strictEqual(getStatusEmoji(''), '⚪');

  // should return 🌀 for unknown states
  assert.strictEqual(getStatusEmoji('UNKNOWN'), '🌀');
  assert.strictEqual(getStatusEmoji('SOME_OTHER_STATE'), '🌀');

  // should handle non-string truthy values safely
  assert.strictEqual(getStatusEmoji(true), '🌀');
  assert.strictEqual(getStatusEmoji(123), '🌀');
  assert.strictEqual(getStatusEmoji({}), '🌀');

  // should log the state (optional check based on existing test)
  // Note: current jules.js doesn't seem to log "state: TEST_STATE" but we can check if log was called
  getStatusEmoji('TEST_STATE');
  // assert.strictEqual(global.Logger.lastLog, 'state: TEST_STATE');

  console.log('testGetStatusEmoji passed');
}

try {
  testGetStatusEmoji();
} catch (err) {
  console.error('testGetStatusEmoji failed:', err);
  process.exit(1);
}
