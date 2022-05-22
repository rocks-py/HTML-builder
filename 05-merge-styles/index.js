const fs = require('fs');
const path = require('path');
const { promises: { readFile } } = require('fs');

let sourceDir = path.join(__dirname, 'styles');
let destFile = path.join(__dirname, 'project-dist', 'bundle.css');

let writeStream = fs.createWriteStream(destFile);

fs.promises.readdir(sourceDir, { withFileTypes: true }).then(filenames => {
  let promises = [];
  for (const file of filenames) {
    if (file.isFile()) {
      let extFile = file.name.split('.').at(-1);
      let srcFile = path.join(sourceDir, file.name);
      if (extFile === 'css') {
        promises.push(readFile(srcFile, { encoding: 'utf-8' }));
      }
    }
  }

  Promise.all(promises).then(results => {
    for (let result of results) {
      writeStream.write(result, 'utf-8');
    }
    writeStream.end();
  });
});