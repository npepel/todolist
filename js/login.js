var $name = $('input[name=username]'),
	$password = $('input[name=password]')

$('#loginButton').click(function() {
	var login_name = $name.val()
	var login_password = $password.val()
    var check_req = $.ajax({
        type: "GET",
        url: "/cgi-bin/login.pl", 
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: "username=" + login_name + "&password=" + login_password
    });
    check_req.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
        	$('div#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
        		+ ", errorThrown: " + errorThrown);
    })
    check_req.done(function(data){
	 		if (data.error) { 
        		$('div#loginResult').removeClass("hidden");
        		$('div#loginResult').addClass("visible");
	 			$('form')[0].reset()
            	$('div#loginResult').text(data.error);
            } 
            else { 
            	var profile_req = $.ajax({
			        type: "GET",
			        url: "/cgi-bin/profile.pl", 
			        contentType: "application/json; charset=utf-8",
			        dataType: "json",
			        data: "id=" + data.userId
			    });
			    profile_req.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
        		$('div#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
        			+ ", errorThrown: " + errorThrown);
   				})
   				profile_req.done(function(data){
   					var template_req = $.ajax({
				        type: "GET",
				        url: "/templates/profile.html", 
				        contentType: "application/json; charset=utf-8",
				        dataType: "html",
				        data: "data=" + data
				    });
	   				template_req.done(function(data){
	   					console.log(data)
	   					$(".content").off()
	   					$(".login_content").remove()
	   					$(".content").html(data)
	   				})
   				})
            }
		})
	
});