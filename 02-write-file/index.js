const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

let pathToFile = path.join(__dirname, 'write.txt');


const writeStream = fs.createWriteStream(pathToFile);

console.log('Write anything you want:');



const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  console.log(`Received: ${line}`);
  if (line == 'exit') {
    return process.exit();
  }
  writeStream.write(line);
});

// Ctrl + C
process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  writeStream.close();
  console.log('Bye-bye');
});
