let path = require("path");
let express = require("express");
var passport = require("passport");

//added below for mongo
var User = require("./models/user");

//added above for mongo

//Look at below web page for info on express.Router()
//https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
let router = express.Router();

router.use(function(req, res, next) {
  res.locals.currentUserjy = req.user;
  res.locals.errors = req.flash("error");
  next();
});

//request is info sending to server from client.
//response is info sending to client from server.

//router.get("/",function(req,res){
//	res.sendFile(path.resolve(__dirname + "/public/views/index.html"));  //changed
//});

//added below for mongo
const myDatabase = require('./mongoDatabase');
//added above for mongo

let db = new myDatabase();


router.delete('/deleteUser/:identifier', function(req, res){
////added below for mosngo	
console.log("WAs THIS evn clalse");
	User.remove({ident:req.params.identifier},function(error,removed) {
        if (error) {
            return res.json(null);
        }
        return res.json(removed.result);
    });
	//res.json(db.deleteObject(req.params.identifier));
////added above for mongo
});



module.exports = router;

