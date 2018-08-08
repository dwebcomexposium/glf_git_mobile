/**!
 Library
 Library module with Cart in local storage

 @contributors: Guillaume (Alsacréations)
 @date-created: 2015-05-20
 @last-update: 2015-05-21
 */

(function($) {

    $.cxpLibrary = function(el, options) {

        var defaults = {};
        var plugin = this;
        plugin.settings = {};
        var $element = $(el),
            element = el,
            lsPrefix = 'cxpCart_', //prefix for the localstorage
            id = $element.data('cartId'), //id for name the localstorage
            cart = {
                'folders': {},
                'items': {}
            }, //object Cart
            $modal = $('#modal' + id), //modal basket
            $modalPreview = $('#modalPreview' + id), //modal preview
            cxpStorage = localStorage, //Define storage type
            cartButton = $('[data-cart-id="' + id + '"]').find('.lb-js-btn'); // CartButton

        // Plugin initialization
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.lsGet();
            if ($element.find('.lb-js-folder').length > 0) {
                updateFoldersInfos();
            }
            if ($element.find('.lb-js-item').length > 0) {
                updateItemsInfos();
            }
            updateCartButton();
            updateTotalLength();
            registerEvents();

            return true;
        };
        // LocalStorage Action
        //get
        plugin.lsGet = function() {
            var cartRaw = cxpStorage.getItem(lsPrefix + id);
            if (cartRaw !== null) {
                cart = JSON.parse(cartRaw);
            } else {
                plugin.lsSet();
            }
        };
        //set
        plugin.lsSet = function() {
            var cartRaw = JSON.stringify(cart);
            cxpStorage.setItem(lsPrefix + id, cartRaw);
        };
        //remove
        plugin.lsRemove = function() {
            cxpStorage.removeItem(lsPrefix + id);
        };

        plugin.getLength = function(folder) {
            if (folder !== undefined) {
                if (cart.folders[folder] === undefined) {
                    return 0;
                }
                return Object.keys(cart.folders[folder]).length;
            } else {
                return Object.keys(cart.items).length;
            }
        };

        // UPDATE method
        var updateCartButton = function() {
            var nbItem = plugin.getLength();
            cartButton.removeClass('btn-invert').removeClass('btn-primary');
            if (nbItem > 0) {
                cartButton.attr('class', 'btn-primary ' + cartButton.attr('class'));
            } else {
                cartButton.attr('class', 'btn-invert ' + cartButton.attr('class'));
            }
            cartButton.find('.nb').text(nbItem);

            //Update length for the button inside modal
        };
        var updateFoldersInfos = function() {
            var $folders = $('.lb-js-folder');

            $folders.each(function() {
                var nbSelected = plugin.getLength($(this).data('folderId'));
                if (nbSelected > 0) {
                    $(this).find('.lb-list-link').addClass('is-selected');
                } else {
                    $(this).find('.lb-list-link').removeClass('is-selected');
                }
                $(this).find('.lb-list-infos').find('.nb').text(nbSelected);

            });

        };
        var updateItemsInfos = function() {
            var $items = $('.lb-js-item');
            $items.each(function() {
                if (cart.items[$(this).data('itemId')] !== undefined) {
                    $(this).find('.lb-js-item-checkbox').prop('checked', 'checked');
                    $(this).find('.lb-select-list-link').removeClass('is-checked').addClass('is-checked');
                } else {
                    $(this).find('.lb-js-item-checkbox').prop('checked', false);
                    $(this).find('.lb-select-list-link').removeClass('is-checked');
                }
            });

        };
        var updateTotalLength = function() {
            var TotalLength = 0;
            $.each(cart.items, function() {
                TotalLength += this.itemLength;
            });
            $modal.find('.lb-js-modal-download .lb-js-total').text(TotalLength);
        };
        // Event Handlers on HTML components inside the plugin
        var registerEvents = function() {
            //event check
            $element.on('click', '.lb-js-item-checkbox', plugin.itemAction);
            $element.on('click', '.lb-select-list-link', plugin.itemPreview);
            $element.on('click', '.lb-js-btn', plugin.regenModalAction);
            $modal.on('click', '.lb-js-modal-drop-all', plugin.resetCartAction);
            $modal.on('click', '.lb-js-modal-btn-drop-item', plugin.deleteFromCartAction);
        };
        // Actions

        //Update modal's content (folder and item)
        plugin.regenModalAction = function(e) {
            var nbItem = plugin.getLength(),
                $modalContent = $modal.find('.lb-js-modal-content'),
                $template = $('#tpl-lb-js-modal-content').html();
            var cft = plugin.prepareCartForTemplate(); //Cart For Template
            if (nbItem > 0) {
                $('.lb-js-modal-drop-all').show();
                $('.lb-js-modal-download').show();
                $modalContent.html($.mustache($template, cft));
            } else {
                $('.lb-js-modal-drop-all').hide();
                $('.lb-js-modal-download').hide();
                $('.lb-js-modal-content').html('<p>Le panier est vide.</p>');
            }
            updateTotalLength();
        };
        //Item checkbox click
        plugin.itemAction = function() {
            if ($(this).prop("checked")) {
                plugin.addToCart($(this));
            } else {
                plugin.removeFromCart($(this));
            }
            plugin.lsSet();
            updateCartButton();
            updateItemsInfos();
            updateTotalLength();
        };
        //Item Image click
        plugin.itemPreview = function() {
            //Update modal content
            //console.log('Go Update Modal!');
            var $item = $(this).closest('.lb-js-item');

            $modalPreview.find('.lp-item-title').text($(this).find('.lb-select-list-title').text());
            $modalPreview.find('.lp-item-desc').text($(this).find('.lb-select-list-legend').text());
            $modalPreview.find('.lp-item-copy').text($(this).find('.lb-select-list-copyright').text());
            $modalPreview.find('.lp-item-size').text($(this).find('.lb-select-list-infos').text());
            if ($item.find('.lb-js-item-checkbox').is(":checked")) {
                $modalPreview.find('.lp-js-item-btn-add').hide();
                $modalPreview.find('.lp-js-item-btn-remove').show();
            } else {
                $modalPreview.find('.lp-js-item-btn-add').show();
                $modalPreview.find('.lp-js-item-btn-remove').hide();
            }

            $modalPreview.find('.lp-item-img').prop('src', $item.data("itemPreview"));
            $modalPreview.find('.lp-item-img').prop('alt', $item.data("itemName"));
            //binding
            $modalPreview.find('.lp-js-item-btn').off('click').on('click', function(e) {
                e.preventDefault();
                $item.find('.lb-js-item-checkbox').trigger('click');
                if ($item.find('.lb-js-item-checkbox').is(":checked")) {
                    $modalPreview.find('.lp-js-item-btn-add').hide();
                    $modalPreview.find('.lp-js-item-btn-remove').show();
                } else {
                    $modalPreview.find('.lp-js-item-btn-add').show();
                    $modalPreview.find('.lp-js-item-btn-remove').hide();
                }
            });
        // resize Img after loading it
            $modalPreview.find('.lp-item-img').hide();
            $modalPreview.find('.lp-item-img').load( plugin.resizeImgAction);
            $modalPreview.find('.lp-item-img').fadeIn('50');
        };
        // reset Cart
        plugin.resetCartAction = function(e) {
            e.preventDefault();
            cart = {
                'folders': {},
                'items': {}
            };
            plugin.lsSet();
            plugin.regenModalAction();
            updateCartButton();
            updateItemsInfos();
            updateFoldersInfos();
            updateTotalLength();
        };

        plugin.deleteFromCartAction = function(e) {
            e.preventDefault();
            plugin.removeFromCart($(this));
            plugin.lsSet();
            plugin.regenModalAction();
            updateCartButton();
            updateItemsInfos();
            updateFoldersInfos();
            updateTotalLength();
        };

        // SubAction
        // Add item to selection
        plugin.addToCart = function($elem) {
            var itemData = $elem.closest('.lb-js-item').data();
            cart.items[itemData.itemId] = itemData;
            if (cart.folders[itemData.itemFolderId] === undefined) {
                cart.folders[itemData.itemFolderId] = {};
            }
            cart.folders[itemData.itemFolderId][itemData.itemId] = itemData;
        };
        // Remove from selection
        plugin.removeFromCart = function($elem) {
            if ($elem.hasClass('lb-js-modal-btn-drop-item')) {
                var itemData = cart.items[$elem.data('itemId')];
            } else {
                var itemData = $elem.closest('.lb-js-item').data();
            }
            delete cart.items[itemData.itemId];
            delete cart.folders[itemData.itemFolderId][itemData.itemId];
        };

        plugin.prepareCartForTemplate = function() {
            var cft = []; //Cart For Template
            // Loop for get clean JSON for templating
            Object.keys(cart.folders).forEach(function(folderKey) {
                var tempItemsArray = [];
                var folderName = '';
                Object.keys(cart.folders[folderKey]).forEach(function(itemKey) {
                    tempItemsArray.push(cart.folders[folderKey][itemKey]);
                    folderName = cart.folders[folderKey][itemKey]['itemFolderName'];
                });
                var tmp = '{ "folderId":"' + folderKey + '","folderName":"' + folderName + '", "items":' + JSON.stringify(tempItemsArray) + ' }';

                cft.push(JSON.parse(tmp));
            });


            return JSON.parse('{"folders":' + JSON.stringify(cft) + '}');
        };

        plugin.resizeImgAction = function(e) {
            var $img = $modalPreview.find('.lp-item-img'),
                $modal = $modalPreview,
                modalHeight = $modal.height() - parseInt($img.css('marginTop')),
                modalWidth = $modal.width(),
                imgHeight = $img[0].naturalHeight,
                imgWidth = $img[0].naturalWidth,
                imgMaxHeight = modalHeight;


            //  console.log('imgMaxHeight : ' + imgMaxHeight);
            //  console.log('imgHeight : ' + imgHeight);
            //  console.log('imgWidth : ' + imgWidth);
            //  console.log('modalWidth : ' + modalWidth);
            //  console.log('modalHeight : ' + modalHeight);

             var newHeight = 0,
                 newWitdh = 0,
                 ratio = 1;

             if (imgMaxHeight < imgHeight) {
                 newHeight = imgMaxHeight;
                 ratio = imgMaxHeight / imgHeight;
                 newWidth = imgWidth * ratio;
                 // Adjust for width too large
                 if (newWidth > modalWidth) {
                     newHeight = (modalWidth / newWidth) * newHeight;
                     newWidth = modalWidth;
                 }

             } else if (imgWidth >= modalWidth) {
                 newHeight = (modalWidth / imgWidth) * imgHeight;
                 newWidth = modalWidth;
                 // Adjust for width too large
                 if (newHeight > imgMaxHeight) {
                     newWidth = (imgMaxHeight / imgHeight) * newWidth;
                     newHeightWidth = modalHeight;
                 }
             } else {
                 newWidth = imgWidth;
                 newHeight = imgHeight;
             }

            // if( imgHeight/imgWidth !== newHeight/newWidth){
            //     console.log( 'Ratio Error');
            // }

            // console.log('h/w/ ratio :'+ imgHeight + '/' + imgWidth + '  '+imgHeight/imgWidth +'| new h/w / ratio:' + newHeight +  '/' + newWidth +' /' + newHeight/newWidth );


            $img.height(newHeight);
            $img.width(newWidth);
            $img.margin = 'auto';

        };

        plugin.init();
    };
    $.fn.cxpLibrary = function(options) {
        return this.each(function() {
            if (undefined === $(this).data('cxpLibrary')) {
                var plugin = new $.cxpLibrary(this, options);
                $(this).data('cxpLibrary', plugin);
            }
        });
    };
    $('.lb-js').cxpLibrary();


    //For Filter add toggle slide

    $('.lb-js-filter').toggleSlide();


})(jQuery);
