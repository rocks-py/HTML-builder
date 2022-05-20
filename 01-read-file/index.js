const fs = require('fs');
const path = require('path');

let pathToFile = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(pathToFile);

// через чанки
readStream.on('data', (chunk) => {
  console.log(`${chunk}`);
});


// через stdout
// const { stdout } = require('process');
// readStream.on('open', function () {
//   readStream.pipe(stdout);
// });