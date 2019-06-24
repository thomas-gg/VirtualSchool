    	$(document).ready(function(){
    		$("#submit").click(submitClicked);
        $("#logout").click(logoutClicked);
      });
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
        alert("This will be reviewed by an Administer before it is posted");
        
        $.ajax({
          url: "/setLocationAndsetCaption",
          type: "POST",
          data: {location:$('#location').val(),caption:$('#caption').val(), date:new Date()},
          sync: false,
          success: function(data){},
          dataType: "json"
        });
        
      }
      function logoutClicked(){
        $.get("/logout",function(data){
         window.location = data.redirect;
        });
        return false;             
      }