const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const commandCode = fs.readFileSync(path.join(__dirname, '../command.js'), 'utf8');

function setupContext() {
  const context = vm.createContext({
    createTextResponse_: (msg) => `Mocked: ${msg}`,
    fetchJulesSessions: () => {
      if (context.apiError) throw new Error("API Error");
      return context.mockSessions || [];
    },
    updateCache: () => { context.cacheUpdated = true; },
    getActiveSessionsCache: () => context.mockCacheSessions || [],
    console: { warn: () => { context.warnCalled = true; } },
    getStatusEmoji: () => 'emoji',
    createJulesSession: (repo, prompt) => {
      if (context.apiError) throw new Error("API Error");
      return { id: '123' };
    },
    saveActiveSession: (res, repo) => { context.savedSession = repo; },
    callFirebase: () => {},
    fetchLatestActivity: () => {},
    sendSlackNotification: () => {},
    module: {}
  });
  vm.runInContext(commandCode, context);
  return context;
}

function runTests() {
  let context;

  // Test usage()
  context = setupContext();
  let result = context.usage();
  assert.ok(result.includes("💡 使いかた:"));

  // Test getJulesJobList() - empty
  context = setupContext();
  result = context.getJulesJobList();
  assert.ok(result.includes("現在実行中のタスクはありません。"));

  // Test getJulesJobList() - success
  context = setupContext();
  context.mockSessions = [{ name: 'session/123', state: 'RUNNING', title: 'Fix bug', sourceContext: { source: 'sources/github/owner/repo' } }];
  result = context.getJulesJobList();
  assert.strictEqual(context.cacheUpdated, true);
  assert.ok(result.includes("📂 *Jules API セッション一覧:*"));
  assert.ok(result.includes("owner/repo"));

  // Test getJulesJobList() - cache fallback
  context = setupContext();
  context.apiError = true;
  context.mockCacheSessions = [{ name: 'session/123', state: 'RUNNING', title: 'Fix bug', repo: 'owner/repo' }];
  result = context.getJulesJobList();
  assert.strictEqual(context.warnCalled, true);
  assert.ok(result.includes("⚠️ *APIタイムアウトのためキャッシュを表示中:*"));

  // Test startTask() - success
  context = setupContext();
  result = context.startTask("owner/repo fix this bug");
  assert.strictEqual(context.savedSession, "owner/repo");
  assert.ok(result.includes("🚀 Julesがタスクを開始しました！"));

  // Test startTask() - error
  context = setupContext();
  context.apiError = true;
  result = context.startTask("owner/repo fix this bug");
  assert.ok(result.includes("Jules API連携エラー: Error: API Error"));
}

runTests();
