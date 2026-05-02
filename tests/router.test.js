const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const routerCode = fs.readFileSync(path.join(__dirname, '../router.js'), 'utf8');

function setupContext(token) {
  const context = vm.createContext({
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => {
          if (key === 'SLACK_VERIFICATION_TOKEN') return token;
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
    getJulesJobList: () => { context.calls.getJulesJobList = (context.calls.getJulesJobList || 0) + 1; return 'Mocked List'; },
    usage: () => { context.calls.usage = (context.calls.usage || 0) + 1; return 'Mocked Usage'; },
    startTask: (text) => {
      context.calls.startTask = (context.calls.startTask || 0) + 1;
      context.calls.startTaskArg = text;
      return 'Mocked Start Task';
    },
    createTextResponse_: (msg) => {
      return `Mocked: ${msg} [TEXT_MIME]`;
    },
    calls: {},
    module: {}
  });
  vm.runInContext(routerCode, context);
  return context;
}

function runTests() {
  const token = 'valid_token';

  // Test 1: list command
  let context = setupContext(token);
  let result = context.doPost({ parameter: { token: token, text: 'list' } });
  assert.strictEqual(context.calls.getJulesJobList, 1);
  assert.strictEqual(result, 'Mocked List');

  // Test 2: list command case-insensitive
  context = setupContext(token);
  result = context.doPost({ parameter: { token: token, text: 'LIST' } });
  assert.strictEqual(context.calls.getJulesJobList, 1);

  // Test 3: usage fallback for single word
  context = setupContext(token);
  result = context.doPost({ parameter: { token: token, text: 'repo_only' } });
  assert.strictEqual(context.calls.usage, 1);

  // Test 4: usage fallback for empty text
  context = setupContext(token);
  result = context.doPost({ parameter: { token: token, text: '  ' } });
  assert.strictEqual(context.calls.usage, 1);

  // Test 5: startTask command
  context = setupContext(token);
  result = context.doPost({ parameter: { token: token, text: ' repo prompt ' } });
  assert.strictEqual(context.calls.startTask, 1);
  assert.strictEqual(context.calls.startTaskArg, 'repo prompt');

  // Test 6: doGet
  context = setupContext(token);
  result = context.doGet({});
  assert.strictEqual(context.calls.usage, 1);

  // Test 7: invalid token
  context = setupContext(token);
  result = context.doPost({ parameter: { token: 'invalid', text: 'list' } });
  assert.strictEqual(result, 'Mocked: Invalid token [TEXT_MIME]');
}

runTests();
