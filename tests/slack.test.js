const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const slackCode = fs.readFileSync(path.join(__dirname, '../slack.js'), 'utf8');

function setupContext(token, channel) {
  const context = vm.createContext({
    Logger: { log: () => { context.logs = (context.logs || 0) + 1; } },
    UrlFetchApp: { fetch: (url, opts) => { context.fetchOpts = opts; } },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => {
          if (key === 'SLACK_BOT_TOKEN') return token;
          if (key === 'SLACK_CHANNEL_ID') return channel;
          return null;
        }
      })
    },
    ContentService: {
      createTextOutput: (msg) => ({
        setMimeType: (mime) => `Mocked: ${msg} [${mime}]`
      }),
      MimeType: { TEXT: 'TEXT_MIME' }
    },
    fetchJulesSessions: () => {
      if (context.apiError) throw new Error("API Error");
      return context.mockSessions || [];
    },
    updateCache: () => { context.cacheUpdated = true; },
    getActiveSessionsCache: () => context.mockCacheSessions || [],
    getStatusEmoji: () => 'emoji',
    createJulesSession: (repo, prompt) => {
      if (context.apiError) throw new Error("API Error");
      return { id: '123' };
    },
    saveActiveSession: (res, repo) => { context.savedSession = repo; },
    console: {
      warn: () => { context.warnCalled = true; },
      error: () => { context.errorLogged = true; }
    },
    module: {}
  });
  vm.runInContext(slackCode, context);
  return context;
}

function runTests() {
  // Test 1: Missing Token
  let context = setupContext(null, 'channel_id');
  context.sendSlackNotification('Test message');
  assert.strictEqual(context.logs, 1);
  assert.strictEqual(context.fetchOpts, undefined);

  // Test 2: Missing Channel
  context = setupContext('token', null);
  context.sendSlackNotification('Test message');
  assert.strictEqual(context.logs, 1);
  assert.strictEqual(context.fetchOpts, undefined);

  // Test 3: Success
  context = setupContext('token', 'channel_id');
  context.sendSlackNotification('Test message');
  assert.strictEqual(context.logs, undefined);
  assert.strictEqual(context.fetchOpts.method, 'post');
  assert.strictEqual(context.fetchOpts.headers.Authorization, 'Bearer token');

  // Test 4: createTextResponse_
  context = setupContext('token', 'channel_id');
  const response = context.createTextResponse_('Hello');
  assert.strictEqual(response, 'Mocked: Hello [TEXT_MIME]');

  // Test 5: startTask() error (Security Fix Verification)
  context = setupContext('token', 'channel_id');
  context.apiError = true;
  const taskResult = context.startTask("owner/repo fix bug");
  assert.ok(taskResult.includes("Jules API連携中にエラーが発生しました。"));
  assert.ok(!taskResult.includes("API Error"), "Error message should not contain raw error details");
  assert.strictEqual(context.errorLogged, true, "Error should be logged to console.error");
}

runTests();
