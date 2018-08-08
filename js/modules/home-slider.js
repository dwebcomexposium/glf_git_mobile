$(document).ready(function () {
	var homeSlider = $('.HomeSlider-slide-list');
	homeSlider.slick({
		dots: true,
		arrows:false,
                initialSlide: 1

	});

	var exhibitionsHighlights = $('.exhibitions-highlights').first().find('.la-list').first();
	exhibitionsHighlights.slick();
});