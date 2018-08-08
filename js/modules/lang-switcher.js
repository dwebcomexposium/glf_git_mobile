/**!
	Lang Switcher
	Language selector usually included inside the site header

	@contributors: Geoffrey Crofte (Alsacréations)
	@date-created: 2015-04-01
	@last-update: 2015-04-01
 */
 
;(function($) {

	$('.js-lang-switcher').each(function(){

		var $_this = $(this);

		// button creation
		$_this.find('ul').before('<button class="ls-trigger js-toggle-trigger" type="button" title="'+$_this.data('title')+'">'+$_this.find('.is-active').text()+'</button>');

		// accessibility (tab nav)
		$_this.find('a:last').on('blur', function(){
			$_this.find('.js-toggle-trigger').trigger('click');
		});
	})
	.toggleSlide();

})(jQuery);