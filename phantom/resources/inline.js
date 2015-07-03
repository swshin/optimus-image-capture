$(function() {
	$('.optimus-image-capture img').unveil(500, function () {
		$(this).load(function () {
			$(this).addClass('lazy-loaded');
		});
	});
});
