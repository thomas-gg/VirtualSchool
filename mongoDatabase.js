

var express = require("express");
var mongoose = require("mongoose");

let myDatabase = function() {
}

//add or modify.  Complete getAllObjects function.
myDatabase.prototype.getAllObjects = function(res) {

Info.find({},function(error,info) {
	if (error) {
		return res.json(null);
	} else {
		let objs = [];
		for (let i=0;i<info.length;i++) {
		  objs.push({ident:info[i].ident,name:info[i].name});
		}
		return res.json(objs);
	}
});

}

myDatabase.prototype.getObjectWithID = function(_ident,res) {
  Info.find({ident:_ident},function(error,info) {
      if (error) {
          return res.json(null);
      }
      else if (info == null) {
          return res.json(null);
      }
      if (info.length == 1)
      {     	
//****Important to add.        
        return res.json({ name: info[0].name, grade: info[0].grade,volleyball : info[0].volleyball
        ,basketball : info[0].basketball,soccer : info[0].soccer });
      }
      else
      {
          return res.json(null);
      }
   });

}




myDatabase.prototype.createObject = function(obj,res) {
    Info.create(obj,function(error,info) {
        if (error) {
            return res.json(null);
        }
//*****Important add here        
	  let obj2 = {ident:obj.ident,name:obj.name, grade: obj.grade,volleyball:obj.volleyball
      ,basketball:obj.basketball,soccer:obj.soccer
    };
        return res.json(obj2);
    });
}


//add or modify.  Complete changeObject function.
myDatabase.prototype.updateObject = function(obj,res) {
//*****Important add here   
Info.findOneAndUpdate({ident:obj.ident},{name:obj.name,grade:obj.grade,volleyball:obj.volleyball
,basketball:obj.basketball,soccer:obj.soccer},function(error,info) {
          if (error) {
              return res.json(null);
          }
          else if (info == null) {
              return res.json(null);
          }
          return res.json(obj);
      });
}


//add or modify.  Complete deleteObjectWithID function.
myDatabase.prototype.deleteObject = function(_ident,res) {
    Info.remove({ident:_ident},function(error,removed) {
        if (error) {
            return res.json(null);
        }
        return res.json(removed.result);
    });
}


module.exports = myDatabase;