var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require("path");

app.use(express.static(__dirname + "/"));
app.use(express.static(__dirname + "/mediaPreApproval"));
app.use(express.static(__dirname + "/mediaPostApproval"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    path.resolve(__dirname, file);
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};
function getFiles(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    path.resolve(__dirname, file);
    return fs.statSync(path.join(srcpath, file)).isFile();
  });
};

app.get("/getAllDisplayPre",function(req,res) {
	console.log("does a get on files with dirname " + __dirname + "\\mediaPreApproval\\");
  	var files = getFiles(__dirname + "\\mediaPreApproval\\");
	res.json({files:files}); //needs to match public var unity create fromjson
});
app.post("/deleteFile",function(req,res) {
  fs.unlink(__dirname + "\\mediaPreApproval\\" + req.body.textFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
  fs.unlink(__dirname + "\\mediaPreApproval\\" + req.body.mediaFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
});
app.post("/moveApproveToFolder",function(req,res) {
  var files = getFiles(__dirname + "\\mediaPreApproval\\");
  var matchedFile = [];

  let counter = 0;
  for(let i=0;i<files.length;i++) {
    if(files[i] == req.body.textFile) {
      console.log("text file : " + files[i]);
      matchedFile[counter] = files[i];
      counter++;
    }
    else if (files[i] == req.body.mediaFile) {
      console.log("mediaFile : " + files[i]);
      matchedFile[counter] = files[i];
      counter++;
    }
  }
  for(let i=0;i<matchedFile.length;i++) {
    var fromPath = path.join(__dirname + "\\mediaPreApproval\\" , matchedFile[i]);
    var toPath = path.join(__dirname + "\\mediaPostApproval\\", matchedFile[i]);

    fs.rename(fromPath, toPath, function (error) {
      if (error) {
        console.error("File moving error.", error);
      } else {
        console.log("Moved file '%s' to '%s'.", fromPath, toPath);
      }
    });
  }
});




app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
