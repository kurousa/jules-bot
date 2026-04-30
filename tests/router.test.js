const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const routerCode = fs.readFileSync(path.join(__dirname, '../router.js'), 'utf8');

function runTests() {
  let calls = {};

  const context = vm.createContext({
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => 'valid_token'
      })
    },
    ContentService: {
      createTextOutput: (msg) => ({
        setMimeType: (mime) => `Mocked: ${msg}`
      }),
      MimeType: { TEXT: 'TEXT_MIME' }
    },
    getJulesJobList: () => { calls.getJulesJobList = (calls.getJulesJobList || 0) + 1; return 'Mocked List'; },
    usage: () => { calls.usage = (calls.usage || 0) + 1; return 'Mocked Usage'; },
    startTask: (text) => {
      calls.startTask = (calls.startTask || 0) + 1;
      calls.startTaskArg = text;
      return 'Mocked Start Task';
    },
    module: {}
  });

  vm.runInContext(routerCode, context);

  // Test Token Verification
  calls = {};
  let result = context.doPost({ parameter: { token: 'invalid', text: 'list' } });
  assert.strictEqual(result, 'Mocked: Invalid token');

  // Test 1
  calls = {};
  result = context.doPost({ parameter: { token: 'valid_token', text: 'list' } });
  assert.strictEqual(calls.getJulesJobList, 1);
  assert.strictEqual(result, 'Mocked List');

  // Test 2
  calls = {};
  result = context.doPost({ parameter: { token: 'valid_token', text: 'LIST' } });
  assert.strictEqual(calls.getJulesJobList, 1);

  // Test 3
  calls = {};
  result = context.doPost({ parameter: { token: 'valid_token', text: 'repo_only' } });
  assert.strictEqual(calls.usage, 1);

  // Test 4
  calls = {};
  result = context.doPost({ parameter: { token: 'valid_token', text: '  ' } });
  assert.strictEqual(calls.usage, 1);

  // Test 5
  calls = {};
  result = context.doPost({ parameter: { token: 'valid_token', text: ' repo prompt ' } });
  assert.strictEqual(calls.startTask, 1);
  assert.strictEqual(calls.startTaskArg, 'repo prompt');

  // Test 6
  calls = {};
  result = context.doGet({});
  assert.strictEqual(calls.usage, 1);
}

runTests();
