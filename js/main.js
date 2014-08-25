$(document).ready(function() {
	
	$('#addButton').click(function() {
		var itemToAdd = $('input[name=doItem]').val();
		console.log(itemToAdd)
		$('.list').append('<input type="checkbox" name="item" value=' + itemToAdd + '>'+ itemToAdd + '<br>');
	})
})