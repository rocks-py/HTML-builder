const fs = require('fs');
const path = require('path');

let pathToDir = path.join(__dirname, 'secret-folder');

fs.promises.readdir(pathToDir, {withFileTypes: true}).then(filenames => {
  for (const file of filenames) {
    if (file.isFile()) {
      let parts = file.name.split('.');
      fs.stat(path.join(pathToDir, file.name), (err, stat) => {
        console.log(`${parts[0]} - ${parts[1]} - ${(stat.size / 1024).toFixed(3)}kb`);
      });
    }
  }
});

