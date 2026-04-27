const fs = require('fs');
const path = require('path');

const testFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'));
let failed = false;

testFiles.forEach(file => {
  console.log(`Running ${file}...`);
  try {
    require(path.join(__dirname, file));
    console.log(`✅ ${file} passed\n`);
  } catch (err) {
    console.error(`❌ ${file} failed:\n`, err);
    failed = true;
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log("All tests passed!");
}
