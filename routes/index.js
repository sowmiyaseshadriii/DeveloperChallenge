var express = require('express');
var router = express.Router();
var normalizedPath = require("path").join(__dirname, "../public");
const fs = require('fs');
var path = require('path');

async function directoryFiles(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        return reject(error);
      }
      Promise.all(files.map((file) => {
        return new Promise((resolve, reject) => {
          const filepath = path.join(dir, file);
          fs.stat(filepath, (error, stats) => {
            if (error) {
              return reject(error);
            }
            if (stats.isDirectory()) {
              directoryFiles(filepath).then(resolve);
            } else if (stats.isFile()) {
              resolve(filepath);
            }
          });
        });
      }))
      .then((foldersContents) => {
        resolve(foldersContents.reduce((all, folderContents) => all.concat(folderContents), []));
      });
    });
  });
}
const maincheck = async (path, opts = "utf8") =>
  new Promise(async (resolve, reject) => {
   try{
    const results = [];
    let allFiles = await directoryFiles(normalizedPath);
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const hasSample = await checkIfFileHasString(file);
      if (hasSample) {
        results.push(file);
      }
    }
    resolve(results);
   }
   catch(err){
     reject(err);
   }
  });

const checkIfFileHasString = async (path, opts = "utf8") =>
  new Promise(async (resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.includes("TODO")) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });

/* GET home page. */
router.get('/', function(req, res, next) {
   maincheck().then(i=>{
    const outputArr = i.map(item => {
       return item.split("\\").slice(3).join("/");
    });
    res.render('index', { title: outputArr }); 
  })
});

module.exports = router;
