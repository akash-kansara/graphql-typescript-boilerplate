const fs = require('fs-extra');
const childProcess = require('child_process');

try {
  fs.removeSync('./dist/');
  childProcess.exec('tsc --build tsconfig.prod.json', (error, stdout, stderr) => {
    if(error || stderr.length > 0) { throw error || stderr; }
  });
} catch (err) {
  console.log(err);
}
