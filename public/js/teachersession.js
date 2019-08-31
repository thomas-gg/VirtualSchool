function ajax(options) {
  return new Promise(function(resolve, reject) {
    $.ajax(options).done(resolve).fail(reject);
  });
} //promise function https://www.stephanboyer.com/post/107/fun-with-promises-in-javascript
$(document).ready(function() {
      displaySessionNameAndURL();
      $("#uploadURL").click(uploadClicked);
      $("#logout").click(logoutClicked);
      $("#submit").click(submitClicked);
      $("#resetPassword").click(resetPasswordClicked);
      $("#uploadTitle").click(uploadTitleClicked);

      var retVal = "";
      var datafiles = [];

      ajax('/getAllDisplayPost', 'GET').then(function(data) {
        datafiles = data.files;
      }).then(ajax('/userInfo', 'GET').then(function (data){
        if (data.username) {
          $("#session").text("Welcome, " + data.username);
          $("#currURL").text(data.url);
          $("#location").text(data.username.substring(7));
          $("#locationNumber").text("Uploading to Room " + data.username.substring(7));
          console.log("curr title is " + data.title);
          if(data.title != "title") {
            $("#currTitle").text(data.title);
          }



          retVal = data.username;
          console.log("ret val " + retVal);
        }
      }).then(function(data) {
        console.log("ret val " + retVal);
        for(var i = 0 ; i < datafiles.length ; i++) {
                  if(datafiles[i].includes("txt")) {
                    for(var w = 0 ; w < datafiles.length ; w++) {
                      if(!datafiles[w].includes("txt") && datafiles[i].includes(datafiles[w].substring(0,datafiles[w].indexOf("."))) && datafiles[i].includes(retVal.substring(7)))
                      captionToTextPost(datafiles[i],datafiles[w],datafiles[i],datafiles[w]);
                    }
                  }
                }
        })
      ); //i had to do it this way so that the userInfo would return ALWAYS before the media in your classroom table stuff
});

    function captionToTextPost(urltext,urlmedia,txtfile,mediafile){
      $.ajax({
            url : urltext,
            dataType: "text",
            success : function (data) {
              if(urlmedia.includes("jpg") || urlmedia.includes("JPG") ||urlmedia.includes("png") || urlmedia.includes("gif")) {
                $("#approvedMedia").append("<tr>,<td><img src="+ urlmedia +" height = '150px' width = '150px' border='1'/> </td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td>,</tr>");
              }
              else if(urlmedia.includes("MP4") || urlmedia.includes("mp4")){
                $("#approvedMedia").append("<tr>,<td><video width='150' height = '150' border='1' controls><source src="+ urlmedia +" type ='video/mp4'/></video></td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td></tr>");
              }

            }
        });
    }

    $("#approveID").click(function(){
      var values = [];
      if(confirm("Are you sure you want to reject and accept these media"))
      $.each($("input[name='approvalcheck']:checked"), function () {
        var data = $(this).parents('tr:eq(0)');
        $.ajax({
            url : "/moveApproveToFolder",
            type: "POST",
            data : {'textFile':$(data).find('td:eq(2)').text(),'mediaFile':$(data).find('td:eq(3)').text()},
            success : function (data) {
                console.log("values array succesfully sent");
            }
        });
        $(data).remove();
      });
      $.each($("input[name='rejectcheck']:checked"), function () {
        var data = $(this).parents('tr:eq(0)');
        $.ajax({
            url : "/deleteFileFromPre",
            type: "POST",
            data : {'textFile':$(data).find('td:eq(2)').text(),'mediaFile':$(data).find('td:eq(3)').text()},
            success : function (data) {
                console.log("values array succesfully sent");
            }
        });
        $(data).remove();
      });
      location.reload();//reload the page
    });
    $("#rejectSubmission").click(function(){
    if(confirm("Are you sure you want to delete from the game forever?"))
      $.each($("input[name='rejectcheck']:checked"), function () {
        var data = $(this).parents('tr:eq(0)');
        $.ajax({
            url : "/deleteFileFromPost",
            type: "POST",
            data : {'textFile':$(data).find('td:eq(2)').text(),'mediaFile':$(data).find('td:eq(3)').text()},
            success : function (data) {
                console.log("values array succesfully sent");
            }
        });
        $(data).remove();
      });
    });

function displaySessionNameAndURL(){
  var retVal = "";
  ajax('/userInfo', 'GET').then(function(data) {
    if (data.username) {
          $("#session").text("Welcome, " + data.username);
          $("#currURL").text(data.url);
          $("#location").text(data.username.substring(7));

          retVal = data.username;
        }
  }).then(function(data){
    //console.log("ret " + retVal);
    return retVal;
  }); //uses promise function
}
function stringIncludes(str) {
  let badChars = ['<','>'];
  for (i=0;i<badChars.length;i++)
  {
    if (str.includes(badChars[i]))
    {
      return true;
    }
  }
  return false;
}
function submitClicked(){
  if(stringIncludes($('#caption').val())){
    alert("you can't use the symbols < or > in the caption");
    return false; //doesn't send file because string includes <>&\\
  }

  $.ajax({
    url: "/setLocationAndsetCaption",
    type: "POST",
    data: {location:$('#location').text(),caption:$('#caption').val(), date:new Date()},

    success: function(data){},
    dataType: "json"
  });

}

//////////////////////////////////////////////
    function resetPasswordClicked () {
      $.ajax({
        url : "/changepsw",
        type : "POST",
        data : {username: "teacher" + $('#location').text() , password:$("#psw").val(), confirmpassword:$("#confirmpsw").val()},
        success : function (data) {
          if(data.error == 0) {
            alert("Password successfully reset.")
          }
          else if(data.error == 1) {
            alert("Reset unsuccessful, Password cannot be set as nothing.")
          }
          else if(data.error == 2) {
            alert("Reset unsuccessful, Passwords do not match.")
          }
        }
      });
      location.reload();
    }
//////////////////////////////////////////

function logoutClicked(){
  $.get("/logout",function(data){
    window.location = data.redirect;
  });
  return false;
}

function uploadClicked(){
    $.ajax({
        url : "/setLocationURL",
        type: "POST",
        data : {location:$('#location').text(),URLL:$('#URL').val()},
        success : function (data) {
          if(data.error==true){
            alert("You may want to check your URL because it doesn't contain the typical domain names, such as .org, .net, .edu, .com The URL sent is still accepted and is currently for room " + $('#location').val());
          }
          else{
            alert("upload successful to room " + $('#location').val());
          }
        }
    });
    location.reload();//reload the page
  return false;
}

function uploadTitleClicked(){
    $.ajax({
        url : "/setLocationTitle",
        type: "POST",
        data : {username: "teacher" + $('#location').text(), title:$('#title').val()},
        success : function (data) {
          if(data.error == 0){
            alert("Title successfully uploaded");
          }
          else if (data.error == 1){
            alert("Upload unsuccessful, Title cannot be set as nothing");
          }
        }
    });
    location.reload();//reload the page
  return false;
}
