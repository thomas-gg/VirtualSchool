$(document).ready(function() {
      $("#uploadURL").click(uploadClicked);
      $("#deleteButton").click(deleteClicked);
      $("#logout").click(logoutClicked);
      $("#createTeachers").click(teacherButtonClicked);
      $("#resetPassword").click(resetPasswordClicked);

        $.ajax({
            url : "/getAllDisplayPost",
            type: "GET",
            success : function (data) {
                for(var i = 0 ; i < data.files.length ; i++) {
                  if(data.files[i].includes("txt")) {
                    for(var w = 0 ; w < data.files.length ; w++) {
                      if(!data.files[w].includes("txt") && data.files[i].includes(data.files[w].substring(0,data.files[w].indexOf("."))))
                      captionToTextPost(data.files[i],data.files[w],data.files[i],data.files[w]);
                    }
                  }
                }
            }
        });

        $.get("/adminInfo",function(data){
        if (data.username) {
          //console.log("in adminInfo");
          $("#session").text("Welcome, " + data.username);
          identList = [];
    //console.log(data.userList);
            for (let i=0;i<data.userList.length;i++) {
             // console.log(data.userList[i].name);
              identList.push({ident:data.userList[i].ident});
              $('#names').append($('<input type = "checkbox" name = "names" class = "teacher-names" id = ' + data.userList[i].name + '>' + '<label class = "teacher-labels"> ' + data.userList[i].name + '</label></select> <br>'));
              $('#location').append($('<option>', { value : data.userList[i].name }).text(data.userList[i].name));
            }
        }
      });
        $.ajax({
          url : "/getUrls",
          type: "GET",
          success : function (data) {
            if(data.URLs){
              for(let i = 0; i < data.URLs.length; i++){
                data.URLs[i] = data.URLs[i].substring(0,10) + " : " + data.URLs[i].substring(11);
                $('#allURL').append("<p class = 'URLS'>" + data.URLs[i] + "</p>");
              }
            }
          }
        });
    });

    function captionToTextPost(urltext,urlmedia,txtfile,mediafile){
      $.ajax({
            url : urltext,
            dataType: "text",
            success : function (data) {
              if(urlmedia.includes("jpg") || urlmedia.includes("JPG") ||urlmedia.includes("png") || urlmedia.includes("gif")) {
                $("#approvedMedia").append("<tr>,<td><img src="+ urlmedia +" height = '150px' width = '150px' border = '1'/> </td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td>,</tr>");
              }
              else if(urlmedia.includes("MP4") || urlmedia.includes("mp4")){
                $("#approvedMedia").append("<tr>,<td><video width='150' height = '150' border = '1' controls><source src="+ urlmedia +" type ='video/mp4'/></video></td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td></tr>");
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
                //console.log("values array succesfully sent");
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
                //console.log("values array succesfully sent");
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
               // console.log("values array succesfully sent");
            }
        });
        $(data).remove();
      });
    });

    //////////////////////////////////////////////
function deleteClicked(){
  var nameIDNum = -1;
  $.get("/adminInfo",function(data){
    if (data.username) {

      $("input[name='names']:checked").each( function () {

        for (let i=0;i<data.userList.length;i++) {
          if(data.userList[i].name == $(this).attr("id")){
            nameIDNum = data.userList[i].ident;
            alert("You deleted " + $(this).attr("id"));

            $.ajax({
              url: "/deleteUser/" + Number(nameIDNum),
              type: "DELETE",
              success: function(data) {
                if (!data)
                  alert("bad delete");
                else
                  alert("good delete");
              } ,
              dataType: "json"
            });

          }
        }
      });
      location.reload();
    }
  });
}
/////////////////////////////////////////////
function resetPasswordClicked () {
  $.ajax({
    url : "/changepsw",
    type : "POST",
    data : {username: "admin" , password:$("#psw").val(), confirmpassword:$("#confirmpsw").val()},
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
/////////////////////////////////////////////////
function teacherButtonClicked(){
  let refreshNeeded = false;
  ajax({
    url : "/createTeachers",
    type: "POST",
    data : {teacherNum:$("#teacherNum").val()}}).then(function(data){
      if (data.error == 0){
        alert("Teacher successfully created.");
        refreshNeeded = true;
      }
      else if (data.error == 1){
        alert("Teacher already exists and was not created again.");
      }
      else if (data.error == 2){
        alert("Invalid Entry. Make sure only 3 numbers are inputted.");
      }
      else if (data.error == 3){
        alert("Invalid Entry. Only GYMA, GYMB, GYMC, GYMD, STG, etc. may be submitted");
      }
    }).then(ajax('/getUrls', 'GET').then(function (data){
       if(refreshNeeded == true)
       location.reload();
      }));

  }
  //location.reload();
    //////////////////////////////////////////////

function logoutClicked(){
  $.get("/logout",function(data){
    window.location = data.redirect;
  });
  return false;
}
function uploadClicked(){
    $.ajax({
        url : "/setLocationURLAdmin",
        type: "POST",
        data : {location:$('#location').val().substring(7),URLL:$('#URL').val()},
        success : function (data) {
          if(data.error==true){
            alert("You may want to check your URL because it doesn't contain the typical domain names, such as .org, .net, .edu, .com The URL sent is still accepted and is currently for room " + $('#location').val());
          }
          else{
            alert("upload successful to room " + $('#location').val());
          }
          $.ajax({
              url : "/getUrls",
              type: "GET",
              success : function (data) {
                $('#allURL').empty();
                if(data.URLs){
                  for(let i = 0; i < data.URLs.length; i++){
                    data.URLs[i] = data.URLs[i].substring(0,10) + " : " + data.URLs[i].substring(11);
                    $('#allURL').append("<p>" + data.URLs[i] + "</p>");
                  }
                }
              }
            });
        }
    });
  return false;
}
function ajax(options) {
  return new Promise(function(resolve, reject) {
    $.ajax(options).done(resolve).fail(reject);
  });
} //promise function https://www.stephanboyer.com/post/107/fun-with-promises-in-javascript
