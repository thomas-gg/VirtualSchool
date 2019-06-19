var path = require("path");
var express = require("express");
var passport = require("passport");

var User = require("./models/user");

var router = express.Router();

//function ensureAuthenticated(req, res, next) {
//  if (req.isAuthenticated()) {
//    next();
//  } else {
//    req.flash("info", "You must be logged in to see this page.");
//    res.redirect("/login");
//  }
//}

router.use(function(req, res, next) {
  res.locals.currentUserjy = req.user;
  res.locals.errors = req.flash("error");
  next();
});


//added below for mongo
const myDatabase = require('./mongoDatabase');
//added above for mongo

let db = new myDatabase();

var ident = 0;

function initIdent(){
  if (ident == 0)
  {
    User.find({},function(err,user) {
      if (!err) {
        for (let i=0;i<user.length;i++) {
          if (ident < user[i].ident)
            ident = user[i].ident;
        }
      }
    });    
  }
}

router.get("/successroot", function(req, res) {
console.log("get successroot");
	res.json({redirect:"/login"});	
});

router.get("/failroot", function(req, res) {
console.log("get failroot");
	res.json({redirect:"/login"});	
});

router.get("/successsignup", function(req, res) {
console.log("get successsignup");
    if (req.user.username == "admin")
    {
      res.json({redirect:"/adminsession"});      
    }
    else
    {
      res.json({redirect:"/session"});    
    }
});

router.get("/failsignup", function(req, res) {
console.log("get failsignup");
	res.json({redirect:"/login"});	
});

router.get("/successlogin", function(req, res) {
console.log("get successlogin");

    if (req.user.username == "admin")
    {
      res.json({redirect:"/adminsession"});      
    }
    else
    {
      res.json({redirect:"/session"});    
    }
  console.log("end of successlogin");
});
router.get("/faillogin", function(req, res) {
console.log("get faillogin");
	res.json({redirect:"/login"});	

});

router.get("/newFiles", function(req, res, next) {
console.log("get root");

	let thePath = path.resolve(__dirname,"public/views/login.html");		
	res.sendFile(thePath);	

 // User.find()
 // .sort({ createdAt: "descending" })
 // .exec(function(err, users) {
 //   if (err) { return next(err); }
 //   res.render("index", { users: users });
 // });
});

router.get("/signup", function(req, res) {
console.log("get signup");
  initIdent();

	let thePath = path.resolve(__dirname,"public/views/signup.html");		
	res.sendFile(thePath);	

});

router.get("/login", function(req, res) {
console.log("get login");

	let thePath = path.resolve(__dirname,"public/views/login.html");		
	res.sendFile(thePath);	

});

router.get("/adminsession", function(req, res) {
  console.log("get adminsession");
  if (req.isAuthenticated()) {
       let thePath = path.resolve(__dirname,"uploadSettings/approval/index.html");   
       res.sendFile(thePath); 
  } else {
    let thePath = path.resolve(__dirname,"public/views/login.html");    
  res.sendFile(thePath);  
  }
});

router.get("/session", function(req, res) {
  console.log("get session");
  if (req.isAuthenticated()) {
	     let thePath = path.resolve(__dirname,"uploadSettings/index.html");		
	     res.sendFile(thePath);	
  } else {
  	let thePath = path.resolve(__dirname,"public/views/login.html");		
	res.sendFile(thePath);	
  }
});

router.get("/adminInfo",function(req,res){

  if (req.isAuthenticated()) {

        if (req.user.username == "admin")
        {
            User.find({},function(error,user) {
              if (error) {
                return res.json(null);
              } else {
                let list = [];
                for (let i=0;i<user.length;i++) {
                  if(user[i].username!="admin")//gets all users except the admin
                  list.push({ident:user[i].ident,name:user[i].username});
                }
                res.json ({ ident:req.user.ident,username: req.user.username,userList:list});
              }
            });
        }
        else
          res.json(null);          
  }
  else {
    res.json(null);
  }
});
//==================
/*
function initAdmin(req,res) {
  console.log("initAdmin");
  console.log(req.user.ident);
  console.log(req.user.username);

            Info.find({},function(error,info) {
              if (error) {
                return res.json(null);
              } else {
                let list = [];
                for (let i=0;i<info.length;i++) {
                  list.push({ident:info[i].ident,name:info[i].name});
                }
                res.json ({ ident:req.user.ident,username: req.user.username,userList:list});
              }
            });
}
*/
router.get("/userInfo",function(req,res){
  if (req.isAuthenticated()) {
      res.json({username:req.user.username});
	}
	else {
		res.json(null);
	}
});

router.get("/logout", function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect("/successroot");
  } else {
    res.redirect("/failroot");
  }
});

function stringIncludes(str) {
  let badChars = ['<','>','&','"',"'",'/','\\'];
  for (i=0;i<badChars.length;i++)
  {
    if (str.includes(badChars[i]))
    {
      return true;
    }
  }
  return false;
}

router.post("/signup", function(req, res, next) {
console.log("post signup");

  var username = req.body.username;
  var password = req.body.password;

  if (stringIncludes(username))
  {
    return res.redirect("/failsignup");
  }
  else
  {


//console.log(req.body.username);
//  var username = removeHtml(req.body.username);
//console.log(username);

  ident++;

  User.findOne({ username: username }, function(err, user) {

    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/failsignup");
    }

    var newUser = new User({
      username: username,
      password: password,
      ident: ident
    });
    newUser.save(next);    //this line has to be called.
  });

  }

}, passport.authenticate("login", {
  successRedirect: "/successsignup",
  failureRedirect: "/failsignup",
  failureFlash: true
}));


router.post("/login", passport.authenticate("login", {
  successRedirect: "/successlogin",
  failureRedirect: "/faillogin",
  failureFlash: true
}));
/*
var noop = function() {};

router.post('/changepsw', function(req, res){
    if (req.isAuthenticated()) {
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
                User.findOneAndUpdate({ident:req.user.ident},{password:req.user.password},function(error,info) {
                this.checkPassword(req.body.password,done);
              });
    });
  }
});
*/
module.exports = router;
/*
bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) { return done(err); }
    bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
      if (err) { return done(err); }
      user.password = hashedPassword;
      done();
    });
  });
  */