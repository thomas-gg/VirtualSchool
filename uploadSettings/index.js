var express = require('express');
var formidable = require('formidable');
var path = require("path");
var fs = require("fs");

var app = express();
app.use(express.static(__dirname + "/"));
app.use(express.static(__dirname + "/approval/mediaPreApproval")); //added
app.use(express.static(__dirname + "/approval/mediaPostApproval")); //added
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //added

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/admin', function (req, res){
    res.sendFile(__dirname + '/approval/index.html');
});

var fileName;
var location;
app.post('/setLocation', function (req, res){
  location = req.body.location
  res.sendFile(__dirname + '/index.html');
});

app.post('/fileUpload', function (req, res){
    var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/approval/mediaPreApproval/' + location + "_" + file.name;
        fileName = file.name;
        fileName = fileName.substring(0, fileName.indexOf("."))
        /*fs.writeFile(__dirname + "/captionsFolder/" + location + "_" + fileName + ".txt", caption, function(err, data) {
          if (err) console.log(err);
        }); */
        fs.writeFile(__dirname + "/approval/mediaPreApproval/" + location + "_" + fileName + ".txt", caption, function(err, data) {
          if (err) console.log(err);
        });
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });

    res.sendFile(__dirname + '/index.html');
});

var caption;
var date;
app.post('/setCaption', function (req, res){
  console.log(req.body.date);
  caption = req.body.date + " " + req.body.caption;
  res.sendFile(__dirname + '/index.html');
});
////added from /approval
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

app.get("/getAllDisplay",function(req,res) {
  //console.log("does a get on files with dirname " + __dirname + "\\approval\\mediaPreApproval\\");
  //added \\approval a bunch of times
    var files = getFiles(__dirname + "\\approval\\mediaPreApproval\\");
  res.json({files:files}); //needs to match public var unity create fromjson
});
app.post("/deleteFile",function(req,res) {
  fs.unlink(__dirname + "\\approval\\mediaPreApproval\\" + req.body.textFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
  fs.unlink(__dirname + "\\approval\\mediaPreApproval\\" + req.body.mediaFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
});
app.post("/moveApproveToFolder",function(req,res) {
  var files = getFiles(__dirname + "\\approval\\mediaPreApproval\\");
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
    var fromPath = path.join(__dirname + "\\approval\\mediaPreApproval\\" , matchedFile[i]);
    var toPath = path.join(__dirname + "\\approval\\mediaPostApproval\\", matchedFile[i]);

    fs.rename(fromPath, toPath, function (error) {
      if (error) {
        console.error("File moving error.", error);
      } else {
        console.log("Moved file '%s' to '%s'.", fromPath, toPath);
      }
    });
  }
});
///////
app.listen(4000);
