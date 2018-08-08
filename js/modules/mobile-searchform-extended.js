/*!
 * Comexposium Extended Search Form Module (mobile)
 * Formerly known as Exhibitor instead of Extended but works as well for Exhibitors and Products.
 * Class used for both is .exhibitor-search-form though
 *
 * Redesign by Alsacréations (alsacreations.fr)
 * Code design contributors: Geoffrey Crofte (Alsacréations), Philippe Vayssière (Alsacréations)
 * Vendors it depends on: jQuery UI 1.11.4 (custom build)
 *
 * File Last Update: 2015-11-24
 */

;jQuery(document).ready(function($){

	// ESF JavaScript only if we find the module

	if ( $('.exhibitor-search-form').length === 1 ) {


		// `esf` = debug function for console.log (ex: esf.log(string))
		// `esf_text` is translation ready texts

		var $dataSrc = $('.esf-all-filters');
		var esf={log:function(e){"undefined"!=typeof console&&console.log(e)}},
			esf_text = {
				remove_filter : $dataSrc.data('esfRemoveFilter'),
				unselect : $dataSrc.data('esfUnselect'),
				select : $dataSrc.data('esfSelect'),
				add : $dataSrc.data('esfAdd'),
				remove : $dataSrc.data('esfRemove'),
				space : '&nbsp;' // empty in english
			};

		$('html').addClass('js');

		/*
		 * AJAX actions
		 */

		// autocomplete
		$('#esf_simple_search').autocomplete({
			// example of request with geobytes.com API (request `q` in 3 min length)
			source: function( request, response ) {
				$.ajax({
					url: "http://gd.geobytes.com/AutoCompleteCity",
					dataType: "jsonp",
					data: {
						q: request.term
					},
					success: function ( data ) {
						response ( data );
					}
				});
			},
			minLength: 3/*,
			select:  function(){},
			open: function(){},
			close: function(){}*/
		});

		function esf_AJAX_do_something_selection(the_id, $the_button) {

			var $the_icon = $the_button.find('i'),
				the_class = $the_button.attr('class');

			$the_icon.attr('class', 'icon-loading');

			if ( the_class === 'esf-action-add-to-selection' ) {

				// ** simulate request delay for adding exhibitor to favs **
				// have to replace setInterval by AJAX request and
				// "simulate positive" by the onsuccess respond

				// do what you want with the exhibitor id
				esf.log('Adding: ' + the_id);

				var fake_ajax_request = setInterval(function(){

					// do what you want with the exhibitor id
					esf.log('Added: '+the_id);

					// simulate positive
					$the_icon.attr('class','icon-remove-selection');
					$the_button.toggleClass('esf-action-add-to-selection esf-action-remove-from-selection').find('.esf-action-text').text(esf_text.remove);

					clearInterval(fake_ajax_request);
					fake_ajax_request = null;
				}, 900);

			}
			else {

				// ** simulate request delay for removing exhibitor to favs **
				// have to replace setInterval by AJAX request and
				// "simulate positive" by the onsuccess respond

				// do what you want with the exhibitor id
				esf.log('Removing: '+the_id);

				var fake_ajax_request = setInterval(function(){

					// do what you want with the exhibitor id
					esf.log('Removed: '+the_id);

					// simulate positive
					$the_icon.attr('class','icon-add-selection');
					$the_button.toggleClass('esf-action-add-to-selection esf-action-remove-from-selection').find('.esf-action-text').text(esf_text.add);

					clearInterval(fake_ajax_request);
					fake_ajax_request = null;

				}, 900);

			}

		}


		function esf_AJAX_update_list() {

			// request begins
			// (mobile) Visual effect should only be applied once: this wasn't the case when removing _all_ filters (this function is then called as many times as there are main categories, 7 in test example)
			// Let's verify layer doesn't exist yet before creating it
			var $layer = $('.esf-loader-layer'),
				layerCreated = false;
			if( $layer.length === 0 ) {
				layerCreated = true;
				$('.exhibitor-search-form').append('<div class="esf-loader-layer"><div class="esf-loader" title="0"><div class="loading"><div class="loading-inner"><span class="shape"></span><span class="shape"></span><span class="shape"></span></div></div></div></div>');
				$('.esf-loader-layer').hide().fadeIn(200);
			}

			setTimeout( function() {
				// in request success
				// Layer is removed once (wouldn't harm if it was removed N times as it could only be done once)
				// Should be removed after the success of the _last_ successful AJAX request but that's not the case yet
				if( layerCreated === true ) {
					$('.esf-loader-layer').fadeOut(200, function(){ $(this).remove(); });
				}
			}, 300);
		}
		// AJAX END

		// on prev lvl click
		// This function is called either after pressing Back button of the browser or - along with .go(-1) and without popstate event - after a "real" click on backlink
		// tl;dr we don't want .go(-1) while triggering a click in order to manage popstate event. We just want to call the following function
		$.fn.manageBacklink = function () {
			var $_this				= $(this);
			var current_lvl_class	= $_this.closest('[class^="tree-lvl-"]').attr('class');
			var current_lvl			= (current_lvl_class !== undefined) ? current_lvl_class.split('-')[2] : 1;

			$_this.closest('.esf-as-tree').removeClass('to-lvl-'+current_lvl);
			$panel_filters.removeClass('displaying-lvl-'+current_lvl);

			var timer = setInterval(function(){
				$_this.closest('.go-to-next-lvl').removeClass('go-to-next-lvl');
				clearInterval(timer);
				timer = null;
			}, 300);

			return false;
		};

		// Managing Back button
		// If user clicks Back button, we go up 1 level (note: if we are at level "0", then modal closes as do(es) every modal(s), see modal.js)
		// Info we have: { modal: opened } then { esfAction: 'next', esfLevel: 1 }, 2 and 3 (there are 3 sub-levels but could easily be 5)
		function manageBackButton() {
			$(window).on("popstate.esf", function(e) {
				var state = e.originalEvent.state;

				if(state) {
					if (state.esfAction === "next" && parseInt(state.esfLevel, 10) >= 1) {
						// Case "going back from 2 to 1 (or 3 to 2, etc)"
						$('.go-to-next-lvl').last().find('.esf-back-to-prev-lvl').manageBacklink(); // .go-to-next-lvl is only in 1 panel (but not unique if we're at level > 2) while .esf-back-to-prev-lvl isn't after a while
					} else if (state.modal === "opened" && $('.displaying-lvl-1').length) {
						// Case 1 to main panel
						$('.displaying-lvl-1').find('.esf-back-to-prev-lvl').first().manageBacklink();
					}
				}
			});
		}


		/*
		 * Variables init
		 */

		var $panel_header	= $('.esf-as-header'),
			$panel			= $('.esf-as-tree'),
			$panel_filters	= $('.esf-as-filters'),
			$panel_content	= $('.esf-as-panel-content'),
			$list_filters	= $('.esf-as-list-filters'),
			$tree_first_lvl = $(".esf-tree"),
			panel_cmd_close	= ".m-btn-to-close",
			max_lvl			= 1,
			slide_panels	= '',
			isSafari = /constructor/i.test(window.HTMLElement); // Allows to correct buggy vw unit in iOS <=7. @source http://browserhacks.com/#hack-8cbfaf04fe51ad543a597fbd2f249fa7



		/*
		 * Markup redesign
		 */
		$panel_content.find('.esf-tree li ul').closest('li').addClass('esf-has-sub-items');
		// $list_filters.find('li:first').addClass('current');

		// js placeholders for multilingual solution
		// "Remove filters" (on mobile) comes after filters
		var txtFilterRemoving = $('.esf-all-filters').data('esfRemoveFilters');
		$('.esf-all-filters').find('.esf-as-af-filters').after('<button type="button" class="esf-remove-filters hidden" aria-hidden="true">'+txtFilterRemoving+'<i class="icon icon-close" aria-hidden="true"></i></button>');

		// adds tree lvl class
		$tree_first_lvl.each(function(){
			$(this).find("ul").each(function() {
				var lvl = $(this).parentsUntil(".esf-tree").filter("ul").length + 2;
				$(this).addClass("tree-lvl-" + lvl);
				max_lvl = max_lvl < lvl ? lvl : max_lvl;
			});
			$(this).closest('.esf-as-tree').addClass('max-depth-'+ (max_lvl-2));
		});

		// builds slide panel for each sub lvl
		/*
		for (i=3; i<=max_lvl; i++) {
			slide_panels += '<div class="slide-panel slide-panel-'+ (i-2) +'"></div>';
		}
		$tree_first_lvl.after(slide_panels);
		*/

		// hide all panels, keep first only
		$('.esf-as-filter-panel').hide();

		// marks tree with only one basic lvl
		$tree_first_lvl.addClass('esf-only-one-lvl').find('.esf-has-sub-items:first').closest('.esf-only-one-lvl').removeClass('esf-only-one-lvl');



		/*
		 * some useful functions
		 */


		// reset checked checkboxes
		function esf_reset_panel(element_id) {
			var $the_tree = $('#tree_'+element_id);

			$the_tree.find('input:checkbox').prop('checked', false);
			$the_tree.find('.esf-item-checked').removeClass('esf-item-checked');
		}


		// count the selected checkboxes and display the number
		// updates the global filters count
		function esf_count_selected(element) {

			// element is the clicked checkbox
			var parent_tab		= element.closest('.esf-as-filter-panel'),
				element_id		= parent_tab.attr('id'),
				nb_of_items_sel = parent_tab.find('input:checkbox:checked').length,
				$filter_tag		= $('.esf-' + element_id + '-filter'),
				panel_name		= $('.esf-as-list-filters').find('a[href="#'+element_id+'"]').find('.esf-as-filter-name').text();

			if (nb_of_items_sel !== 0 ) {

				$list_filters.find('[href="#'+element_id+'"]').find('.esf-as-count').addClass('counted').find('.esf-as-count-nb').text(nb_of_items_sel);

				esf_show_filter_ui(element_id);

				// tag filter creation
				if ( $filter_tag.length === 0 ) {
					var filter_markup ='<span class="esf-' + element_id + '-filter"><span class="esf-tag-filter-label">' + panel_name + esf_text.space + ':&nbsp;</span><span class="esf-tag-filter-nb">' + nb_of_items_sel + '</span><button type="button" class="esf-tag-filter-remove" title="' + esf_text.remove_filter +'"><i class="icon-close"></i></button></span>';
					$('.esf-as-af-filters').append(filter_markup);
				}
				// tag filter update number
				else {
					$filter_tag.find('.esf-tag-filter-nb').text(nb_of_items_sel);
				}
			}

			else {

				$list_filters.find('[href="#' + element_id + '"]').find('.esf-as-count').removeClass('counted').find('.esf-as-count-nb').text('');
				esf_hide_filter_ui(element_id);
				$filter_tag.remove();

			}

			refresh_filters_activated();
		}

		function refresh_filters_activated() {
			if ( $('.esf-as-af-filters').find('span').length !== 0 ) {
				$('.esf-as-activated-filters').removeClass('hidden').attr('aria-hidden', 'false');
				return true;
			}
			else {
				$('.esf-as-activated-filters').addClass('hidden').attr('aria-hidden', 'true');
				return false;
			}
		}

		function refresh_global_filter_counts() {
		}


		// show filter UI elements
		function esf_show_filter_ui(element_id) {
			$('.esf-remove-filters').removeClass('hidden').attr('aria-hidden', 'false');
		}

		// remove filter UI elements ("Active filters")
		function esf_hide_filter_ui(element_id) {
			$('.esf-all-filters').find('.esf-'+element_id+'-filter').remove();
		}

		// set correct widths on elements which width is set with vw unit though latter is buggy on iOS <= 7
		// This either corrects a buggy width on iOS <= 7 or - on iOS >=8 and all versions of OS X - sets the same wdth which is already correct (thus changes nothing)
		function esf_width_vw_safari() {
			if(isSafari) {
				// Case 1-3 is "calc(100vw - 2rem)"
				// 100vw == window.width and 1rem is the padding-left of a certain parent
				var w100 = $(window).width(),
					ml = parseInt($panel_filters.css('padding-left'), 10); // Should be set to 1rem in CSS so should return the value of 1rem
				$('.esf-as-list-filters, .esf-tree, [class^="tree-lvl-"]').each(function() {
						$(this).width(w100 - 2*ml);
					});

				// Case 4 is "500vw"
				$('.esf-as-filter-panel').width(5 * w100);
			}
		}


		/*
		 * Some useful actions
		 */

		// on advanced search activation
		$panel_header.addClass('is-closed').attr('tabindex', '0');
		$panel_filters.hide();
		$panel_header.on('click', function() {
			$(this).toggleClass('is-closed');
			$panel_filters.slideToggle(300);
			esf_width_vw_safari(); // @BUGFIX iOS <= 7 and vw unit (changes nothing on other Safari versions like iOS >= 8 and desktop)
			// Now managed by modal.js firsthand:
			//$('main').toggleClass('allows-over-stuck'); // (LESS file: mobile-header.less) adds z-index on main element so esf can be over stuck menu (and over "back to top" link in footer btw)
		});
		$panel_header.on('keypress', function(e) {
			if(e.keyCode === 13 || e.keyCode === 0) {
				$(this).trigger('click');
			}
			return false;
		});

		// when closing filters modal, manage removal of 2 classes
		$panel_filters.on('click', panel_cmd_close, function(event) {
			$(this).toggleClass('is-closed');
		});
		// @TODO PHV Useful in dev...
		// $panel_header.click();

		// on filter panel type click
		$('.esf-as-list-filters').find('a').on('click', function(){
			var the_id = $(this).attr('href');

			$(this).closest('ul').find('li').removeClass('current');
			$(this).closest('li').addClass('current');
			$('.esf-as-filter-panel').hide();
			// adds a link back to list filters ("level 0") (if there isn't already one). Different text in each panel
			if ( $(the_id).find('.esf-tree .esf-sublvl-heading').length === 0 ) {
				var txtFilterBacklink = $(the_id).data("filterBacklink");
				$(the_id).find('.esf-tree').prepend('<li class="esf-sublvl-heading"><button class="esf-back-to-prev-lvl" type="button"><i aria-hidden="true" class="icon-arrow-left"></i>'+txtFilterBacklink+'</button></li>');
			}
			$(the_id).show();

			//  #10824: pushState: going from level "0" (default view of modal when opened) to level 1
			if (typeof history.pushState !== "undefined") {
				history.pushState({ esfAction: 'next', esfLevel: "1" }, "", ""); // "1" is a string (because 2 and 3 are below)
			}


			// waiting 300ms so the transition of both elements is finished
			var timer = setInterval(function(){
				$panel_filters.addClass('displaying-lvl-' + 1);
				clearInterval(timer);
				timer = null;
			}, 300);

			return false;
		});


		// on checkbox check
		$panel_content.find('input:checkbox').on('change', function() {
			if ( $(this).is(':checked') ) {
				$(this).closest('li').addClass('esf-item-checked').find('ul').find('li').addClass('esf-item-checked').find('input:checkbox').prop('checked', true);
				esf_count_selected($(this));
			}
			else {
				$(this).closest('li').removeClass('esf-item-checked').find('ul').find('li').removeClass('esf-item-checked').find('input:checkbox').prop('checked', false);
				esf_count_selected($(this));
			}
			// AJAX update list
			esf_AJAX_update_list();
		});

		// on checkbox check all in the current lvl
		$panel_content.on('change', '.esf-checkbox-select-all', function() {
			if ( $(this).is(':checked') ) {
				$(this).closest('li').nextAll('li').addClass('esf-item-checked').find('input:checkbox').prop('checked', true);
				$(this).closest('li').nextAll('li').find('li').addClass('esf-item-checked');
			}
			else {
				$(this).closest('li').nextAll('li').removeClass('esf-item-checked').find('input:checkbox').prop('checked', false);
				$(this).closest('li').nextAll('li').find('li').removeClass('esf-item-checked');
			}
			esf_count_selected($(this));
			// AJAX update list
			esf_AJAX_update_list();
		});

		// on next lvl click
		$panel_content.on('click', '.esf-has-sub-items > .esf-choice-container .esf-next-lvl', function() {

			var $next_lvl		= $(this).closest('.esf-choice-container').next('ul'),
				class_el		= $next_lvl.attr('class'),
				lvl_el			= class_el.split('-')[2],
				$lvl_parent		= $(this).closest('.esf-as-tree'),
				label_text		= $(this).prev('label').text(),
				uniqid			= $(this).prev('label').attr('for'),
				//select_all_txt	= esf_text.select,
				checked_state	= '';

			$(this).closest('.esf-has-sub-items').addClass('go-to-next-lvl');
			$lvl_parent.addClass('to-lvl-' + lvl_el);
			$panel_filters.addClass('displaying-lvl-' + lvl_el);

			// #10824 - Fermeture critères - Retour à la liste
			// pushState will allow to intercept Back button when any modal is opened (not only advanced searchform)
			// and close the modal while staying on the same page instead of actually go back to previous page
			if (typeof history.pushState !== "undefined") {
				history.pushState({ esfAction: 'next', esfLevel: lvl_el }, "", ""); // object, title (unrecognized at least by Fx?) and fake URL (none because closing the modal would leave this fake URL visible)
			}

			var nb_item	= $next_lvl.find('li').length,
				nb_check	= $next_lvl.find('li').find('input:checked').length;

			if (nb_item === nb_check ) {
				checked_state = ' checked="checked"';
			}

			if ( $next_lvl.find('li:first').filter('.esf-sublvl-heading').length === 0 ) {
				$next_lvl.find('li:first').before('<li class="esf-sublvl-heading"><button type="button" class="esf-back-to-prev-lvl"><i class="icon-arrow-left" aria-hidden="true"></i>' + label_text + '</button>');
				// Supprimé sur mobile : <label for="'+uniqid+'_select_all"><span class="esf_select_all_label">'+select_all_txt+'</span> <input type="checkbox" id="'+uniqid+'_select_all" class="esf-checkbox-select-all"'+checked_state+' /></label></li>
			}

		});

		// on prev lvl click
		$panel_content.on('click', '.esf-back-to-prev-lvl', function() {
			$(this).manageBacklink();

			// Syncing browser history with clicks on this backlink
			// We need to *not* react to the event which will be fired by go(-1) and then re-enable it
			$(window).off("popstate.esf");
			history.go(-1);
			manageBackButton();
		});

		// on (browser) Back button (uses function defined above with popstate event and across this script with pushState)
		manageBackButton();

		// on remove filterS click (on mobile, removes at once each filter from all panels)
		$('.esf-remove-filters').on('click', function() {
			$('.esf-as-tree').each(function() {
				var id	= $(this).attr('id'),
					name = id.split('_tree');

				esf_reset_panel(name[0]);
				esf_count_selected($(this));
				// AJAX update list
				esf_AJAX_update_list();
			});
		});

		// on remove tag filter click
		$('.esf-as-af-filters').on('click', '.esf-tag-filter-remove', function(){
			var id = $(this).closest('span').attr('class'),
				name = id.split('-');

			esf_reset_panel(name[1]);
			esf_count_selected($('#'+name[1]+'_tree'));
			// AJAX update list
			esf_AJAX_update_list();
		});

		// on description or image of exhibitor click
		$('.esf-ei-image, .esf-ei-description').on('click', function(){
			var link = $(this).closest('.esf-exhibitor-item').find('.esf-ei-title').find('a').attr('href');
			document.location.href = link;
			return false;
		});

		// on add to fav
		$('.esf-ei-actions').on('click', '.esf-action-add-to-selection, .esf-action-remove-from-selection', function(){

			var the_id  = $(this).closest('.esf-exhibitor-item').attr('id');
				exhi_id = the_id.split('-')[1];

			esf_AJAX_do_something_selection(exhi_id, $(this));

			return false;

		});

		// on exhibitor item focus main link
		$('.esf-ei-title').find('a').on('focus', function(){
			$('.esf-exhibitor-item').removeClass('esf-focused');
			$(this).closest('.esf-exhibitor-item').addClass('esf-focused');
		});
		$('.esf-exhibitor-item').on('mouseenter', function() {
			$('.esf-exhibitor-item').removeClass('esf-focused');
		});
		$('.esf-ei-actions').find('a:last').on('blur', function(){
			$('.esf-exhibitor-item').removeClass('esf-focused');
		});

		//simulate alpha filter click
		$('.esf-results-alpha-list').find('a').on('click', function(){
			// AJAX update list
			esf_AJAX_update_list();
			return false;
		});


	} // end of 'only if module here'


});
