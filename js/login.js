(function(){
	var $content = $('.content')
	var $logout = $('#logout')

	var userId = localStorage.userid    

	if (!userId) {
	    loginPage ()
	}
	else {
		profileInfo (userId)
	}

	$logout.click(function(e) {
		e.preventDefault()
		localStorage.clear();
		loginPage ($(e.target))
	})

	function loginPage () {
		$logout.addClass('hidden')

		var templateReq = $.ajax({
		    type: "GET",
		    url: "/templates/login.html", 
		    contentType: "application/json; charset=utf-8",
		    dataType: "html",
		});
		templateReq.done(function(data){
			$content.html(data)
			var $name = $('input[name=username]'),
				$password = $('input[name=password]')

			$('#loginButton').click(function() {
				var $loginResult = $('#loginResult')
				var loginName = $name.val()
				var loginPassword = $password.val()
				var validName = Validation (loginName)
				var validPassword = Validation (loginPassword)
				$name.on('input', function() { 
					$name.removeClass('error')
				});
				$password.on('input', function() { 
					$password.removeClass('error')
				});

				if (validName === true && validPassword === true) {
					CheckLogin (loginName, loginPassword)
				}
				else {
					$loginResult.removeClass('hidden')
					if (validName) {
						$name.addClass('error')
						$loginResult.text(validName)
					}
					if (validPassword) {
						$password.addClass('error')
						$loginResult.text(validPassword)
					}
				}

			})
		})
	}


	function TodoRequest (dataToSend, userId, listName) {  
		return $.ajax({
			type: "POST",
			url: "/cgi-bin/todo.pl", 
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(dataToSend)
		});
	}		

	function TodoTemplate (userId, listName, listId, todos) {
		var templateReq = $.ajax({
			type: "GET",
			url: "/templates/todo.html", 
			contentType: "application/json; charset=utf-8",
			dataType: "html",
			data: "id=" + userId + "&name=" + listName
		});
		templateReq.done(function(data){
			$content.off()
			$(".profileContent").remove()
			$content.html(data)

			var $addList = $('#addList'),
				$addButton = $('#addButton')

			var $input = $('input[name=doItem]'),
				$list = $('.list')

			var $errorMessage = $('#errorMessage')

			var action = listId ? 'update' : 'add'

			var itemsToAdd = {},
				itemsToUpdate = {},
				itemsToDelete = {}
			if (listId) {
				$.each(todos, function(id, todo){
					status = (todo.status == 1) ? 'checked' : ''
					
					var checkbox = '<label><input type="checkbox" name="item" value=' + todo.name + ' ' + status + '><span>'+ todo.name + '</span></label><input type="hidden" name="todoId" value="' + id + '"><button class="deleteButton icon-minus in-input-btn">'

					if ($list.find('.item.empty').length) {
						var $item = $list.find('.item.empty').eq(0)
						$item.append(checkbox);
						$item.removeClass('empty')
					} 
					else {
						$list.append('<div class="item">' + checkbox + '</div>')
					}
				})
				$("#addList").attr('value', 'Edit list');
			} 
			
			function addButton() {
				var $itemToAdd = $input.val()
				var validItem = Validation ($itemToAdd)
				if (validItem != true) {
					$input.addClass('error')
					$errorMessage.removeClass('hidden')
					$errorMessage.text(validItem)
				}
				else {
				 	var checkbox = '<label><input type="checkbox" name="item" value=' + $itemToAdd + '><span>'+ $itemToAdd + '</span></label><button class="deleteButton icon-minus in-input-btn">'
					if ($list.find('.item.empty').length) {
						var $item = $list.find('.item.empty').eq(0)
						$item.append(checkbox);
						$item.removeClass('empty')
						
					} 
					else {
						$list.append('<div class="item">' + checkbox + '</div>')
					}
				}
				$('form')[0].reset()
			}

			function addList() {
				$('input[type=checkbox]').each(function () {
					var item = $(this).val(),
						status = this.checked ? '1' : '0'
					if ($(this).parent().parent().find('input[name=todoId]').val()) {
						var todoId = $(this).parent().parent().find('input[name=todoId]').val()
						if (todos[todoId].status != status) {
							itemsToUpdate[todoId] = status
						}
					}
					else {
					    itemsToAdd[item] = status
					}
				});
				var dataToSend = {"userId": userId, "listName": listName, "listId": listId, "action": action, "itemsToAdd": itemsToAdd, "itemsToUpdate": itemsToUpdate, "itemsToDelete": itemsToDelete }
			    var todoRequest = TodoRequest(dataToSend)		
			    todoRequest.done(function () {
			    	profileInfo (userId)
			    })
			}

			function deleteButton() {
				if ($(this).parent().find('input[name=todoId]').val()) {
					var todoId = $(this).parent().find('input[name=todoId]').val()
					itemsToDelete[todoId] = 1
				}
				$(this).parent().addClass('removed-item').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {$(this).trigger('remove').remove()})
				$(this).parent().on('remove', function() {
					if ($list.find('.item').length < 5) {
						$list.append('<div class="item empty"></div>');
					}
				})
			}

			$input.on('input', function() { 
				$input.removeClass('error')
				$errorMessage.addClass('hidden')
			});

			$addButton.on('click', addButton);
			$addList.on('click', addList);
			$list.on('click', '.deleteButton', deleteButton);

		})
	}

	function ProfileTemplate (userData, userId) {
		var templateReq = $.ajax({
		    type: "GET",
		    url: "/templates/profile.html", 
		    contentType: "application/json; charset=utf-8",
		    dataType: "html",
		});
		templateReq.done(function(data){
			$content.off()
			$(".loginContent").remove()
			$content.html(data)
			$logout.removeClass('hidden')

			var $errorMessage = $('#errorMessage')
			var $popup = $('#popup')

			var $lists = $('.lists')
			$.each(userData, function(id, list){
				$lists.append('<div class="listItem"><span>' + list.name + '</span>'
					+ '<button class="edit icon-pencil in-input-btn js-editList">'
					+ '<button class="delete icon-trash-o in-input-btn js-deleteList" value="Del">'
					+ '<input type="hidden" name="listId" value="' + id + '"></div>'
				)
			})

			$lists.on('click', '.js-deleteList', function() {
				var listId = $(this).parent().find('input[name=listId]').val()
				$popup.removeClass('hidden')
				$('#closePopupButton').click(function() {
					$popup.addClass('hidden')
				})
				$('#okPopupButton').click(function() {
					DeleteList (userId, listId)
				})
			});

			$lists.on('click', '.js-editList', function() {
				var listId = $(this).parent().find('input[name=listId]').val()
				var listName = $(this).parent().find('span').text()
				EditList (userId, listName, listId)
			});

			var $listName = $('input[name=listName]')

			$listName.on('input', function() { 
				$listName.removeClass('error')
				$errorMessage.addClass('hidden')

			});

			$('#addListButton').click(function() {
				var $errorMessage = $('#errorMessage')
				var listName = $listName.val()
				var validList = Validation (listName)
				if (validList != true) {
					$listName.addClass('error')
					$errorMessage.removeClass('hidden')
					$errorMessage.text(validList)
				}
				else {
					TodoTemplate (userId, listName)				
				}
			})
		})
	}

	function profileInfo (userId) {
		var profileReq = $.ajax({
	        type: "GET",
	        url: "/cgi-bin/profile.pl", 
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        data: "id=" + userId
	    });
	    profileReq.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
		$('#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
			+ ", errorThrown: " + errorThrown);
			})
		profileReq.done(function(data){
			var userData = data
			ProfileTemplate (userData, userId)
		})
	}

	function CheckLogin (loginName, loginPassword) {
		var checkReq = $.ajax({
	        type: "GET",
	        url: "/cgi-bin/login.pl", 
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        data: "username=" + loginName + "&password=" + loginPassword
	    });
	    checkReq.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
	        	$('#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
	        		+ ", errorThrown: " + errorThrown);
	    })
	    checkReq.done(function(data){
		 		if (data.error) { 
		 			var $loginResult = $('#loginResult')
		 			$loginResult.removeClass("hidden")
		 			$('form')[0].reset()
	            	$loginResult.text(data.error)
	            } 
	            else { 
	            	var userId = data.userId
	            	localStorage.setItem('userid', userId);
	            	profileInfo (userId)
	            }
		})
	}

	function DeleteList (userId, listId) {
		var profileReq = $.ajax({
		    type: "GET",
		    url: "/cgi-bin/delete.pl", 
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    data: "userId=" + userId + "&listId=" + listId
	    });
	    profileReq.fail(function(XMLHttpRequest, textStatus, errorThrown) { 
		$('#loginResult').text("responseText: " + XMLHttpRequest.responseText + ", textStatus: " + textStatus 
			+ ", errorThrown: " + errorThrown);
			})
		profileReq.done(function(data){
			var userData = data
			profileInfo (userId)
		})
	}

	function EditList (userId, listName, listId) {
		var dataToSend = {"listId": listId, "action": "select" }
		var todoRequest = TodoRequest(dataToSend, userId, listName)	
		todoRequest.done(function (data) { TodoTemplate(userId, listName, listId, data) })
	}

	function Validation (text) {
		if (text === '') {
			return 'Field can\'t be empty'
		}
		else if (!text.match(/^[0-9a-zA-Zа-яА-Я ]+$/)) {
			return 'You can use only letters and numbers'
		}
		else {
			return true
		}
	}
})()