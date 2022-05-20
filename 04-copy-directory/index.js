const fs = require('fs');
const path = require('path');


let sourceDir = path.join(__dirname, 'files');
let destDir = path.join(__dirname, 'files-copy');

function callback(err) {
  if (err) throw err;
}

fs.rm(destDir, {recursive: true}, () => {
  fs.mkdir(destDir, {recursive: true}, () => {
    fs.promises.readdir(sourceDir, {withFileTypes: true}).then(filenames => {
      for (const file of filenames) {
        if (file.isFile()) {
          let sourceFile = path.join(sourceDir, file.name);
          let destFile = path.join(destDir, file.name);
          fs.copyFile(sourceFile, destFile, callback);
        }
      }
    });
  });
});