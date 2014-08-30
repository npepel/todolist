var $input = $('input[name=doItem]'),
	$list = $('.list')

$('#addButton').click(function() {
	var itemToAdd = $input.val()
	var checkbox = '<label><input type="checkbox" name="item" value=' + itemToAdd + '><span>'+ itemToAdd + '</span></label><input type="button" class="deleteButton">'
	if ($list.find('.item.empty').length) {
		var $item = $list.find('.item.empty').eq(0)
		$item.append(checkbox);
		$item.removeClass('empty')
		
	} 
	else {
		$list.append('<div class="item">' + checkbox + '</div>')
	}

	$('form')[0].reset();

	
})

$list.on('click', '.deleteButton', function() {
	console.log('ifhrife')
	$(this).parent().remove();
	if ($list.find('.item').length < 5) {
		$list.append('<div class="item empty"></div>');
	}
});
