
  		function readClicked(){
          $.ajax({
            url: "/read",
            type: "GET",
            data: {},
            success: function(data){
              if (!data)
                alert("bad read");
              else {

            if (data.volleyball)
              $("#volleyball").prop("checked",true);
            else
              $("#volleyball").prop("checked",false);

            if (data.basketball)
              $("#basketball").prop("checked",true);
            else
              $("#basketball").prop("checked",false);

            if (data.soccer)
              $("#soccer").prop("checked",true);
            else
              $("#soccer").prop("checked",false);

                $("#grade").val(data.grade);

      
                alert("good read");
              }
            } ,     
            dataType: "json"
          });     
  		  return false;
  		}
      
      function updateClicked(){

          $.ajax({
            url: "/update",
            type: "PUT",            

            data: {
            grade:$("#grade").val(),volleyball:$("#volleyball").prop("checked"),basketball:$("#basketball").prop("checked"),
            soccer:$("#soccer").prop("checked")

            },
            success: function(data){
              if (!data)
                alert("bad update");
              else
                alert("good update");
            } ,     
            dataType: "json"
          });     
        return false;
      }
//      function deleteClicked(){
//          $.ajax({
//            url: "/delete/" + Number($("#identifier").val()),
//            type: "DELETE",
//            success: function(data) { 
//              if (!data)
//                alert("bad delete");
//              else
//                alert("good delete");
//            } ,   
//            dataType: "json"
//          });  
//          return false;             
//      }      
   		
/*
function userClicked(){

          if ($("#psw").val() == "")
          {
            alert("bad signup");
            return false;
          }          
          $.post("/chanepsw",{username:$("#username").val(), password:$("#psw").val()},function(data)
            {
              console.log(data.redirect);
              if (data.redirect == "/session")
              {
                createClicked();
              }
              window.location = data.redirect;
            });
                      
          return false;
        }
        */
 		
function logoutClicked(){
	$.get("/logout",function(data){
		window.location = data.redirect;
	});
	return false;             
}


$(document).ready(function(){ 
  console.log("session ready");
//  $("#createButton").click(createClicked);
  $("#readButton").click(readClicked);
  $("#updateButton").click(updateClicked);
//  $("#deleteButton").click(deleteClicked);


	$.get("/userInfo",function(data){
		if (data.username) {
      console.log("in userInfo");
      console.log(data.grade);
      console.log(data.volleyball);
      console.log(data.basketball);
      console.log(data.soccer);
			$("#session").text("Session " + data.username + " " + data.ident);

      if (data.volleyball)
        $("#volleyball").prop("checked",true);
      else
        $("#volleyball").prop("checked",false);

      if (data.basketball)
        $("#basketball").prop("checked",true);
      else
        $("#basketball").prop("checked",false);

      if (data.soccer)
        $("#soccer").prop("checked",true);
      else
        $("#soccer").prop("checked",false);

      $("#grade").val(data.grade);

      

    }
    $("#psw").keydown( function( event ) {
            if ( event.which === 13 ) {
              userClicked();
              event.preventDefault();
              return false;
            }
        });
	});

	$("#logout").click(logoutClicked);

  $("form").submit(function(event)
  {
//        if ($("#identifier").val() == "") {
//          alert("NO ID");
//          return false;
//        }
//        if ($("#name").val() == "") {
//          alert("NO NAME");
//          return false;
//        }

  
    return false;
  })



});  		
    


