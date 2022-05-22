// 1. Импорт всех требуемых модулей
// 2. Прочтение и сохранение в переменной файла-шаблона
// 3. Нахождение всех имён тегов в файле шаблона
// 4. Замена шаблонных тегов содержимым файлов-компонентов
// 5. Запись изменённого шаблона в файл index.html в папке project-dist
const fs = require('fs');
const path = require('path');
const { promises: { readFile } } = require('fs');

let sourceComponentsDir = path.join(__dirname, 'components');
let sourceStylesDir = path.join(__dirname, 'styles');
let sourceAssetsDir = path.join(__dirname, 'assets');
let sourceTemplateFile = path.join(__dirname, 'template.html');

let destDir = path.join(__dirname, 'project-dist');
let destAssetsDir = path.join(__dirname, 'project-dist', 'assets');
let destHtmlFile = path.join(__dirname, 'project-dist', 'index.html');
let destStyleFile = path.join(__dirname, 'project-dist', 'style.css');


fs.mkdir(destDir, { recursive: true }, (err) => {
  if (err) throw err;
  let writeCssStream = fs.createWriteStream(destStyleFile);
  let writeHtmlstream = fs.createWriteStream(destHtmlFile);

  // css
  fs.promises.readdir(sourceStylesDir, { withFileTypes: true }).then(filenames => {
    let promises = [];
    for (const file of filenames) {
      if (file.isFile()) {
        let extFile = file.name.split('.').at(-1);
        if (extFile === 'css') {
          let srcFile = path.join(sourceStylesDir, file.name);
          promises.push(readFile(srcFile, { encoding: 'utf-8' }));
        }
      }
    }

    Promise.all(promises).then(results => {
      for (let result of results) {
        writeCssStream.write(result, 'utf-8');
      }
      writeCssStream.end();
    });
  });


  // html
  fs.promises.readdir(sourceComponentsDir, { withFileTypes: true }).then(filenames => {
    let promises = {};
    promises['template'] = readFile(sourceTemplateFile, { encoding: 'utf-8' });

    for (const file of filenames) {
      if (file.isFile()) {
        let extFile = file.name.split('.').at(-1);
        if (extFile === 'html') {
          let idx = file.name.indexOf('html');
          let name = file.name.slice(0, idx - 1);
          let srcFile = path.join(sourceComponentsDir, file.name);
          promises[name] = readFile(srcFile, { encoding: 'utf-8' });
        }
      }
    }

    Promise.all(Object.values(promises)).then(results => {
      let keys = Object.keys(promises);
      let resultsObj = {};
      for (let i = 0; i < keys.length; i++) {
        resultsObj[keys[i]] = results[i];
      }

      let replacedTemplate = replaceTemplates(resultsObj);
      writeHtmlstream.write(replacedTemplate, 'utf-8');
      writeHtmlstream.end();
    });
  });


  // copy assets
  copyDirectory(sourceAssetsDir, destAssetsDir);

});

// recursively copy directory
function copyDirectory(source, destination) {
  function callback(err) {
    if (err) throw err;
  }

  fs.rm(destination, { recursive: true }, () => {
    fs.mkdir(destination, { recursive: true }, () => {
      fs.promises.readdir(source, { withFileTypes: true }).then(filenames => {
        for (const file of filenames) {
          if (file.isFile()) {
            let sourceFile = path.join(source, file.name);
            let destFile = path.join(destination, file.name);
            fs.copyFile(sourceFile, destFile, callback);
          } else if (file.isDirectory()) {
            copyDirectory(path.join(source, file.name), path.join(destination, file.name));
          }
        }
      });
    });
  });
}

function replaceTemplates(templateObj) {
  let template = templateObj['template'];
  let result = '';
  let idxStart = 0;
  let idxEnd = 0;
  for (; ;) {
    idxStart = template.indexOf('{{', idxStart + 1);
    let start = idxEnd === 0 ? idxEnd : idxEnd + 2;
    if (idxStart === -1) {
      // add final chunk
      result += template.slice(start, template.length);
      break;
    }
    result += template.slice(start, idxStart);

    idxEnd = template.indexOf('}}', idxEnd + 1);
    if (idxEnd === -1) break;

    let templateName = template.slice(idxStart + 2, idxEnd);
    result += templateObj[templateName];
  }

  return result;
}