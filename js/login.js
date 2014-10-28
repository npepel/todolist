var user_id = localStorage.userid    

if (!user_id) {
    LoginPage ()
}
else {
	ProfileInfo (user_id)
}

function LoginPage () {
	var template_req = $.ajax({
	    type: "GET",
	    url: "/templates/login.html", 
	    contentType: "application/json; charset=utf-8",
	    dataType: "html",
	});
	template_req.done(function(data){
		$(".content").html(data)
		var $name = $('input[name=username]'),
		$password = $('input[name=password]')

		$('#loginButton').click(function() {
			var login_name = $name.val()
			var login_password = $password.val()
			CheckLogin (login_name, login_password)
		})
	})
}


function TodoRequest(data_to_send, user_id, list_name) {
	var todo_req = $.ajax({
		type: "POST",
		url: "/cgi-bin/todo.pl", 
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify(data_to_send)
	});
	todo_req.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
		return false;
	})
	todo_req.done(function(data){
		if (data_to_send.action == 'select') {
			TodoTemplate (user_id, list_name, data_to_send.list_id, data)
		}
	})
}		

function TodoTemplate (user_id, list_name, list_id, todos) {
	var template_req = $.ajax({
		type: "GET",
		url: "/templates/todo.html", 
		contentType: "application/json; charset=utf-8",
		dataType: "html",
		data: "id=" + user_id + "&name=" + list_name
	});
	template_req.done(function(data){
		$(".content").off()
		$(".profile_content").remove()
		$(".content").html(data)

		var $input = $('input[name=doItem]'),
			$list = $('.list')

		var action = list_id ? 'update' : 'add'

		var itemsToAdd = {},
			itemsToUpdate = {},
			itemsToDelete = {}

		if (list_id) {
			$.each(todos, function(id, todo){
				status = (todo.status == 1) ? 'checked' : ''
				var checkbox = '<label><input type="checkbox" name="item" value=' + todo.name + ' ' + status + '><span>'+ todo.name + '</span></label><input type="hidden" name="todo_id" value="' + id + '"><input type="button" class="deleteButton">'
				if ($list.find('.item.empty').length) {
					var $item = $list.find('.item.empty').eq(0)
					$item.append(checkbox);
					$item.removeClass('empty')
				} 
				else {
					$list.append('<div class="item">' + checkbox + '</div>')
				}
			})
		} 
		
		$('#addButton').click(function() {
			var $itemToAdd = $input.val()
		 	var checkbox = '<label><input type="checkbox" name="item" value=' + $itemToAdd + '><span>'+ $itemToAdd + '</span></label><input type="button" class="deleteButton">'
			if ($list.find('.item.empty').length) {
				var $item = $list.find('.item.empty').eq(0)
				$item.append(checkbox);
				$item.removeClass('empty')
				
			} 
			else {
				$list.append('<div class="item">' + checkbox + '</div>')
			}
			$('form')[0].reset()
		});
		$('#addList').click(function() {
			$('input[type=checkbox]').each(function () {
				var item = $(this).val(),
					status = this.checked ? '1' : '0'
				if ($(this).parent().parent().find('input[name=todo_id]').val()) {
					var todo_id = $(this).parent().parent().find('input[name=todo_id]').val()
					if (todos[todo_id].status != status) {
						itemsToUpdate[todo_id] = status
					}
				}
				else {
					console.log(status)
				    itemsToAdd[item] = status
				}
			});
			var data_to_send = {"user_id": user_id, "list_name": list_name, "list_id": list_id, "action": action, "items_to_add": itemsToAdd, "items_to_update": itemsToUpdate, "items_to_delete": itemsToDelete }
		    TodoRequest(data_to_send)		
		    ProfileInfo (user_id)			
		});


		$list.on('click', '.deleteButton', function() {
			if ($(this).parent().find('input[name=todo_id]').val()) {
				var todo_id = $(this).parent().find('input[name=todo_id]').val()
				itemsToDelete[todo_id] = 1
			}
			$(this).parent().remove()
			if ($list.find('.item').length < 5) {
				$list.append('<div class="item empty"></div>');
			}
		});
	})
}

function ProfileTemplate (user_data, user_id) {
	var template_req = $.ajax({
	    type: "GET",
	    url: "/templates/profile.html", 
	    contentType: "application/json; charset=utf-8",
	    dataType: "html",
	});
	template_req.done(function(data){
		$(".content").off()
		$(".login_content").remove()
		$(".content").html(data)

		var $lists = $('.lists')
		$.each(user_data, function(id, list){
			$lists.append('<div class="list_item"><span>' + list.name + '</span>'
				+ '<input type="button" class="edit in-input-btn" id="editList" value="Edit">'
				+ '<input type="button" class="delete in-input-btn" id="deleteList" value="Del">'
				+ '<input type="hidden" name="list_id" value="' + id + '"></div>'
			)
		})

		$lists.on('click', '#deleteList', function() {
			var list_id = $(this).parent().find('input[name=list_id]').val()
			DeleteList (user_id, list_id)
		});

		$lists.on('click', '#editList', function() {
			var list_id = $(this).parent().find('input[name=list_id]').val()
			var list_name = $(this).parent().find('span').text()
			EditList (user_id, list_name, list_id)
		});

		var $listName = $('input[name=listName]')

		$('#addListButton').click(function() {
			var list_name = $listName.val()
			TodoTemplate (user_id, list_name)
		})
	})
}

function ProfileInfo (user_id) {
	var profile_req = $.ajax({
        type: "GET",
        url: "/cgi-bin/profile.pl", 
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: "id=" + user_id
    });
    profile_req.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
	$('div#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
		+ ", errorThrown: " + errorThrown);
		})
	profile_req.done(function(data){
		var user_data = data
		ProfileTemplate (user_data, user_id)
	})
}

function CheckLogin (login_name, login_password) {
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
            	var user_id = data.userId
            	localStorage.setItem('userid', user_id);
            	ProfileInfo (user_id)
            }
	})
}

function DeleteList (user_id, list_id) {
	var profile_req = $.ajax({
	    type: "GET",
	    url: "/cgi-bin/delete.pl", 
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    data: "user_id=" + user_id + "&list_id=" + list_id
    });
    profile_req.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
	$('div#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
		+ ", errorThrown: " + errorThrown);
		})
	profile_req.done(function(data){
		var user_data = data
		ProfileInfo (user_id)
	})
}

function EditList (user_id, list_name, list_id) {
	var data_to_send = {"list_id": list_id, "action": "select" }
	var todos = TodoRequest(data_to_send, user_id, list_name)	
}