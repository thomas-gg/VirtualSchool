var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require("path");
var formidable = require('formidable');
var mv = require("mv");
app.use(express.static(__dirname + "/"));
app.use(express.static(__dirname + "/uploadSettings/approval/mediaPreApproval")); //added
app.use(express.static(__dirname + "/uploadSettings/approval/mediaPostApproval")); //added
//app.use(express.static(__dirname + "/uploadSettings/imagesFolder"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //you need these for some reasons

/////////////////////////////////////////////////////////////// index.js of studentExercise2019TestStart

var setUpPassport = require("./setuppassport");
var routes = require("./routes");
var routesData = require("./routesData");    //added

app.set("port", process.env.PORT || 3000);
app.use('/', express.static(__dirname + './'));
app.use('/js', express.static(__dirname + './public/js'));
app.use(express.static(path.join(__dirname, "public")));
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
app.use(cookieParser());
mongoose.connect("mongodb://brad123:brad123@cluster0-shard-00-00-gzlxs.mongodb.net:27017,cluster0-shard-00-01-gzlxs.mongodb.net:27017,cluster0-shard-00-02-gzlxs.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true", { useNewUrlParser: true });   //27017 seems to be the port number used by mongod
mongoose.set('useCreateIndex', true); //gets rid of deprecation warnings also the use newurlparser thing above in the code
setUpPassport();

app.use(session({
  secret: "LUp$Dg?,I#i&owP3=9su+OB%`JgL4muLF5YJ~{;t",
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);
app.use(routesData);

var User = require("./models/user");
mongoose.set('useFindAndModify', false);
////////////////////////////////////////////////////////////
app.post('/setLocationURL', function (req, res){
  var error = false;
  var URLL = JSON.stringify(req.body.URLL);
  URLL = URLL.substring(1,URLL.length-1);
  if(!(URLL.includes(".com")||URLL.includes(".org")||URLL.includes(".edu")||URLL.includes(".gov")||URLL.includes(".net")||URLL.includes(".biz")||URLL.includes(".info"))){
    error = true;
  }
  if (req.isAuthenticated()) {
      req.user.url = URLL;
      User.findOneAndUpdate({ident:req.user.ident},{url:req.user.url},function(error,info) {

      });
  }
  else {
    error = true;
  }
  res.json({error:error});
});
///////////////////////////////////////////////////////////
app.post('/setLocationTitle', function (req, res){
  var error = 0;
  if(req.isAuthenticated) {
    var TITLEL = JSON.stringify(req.body.title);
    TITLEL = TITLEL.substring(1, TITLEL.length-1);

    if(TITLEL.length==0) {
      error = 1;
    }

    if(error == 0) {
      User.findOne({ username: req.body.username }, function(err, user) {
        if (err) { return (err); }
        user.title = TITLEL;
        user.save(function(err) {
          if(err) { return (err); }
        });
      });
    }
    res.json({error:error});
  }
});
////////////////////////////////////////////////////////////
app.post('/createTeachers', function (req, res,next){
  let error = 0;

   User.find({},function(err,user) {
      if (!err) {
        if((req.body.teacherNum.length!=3 && req.body.teacherNum.length!=4)){
          error = 2;
          console.log(req.body.teacherNum.length);
        }
        else if(isNaN(req.body.teacherNum.substring(0,3)) && !(req.body.teacherNum.substring(0,3) === "GYM")){
          error = 3; //if it's NaN but is not the Gym
        }
        else if(isNaN(req.body.teacherNum.substring(0,3)) && (req.body.teacherNum.substring(0,3) === "GYM") && !(req.body.teacherNum.substring(3)==="A") && !(req.body.teacherNum.substring(3)==="B")&& !(req.body.teacherNum.substring(3)==="C")&& !(req.body.teacherNum.substring(3)==="D")){
          error = 3; //if it's NaN and is the Gym but doesn't end with ABCD
        }
        for(var i = 0; i < user.length; i++){
          if(user[i].username == ("teacher" + req.body.teacherNum)){
            error = 1;
          }
        }
        if(error == 0){
          let identi = req.body.teacherNum;
          if(!(req.body.teacherNum.substring(0,3) === "GYM")){
            if(identi.substring(3) === "A")
              identi = parseInt(req.body.teacherNum.substring(0,3).toString() + 1);
            else if(identi.substring(3) === "B")
              identi = parseInt(req.body.teacherNum.substring(0,3).toString() + 2);
            else if(identi.substring(3) === "C")
              identi = parseInt(req.body.teacherNum.substring(0,3).toString() + 3);
            else if(identi.substring(3) === "D")
              identi = parseInt(req.body.teacherNum.substring(0,3).toString() + 4);
            //above code is to make a unique ID because otherwise both A and B will have the same id
          } 
          else if ((req.body.teacherNum.substring(0,3) === "GYM")) {
            if(identi.substring(3) === "A")
              identi = "0001";
            else if(identi.substring(3) === "B")
              identi = "0002";
            else if(identi.substring(3) === "C")
              identi = "0003";
            else if(identi.substring(3) === "D")
              identi = "0004";
            else
              identi = "0000"
          }
          var newUser = new User({
              username: "teacher" + req.body.teacherNum,
              password: req.body.teacherNum,
              url: "https://mvhs.vistausd.org/",
              title: "title",
              ident: identi});
          newUser.save(next);
        }
        res.json({error:error});
      }
      //return res.json({teachers:teachers});
    });
});
///////////////////////////////////////////////////////////
app.post('/setLocationURLAdmin', function (req, res){
  var error = false;
  var URLL = JSON.stringify(req.body.URLL);
  URLL = URLL.substring(1,URLL.length-1);
  if(!(URLL.includes(".com")||URLL.includes(".org")||URLL.includes(".edu")||URLL.includes(".gov")||URLL.includes(".net")||URLL.includes(".biz")||URLL.includes(".info"))){
    error = true;
  }
  if (req.isAuthenticated()) {
      req.user.url = URLL;
      User.findOneAndUpdate({username:"teacher"+req.body.location},{url:URLL},function(error,info) {

      });
  }
  else {
    error = true;
  }
  res.json({error:error});
});
///////////////////////////////////////////////////////////

let xpos = 0;
let ypos = 0;
let zpos = 0;
let valid = 0;

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
//req is info sending to server from client.
//res is info sending to client from server.
app.get("/",function(req,res) {
  res.sendFile(path.resolve(__dirname,"index.html"));
});

app.get("/getAllDisplayPost",function(req,res) {

  console.log("does a get on files with dirname " + __dirname + "/uploadSettings/approval/mediaPostApproval");
    var files = getFiles(__dirname+ "/uploadSettings/approval/mediaPostApproval");
    var holderStr = "";

    for (var i = files.length - 1; i >= 0; i--) {
      holderStr += files[i].substr(files[i].indexOf('.'))+ " ";
    }

  res.json({files:files}); //needs to match public variable in unity to create from json
});

app.get("/getUrls",function(req,res) {
    var holderStr = "";
    var URLs = [];
    User.find({},function(err,user) {
      if (!err) {
        for(var i = 1; i < user.length; i++){
          URLs.push(user[i].username + '_' +user[i].url);
        }
      }
      return res.json({URLs:URLs});
    });
});

app.get("/getTitles",function(req,res) {
    var holderStr = "";
    var TITLEs = [];
    User.find({},function(err,user) {
      if (!err) {
        for(var i = 1; i < user.length; i++){
          TITLEs.push(user[i].username + '_' +user[i].title);
        }
      }
      return res.json({TITLEs:TITLEs});
    });
});

app.post('/location', function(req, res){
  console.log("do a location");
  console.log("req.body.xpos = " + req.body.xpos);
  console.log("req.body.ypos = " + req.body.ypos);
  console.log("req.body.zpos = " + req.body.zpos);

  valid = 1;
  xpos = req.body.xpos;
  ypos = req.body.ypos;
  zpos = req.body.zpos;
  res.json({valid:valid,xpos:xpos,ypos:ypos,zpos:zpos});
});
////////////
/*
app.get('/newFile', function (req, res){
    res.sendFile(__dirname + '/uploadSettings/index.html');
});
*/
app.get('/admin', function (req, res){
    res.sendFile(__dirname + '/uploadSettings/approval/index.html');
});

var fileName;
var location;
var caption;
var date;

app.post('/setLocationAndsetCaption', function (req, res){
  location = req.body.location
  console.log(req.body.date);
  console.log("first");
  caption = req.body.date + " " + req.body.caption;
  var nothing = "";
  res.json({nothing:'nothing'});
});


app.post('/fileUpload', function (req, res){
  console.log("hello dear");
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files){
      files.filetoupload.name = files.filetoupload.name.replace(/\s/g,'_');//gets rid of all spaces
      var oldPath = files.filetoupload.path;
      var newPath =  __dirname + '/uploadSettings/approval/mediaPostApproval/' + location + "_" + files.filetoupload.name;
      mv(oldPath, newPath, function (err) {
        if (err) throw err;
        console.log('third');
          fs.writeFile(__dirname + "/uploadSettings/approval/mediaPostApproval/" + location + "_" + files.filetoupload.name.substring(0, files.filetoupload.name.indexOf(".")) + ".txt", caption, function(err, data) {
              if (err) console.log(err);
          }); //the above code writes a text file based on the caption passed in
          //here i moved from under function called form.on('fileBegin')
      });

    });

    //form.on('fileBegin', function (name, file){

        //file.path = __dirname + '/uploadSettings/approval/mediaPreApproval/' + location + "_" + file.name;
        //fileName = file.name;
        //fileName = fileName.substring(0, fileName.indexOf("."))
        /*fs.writeFile(__dirname + "/captionsFolder/" + location + "_" + fileName + ".txt", caption, function(err, data) {
          if (err) console.log(err);
        }); */
        //fs.writeFile(__dirname + "/uploadSettings/approval/mediaPreApproval/" + location + "_" + fileName + ".txt", caption, function(err, data) {
        //  if (err) console.log(err);
        //});
    //});

    form.on('file', function (name, file){
      console.log('second');
        console.log('Uploaded ' + file.name);
    });

    res.sendFile(__dirname + '/public/views/teacherSession.html');
});

////////////
////////////////////////////////////
app.get("/getAllDisplayPre",function(req,res) {
  //console.log("does a get on files with dirname " + __dirname + "/uploadSettings/approval/mediaPreApproval/");
    var files = getFiles(__dirname + "/uploadSettings/approval/mediaPreApproval/");
  res.json({files:files}); //needs to match public variable from unity to create from json
});
app.post("/deleteFileFromPre",function(req,res) {
  fs.unlink(__dirname + "/uploadSettings/approval/mediaPreApproval/" + req.body.textFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
  fs.unlink(__dirname + "/uploadSettings/approval/mediaPreApproval/" + req.body.mediaFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
});
app.post("/deleteFileFromPost",function(req,res) {
  fs.unlink(__dirname + "/uploadSettings/approval/mediaPostApproval/" + req.body.textFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
  fs.unlink(__dirname + "/uploadSettings/approval/mediaPostApproval/" + req.body.mediaFile, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log('File deleted!');
  });
});
app.post("/moveApproveToFolder",function(req,res) {
  var files = getFiles(__dirname + "/uploadSettings/approval/mediaPreApproval/");
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
    var fromPath = path.join(__dirname + "/uploadSettings/approval/mediaPreApproval/" , matchedFile[i]);
    var toPath = path.join(__dirname + "/uploadSettings/approval/mediaPostApproval/", matchedFile[i]);

    fs.rename(fromPath, toPath, function (error) {
      if (error) {
        console.error("File moving error.", error);
      } else {
        console.log("Moved file '%s' to '%s'.", fromPath, toPath);
      }
    });
  }
});
////////////////////////////////////
app.listen(3006);
