var $input = $('input[name=doItem]'),
	$list = $('.list')

$('#addButton').click(function() {
	var $itemToAdd = $input.val()

    $.ajax({
        type: "GET",
        url: "/cgi-bin/todo.pl", // URL-адрес Perl-сценария
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: "doItem=" + $itemToAdd,
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
        }, 
        success: function(data){
	 		var checkbox = '<label><input type="checkbox" name="item" value=' + data.itemToAdd + '><span>'+ data.itemToAdd + '</span></label><input type="button" class="deleteButton">'
			if ($list.find('.item.empty').length) {
				var $item = $list.find('.item.empty').eq(0)
				$item.append(checkbox);
				$item.removeClass('empty')
				
			} 
			else {
				$list.append('<div class="item">' + checkbox + '</div>')
			}

			$('form')[0].reset()
		}
    });
	
});

$list.on('click', '.deleteButton', function() {
	$(this).parent().remove()
	if ($list.find('.item').length < 5) {
		$list.append('<div class="item empty"></div>');
	}
});


