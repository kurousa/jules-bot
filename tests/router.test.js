const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const routerCode = fs.readFileSync(path.join(__dirname, '../router.js'), 'utf8');

function runTests() {
  let calls = {};

  const context = vm.createContext({
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

  // Test 1
  calls = {};
  let result = context.doPost({ parameter: { text: 'list' } });
  assert.strictEqual(calls.getJulesJobList, 1);
  assert.strictEqual(result, 'Mocked List');

  // Test 2
  calls = {};
  result = context.doPost({ parameter: { text: 'LIST' } });
  assert.strictEqual(calls.getJulesJobList, 1);

  // Test 3
  calls = {};
  result = context.doPost({ parameter: { text: 'repo_only' } });
  assert.strictEqual(calls.usage, 1);

  // Test 4
  calls = {};
  result = context.doPost({ parameter: { text: '  ' } });
  assert.strictEqual(calls.usage, 1);

  // Test 5
  calls = {};
  result = context.doPost({ parameter: { text: ' repo prompt ' } });
  assert.strictEqual(calls.startTask, 1);
  assert.strictEqual(calls.startTaskArg, 'repo prompt');

  // Test 6
  calls = {};
  result = context.doGet({});
  assert.strictEqual(calls.usage, 1);
}

runTests();
