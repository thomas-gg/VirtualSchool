$(document).ready(function() {
      $("#uploadURL").click(uploadClicked);
      $("#deleteButton").click(deleteClicked);
      $("#logout").click(logoutClicked);
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
          $("#session").text("Admin Session " + data.username + " " + data.ident);
          identList = [];
    //console.log(data.userList);
            for (let i=0;i<data.userList.length;i++) {
             // console.log(data.userList[i].name);
              identList.push({ident:data.userList[i].ident});
              $('#names').append($('<option>', { value : data.userList[i].name }).text(data.userList[i].name));
              $('#location').append($('<option>', { value : data.userList[i].name }).text(data.userList[i].name));
            }
        }
      });
        $.get("/getUrls",function(data){
          if(data.URLs!=null){
            for(let i = 0; i < data.URLs.length; i++){
              data.URLs[i] = data.URLs[i].substring(0,10) + " : " + data.URLs[i].substring(11);
              $('#allURL').append("<p>" + data.URLs[i] + "</p>");
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
                $("#approvedMedia").append("<tr>,<td><img src="+ urlmedia +" height = '150px' width = '150px'/> </td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td>,</tr>");
              }
              else if(urlmedia.includes("MP4") || urlmedia.includes("mp4")){
                $("#approvedMedia").append("<tr>,<td><video width='150' height = '150' controls><source src="+ urlmedia +" type ='video/mp4'/></video></td>,<td>"+ data.substring(58) +"</td>,<td>" + txtfile + "</td>,<td>" + mediafile + "</td>,<td>" + mediafile.substring(0,3) + "</td>,<td>" + data.substring(0,24) + "</td><td><input type = 'checkbox' name='rejectcheck' /></td></tr>");
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
             // console.log("in adminInfo");
              
              //console.log(data.userList);
                  for (let i=0;i<data.userList.length;i++) {
                    if(data.userList[i].name == $("#names").val()){
                      nameIDNum = data.userList[i].ident;
                   //   console.log("this was called " + nameIDNum); //gets id of name thing
                    }
                  }
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
                  resetUserList();
                  return false;    
                } 
            });         
      }      
      
function resetUserList(){
  $('#names').empty();
  $.get("/adminInfo",function(data){
    if (data.username) {
      //console.log("in adminInfo");
      $("#session").text("Admin Session " + data.username + " " + data.ident);
      identList = [];
//console.log(data.userList);
        for (let i=0;i<data.userList.length;i++) {
         //console.log(data.userList[i].name);
          identList.push({ident:data.userList[i].ident});
          $('#names').append($('<option>', { value : data.userList[i].name }).text(data.userList[i].name));
        }
    }
  });
}
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
        }
    });
  return false;
}