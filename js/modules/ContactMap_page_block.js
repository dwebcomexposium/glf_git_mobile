$(document).ready(function () {
	'use strict';

	var ContactMap_page_block = $('.ContactMap_page_block');

	ContactMap_page_block.each(function (i, e) {
		var contactMap = $(e);
		var imageList = contactMap.find('.ContactMap_page_block-image');
		var contactList = contactMap.find('.ContactMap_page_block-contact');

		contactList.click(function (event) {
			event.preventDefault();
			ContactMap_page_block_clickEvent(this, contactList, imageList);
		});

		ContactMap_page_block_clickEvent(contactList[0], contactList, imageList);
	});
});

function ContactMap_page_block_clickEvent (_target, contactList, imageList) {
	var target = $(_target);
	var index = target.index();
	contactList.removeClass('active');
	target.addClass('active');
	imageList.removeClass('active').eq(index).addClass('active');
}