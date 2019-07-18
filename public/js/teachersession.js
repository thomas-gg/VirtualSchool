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

        $.ajax({
            url : "/getAllDisplayPost",
            type: "GET",
            success : function (data) {
                for(var i = 0 ; i < data.files.length ; i++) {
                  if(data.files[i].includes("txt")) {
                    for(var w = 0 ; w < data.files.length ; w++) {
                      if(!data.files[w].includes("txt") && data.files[i].includes(data.files[w].substring(0,data.files[w].indexOf("."))) && data.files[i].includes(displaySessionNameAndURL().substring(7)))
                      captionToTextPost(data.files[i],data.files[w],data.files[i],data.files[w]);
                    }
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
          $("#session").text("Session for " + data.username);
          $("#currURL").text(data.url);
          $("#location").text(data.username.substring(7));

          retVal = data.username;
        }
  }); //uses promise function
  console.log("ret " + retVal);
  return retVal;
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
    async:false;
    success: function(data){},
    dataType: "json"
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