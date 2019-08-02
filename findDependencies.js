const fs = require("fs");
const argv = require('minimist')(process.argv.slice(2));

//Regex constants 
const ALL_JS_FILES = /[^\\/]+\.js*/g;
const ALL_REQUIRE_FILES = /require\(\".*\.js\"*/g;

//The number of file that will be check
let numberFiles = 1;
//The content of the file data
let allContentSaved = [];

/**
 * Check for the file and your dependecies.
 * @param {string} file the name of the file.
 * @param {number} level the level of the recursivity.
 * @param {number} order the ordering inside the level.
 */
checkFiles = (file, level, order) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) throw err;
      
    //Save the data of the file like an object in an array.
    //The graph data structure!
    allContentSaved.push({file: file, content: data, level: level, order: order});
      
    //Logic for read the dependecies of the files
    let alldependecies = data.match(ALL_REQUIRE_FILES);
    if(alldependecies && alldependecies.length > 0) {  
      let allFilesNames = [];
      alldependecies.forEach(line => {
        allFilesNames.push(line.match(ALL_JS_FILES)[0]);
      });
      //Increase the number of files with the new ones
      numberFiles += allFilesNames.length;
      if(allFilesNames.length > 0) {
        level++;
        order = 0;
        allFilesNames.forEach(file => {
          order++;
          let pathFile = `./${file}`;
          //Recursivily check the dependecies files
          checkFiles(pathFile, level, order);
        });
      } 
    }

    //When is true, it mean the last file being read.
    if(numberFiles === allContentSaved.length) {
      //Sort by execution.
      allContentSaved.sort((obj1, obj2) => {
        return obj2["level"] - obj1["level"] || obj1["order"] - obj2["order"];
      });
      //Get the content of the file.
      let rawContent = allContentSaved.map( (item) => { return item.content });
      //Write and save the bundle.js file.
      fs.writeFile('./bundle.js', rawContent.join("\n"), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
    }
    console.log("FILES: " + numberFiles, "READS: " + allContentSaved.length);
  });
};

if(argv.e) {
  console.log("All the files must be in the same folder!");
  let path = `./${argv.e}`;
  let level = 0;
  let order = 1;
  checkFiles(path, level, order);
} else {
  console.log("Please select a file, using this command: $ node findDependecies.js -e [file name]");
}
