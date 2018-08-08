/**!
 Search Form
 Search form

 @contributors: Geoffrey Crofte (Alsacréations), Rodolphe (Alsacréations)
 @date-created: 2015-04-01
 @last-update: 2015-10-27
 */

;
(function($) {

	$.cxpSearchform = function(el, options) {

		var defaults = {
			remoteurl:'',
			minimumInputLength:3, // minimum number of characters for input to be sent
			timeoutSuggest:250 // minimum delay timeout before sending input (between keys) (milliseconds)
		};

		var plugin = this;

		plugin.settings = {};

		var $element = $(el),
			element = el;

		// Plugin initialization
		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);
			updateSettingsFromHTMLData();
			registerEvents();
		};

		// Reads plugin settings from HTML data-* attributes (camelCase)
		var updateSettingsFromHTMLData = function() {
			var data = $element.data();
			for (var dat in data)
				plugin.settings[dat] = data[dat];
		};

		// Event Handlers on HTML components inside the plugin
		var registerEvents = function() {

			// $element.each(function() {

				var $target = $element.find('.js-toggle-target');

				// Button to display search, only on pages with .site-banner
				if ($element.closest('.site-banner').length <1) return;

				$element.find('.js-toggle-trigger').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var $target = $(this).closest('.js-gsf');
					$target.toggleClass('is-visible');
					if ($target.hasClass('is-visible')) {
						$target.find('input#search').focus();
					}
					return false;
				});
				$element.on('click', function(e) {
					e.stopPropagation(); // prevent Propagation to body
				});
				$element.on('click', '.js-to-close', function(e) {
					//e.preventDefault();
					closeForm();
				});
				$target.find('input#search').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
				$target.find('input#search').on('focus', function() {
					$(this).closest('.gsf-input-line').addClass('is-focused');
					return false;
				});
				$target.find('input#search').on('blur', function() {
					$(this).closest('.gsf-input-line').removeClass('is-focused');
					return false;
				});

				// Make disappear when click outside
				$('body').on('click', closeForm);

				// Close on ESC key
				$('body').on('keyup', function(e) {
					if(e.keyCode==27)	closeForm();
				});

				// Autocomplete
				plugin.settings.remoteurl = $element.find('meta[itemprop=target]').prop('content');

				// Text input
				$element.find('.gsf-input').on('keyup', function(e) {
					clearTimeout(plugin.timeoutSuggestDo);
					var that = $(this); // closure
					plugin.timeoutSuggestDo = setTimeout(function() {
						autoSuggest(that);
					},plugin.settings.timeoutSuggest);
				});

			//}); // end of $element.each(function() {...

			// Sticky things on scroll (gc)
			var gsf_scrolltimer,
				gsf_menuInitPos = $('.site-banner').outerHeight(), //gc
				$headerSearch = $('.body-visual .site-banner .js-gsf'); // gc

			if ($headerSearch.length > 0) {

				var $trigger = $('.js-toggle-trigger', $element);

				var $searchfield = $('[name=search]', $headerSearch);
				$searchfield.on('keyup', function() {
					$trigger.toggleClass('text-only', $(this).val().length > 0);
				});

				window.addEventListener('scroll', function() {

					clearTimeout(gsf_scrolltimer);
					gsf_scrolltimer = setTimeout(function() {

						if ($(window).scrollTop() >= gsf_menuInitPos) {

							$trigger.attr('title', 'Déplier la recherche');
							$trigger.on('click.cxpnosearch', function(e) {
								var $searchfield = $('[name=search]', $element);
								var searchvalue = $searchfield.val();
								if (searchvalue.length > 0) {
									$(this).closest('form').trigger('submit');
								}
								e.preventDefault();
							});

						} else {

							$trigger.off('click.cxpnosearch').attr('title', 'Lancer la recherche');

						}

					}, 30);
				}, true);

			} // end of Sticky things on scroll (gc)

		}; // End of registerEvents

		// Close the search form
		var closeForm = function() {
			var $jsToggleTrigger = $element.find('.js-toggle-trigger');
			if ($jsToggleTrigger.closest('.js-gsf').hasClass('is-visible')) {
				$jsToggleTrigger.closest('.js-gsf').toggleClass('is-visible');
				if ($jsToggleTrigger.hasClass('text-only')) {
					$jsToggleTrigger.toggleClass('text-only');
					$jsToggleTrigger.closest('.js-gsf').find('input#search').val('');
					$jsToggleTrigger.attr('title', 'Déplier la recherche');
				}
			}
		};

		// Do an autocomplete search
		var autoSuggest = function($elem) {

			var val = $elem.val();

			// Do not send request if chars limit not reached or if previous value
			if(val.length < plugin.settings.minimumInputLength || val==plugin.previousSuggest) return;

			// If remote url is set, do json XHR
			if(plugin.settings.remoteurl) {
				plugin.previousSuggest = val;
				$.getJSON(plugin.settings.remoteurl+val, function(json) {
					if(json) {
						autoSuggestUpdate($elem,json,val);
					}
				});
			}

		};

		var autoSuggestUpdate = function($elem,json,val) {
			// Populate HTML with JSON contents
			var contents = '';
			if(json) {
				$.each(json, function(key,values) {
					if(key && values.length>0) {
						contents += '<div class="tt-dataset"><div class="typeahead-section-name">'+key+'</div><div class="tt-suggestions">';
						$.each(values, function() {
							var re = RegExp(val, 'gi');
							var text = this.title.replace(re,'<strong class="tt-highlight">'+val+'</strong>');
							contents += '<div class="tt-suggestion"><p>';
							if(this.url) contents += '<a href="'+this.url+'">';
							if(this.image) contents += '<span class="tt-suggest-img"><img src="'+this.image+'" alt="" width="31" height="31"></span>'; else contents += '<span class="tt-suggest-img"></span>';
							contents += '<span class="tt-suggest-text">'+text+'</span>';
							if(this.url) contents += '</a>';
							contents += '</p></div>';
						});
						contents += '</div></div>';
					}
				});
			}
			// Insert contents in dropdown if exists, or creates it
			if($elem.next('.tt-dropdown-menu').length<1) {
				$elem.after('<div class="tt-dropdown-menu" style="position: absolute; top: 100%; left:0; z-index: 100; right: auto;"><div class="tt-text-intro">'+$elem.data('suggestion-text')+'</div><div class="tt-dropdown-contents">'+contents+'</div></div>');
			} else {
				$elem.next('.tt-dropdown-menu').find('.tt-dropdown-contents').html(contents);
			}
		};

		plugin.init();

	};

	$.fn.cxpSearchform = function(options) {

		return this.each(function() {
			if (undefined === $(this).data('cxpSearchform')) {
				var plugin = new $.cxpSearchform(this, options);
				$(this).data('cxpSearchform', plugin);
			}
		});

	};

	$('.cxp-searchform').cxpSearchform();

})(jQuery);
