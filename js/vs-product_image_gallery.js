/*
    FIXME: Backward compatibility
    We combined two scrollers here. Now all themes (4.0 & 4.1) work good.
*/

(function(_, $) {

    var ITEMS_COUNT_DEFAULT = 3;
    var scroller_type = 'owlcarousel'; // can be 'owlcarousel' or 'jcarousel'

    var methods = {
        init: function() {
            var container = $(this);
            var params = {
                items_count: container.data('caItemsCount') ? container.data('caItemsCount') : ITEMS_COUNT_DEFAULT,
                items_responsive: container.data('caItemsResponsive') ? true : false
            };

            if (container.hasClass('jcarousel-skin') || container.parent().hasClass('jcarousel-skin')) {
                scroller_type = 'jcarousel';
            } else {
                scroller_type = 'owlcarousel';
            }

            if (methods.countElms(container) > params.items_count || (container.hasClass('jcarousel-skin') && methods.countElms(container) > params.items_count)) {
                if (container.data('owl-carousel') || container.data('jcarousel')) {
                    return true;
                }

                methods.check(container, params);
            }
            
            methods.bind(container);

            return true;
        },

        load: function(container, params) {
            if (scroller_type == 'owlcarousel') {
                if (_.language_direction == "rtl"){
                    et_navigationText=['<i class="icon-right-open-thin ty-icon-right-open-thin"></i>', '<i class="icon-left-open-thin ty-icon-left-open-thin"></i>'];
                }else{
                    et_navigationText=['<i class="icon-left-open-thin ty-icon-left-open-thin"></i>', '<i class="icon-right-open-thin ty-icon-right-open-thin"></i>'];
                }
                container.owlCarousel({
                    // items: params.items_count,
                    direction: _.language_direction,
                    singleItem: params.items_count == 1 ? true : false,
                    // responsive: params.items_responsive,
                    items: 5,
                    itemsDesktop: [1247, 3],
                    itemsDesktopSmall: [1007, 4],
                    itemsTablet: [768, 5],
                    itemsMobile: [479, 3],
                    pagination: false,
                    navigation: true,
                    navigationText: params.items_count == 1 ? ['<i class="icon-left-circle ty-icon-left-circle"></i>', '<i class="icon-right-circle ty-icon-right-circle"></i>'] : et_navigationText,
                    theme: params.items_count == 1 ? 'owl-one-theme' : 'owl-more-theme',
                    beforeInit:function(){
                        var containerW=$(".product-main-info").width();
                        var infoW=$('.product-info').width();
                        var galleryW=containerW-infoW-89;

                        $(".cm-image-gallery-wrapper").css('width',galleryW);
                    },
                    afterInit: function(item) {
                        $(item).css({'visibility':'visible', 'position':'relative'});

                        var containerW=$(".product-main-info").width();
                        var infoW=$('.product-info').width();
                        var galleryW=containerW-infoW-89;

                        $(".cm-image-gallery-wrapper").css('width',galleryW);
                    }
                });
            } else {
                $('li', container).show();
                container.jcarousel({
                    scroll: 1,
                    wrap: 'circular',
                    animation: 'fast',
                    initCallback: $.ceScrollerMethods.init_callback,
                    itemFallbackDimension: params.i_width,
                    item_width: params.i_width,
                    item_height: params.i_height,
                    clip_width: params.c_width,
                    clip_height: params.i_height,
                    buttonNextHTML: '<div><i class="icon-right-open-thin ty-icon-right-open-thin"></i></div>',
                    buttonPrevHTML: '<div><i class="icon-left-open-thin ty-icon-left-open-thin"></i></div>',
                    buttonNextEvent: 'click',
                    buttonPrevEvent: 'click',
                    size: methods.countElms(container)
                });
            }
        },

        check: function(container, params) {
            if (container.data('owl-carousel') || container.data('jcarousel')) {
                return true;
            }
        
            if (!params.i_width || !params.i_height) {
                var t_elm = false;

                if ($('.cm-gallery-item', container).length) {
                    var load = false;

                    // check images are loaded
                    $('.cm-gallery-item', container).each(function() {
                        var elm = $(this);
                        var i_elm = $('img', elm);

                        if (i_elm.length) {
                            if (elm.outerWidth() >= i_elm.width()) {
                                // find first loaded image
                                t_elm = elm;
                                return false;
                            }
                            load = true;
                        }
                    });
                    if (!t_elm) {
                        if (load) {
                            var check_load = function() {
                                methods.check(container, params);
                            }
                            // wait until image is loaded
                            setTimeout(check_load, 500);
                            return false;
                        } else {
                            t_elm = $('.cm-gallery-item:first', container);
                        }
                    }
                } else {
                    t_elm = $('img:first', container);
                }

                params.i_width = t_elm.outerWidth(true);
                params.i_height = t_elm.outerHeight(true);
                params.c_width = params.i_width * params.items_count;

                if (scroller_type == 'owlcarousel') {
                    container.closest('.cm-image-gallery-wrapper').width(params.c_width);
                }
            }

            return methods.load(container, params);
        },

        bind: function(container) {
            container.click(function(e) {
                var jelm = $(e.target);
                var pjelm;

                // Check elm clicking
                if (scroller_type == 'owlcarousel') {
                    var in_elm = jelm.parents('.cm-item-gallery') || jelm.parents('div.cm-thumbnails-mini') ? true : false;
                } else {
                    var in_elm = jelm.parents('li') || jelm.parents('div.cm-thumbnails-mini') ? true : false;
                }
                
                if (in_elm && !jelm.is('img')) { // Check if the object is image or SWF embed object or parent is SWF-container
                    return false;
                }

                if (jelm.hasClass('cm-thumbnails-mini') || (pjelm = jelm.parents('a:first.cm-thumbnails-mini'))) {
                    jelm = (pjelm && pjelm.length) ? pjelm : jelm;

                    if (scroller_type == 'owlcarousel') {
                        var image_box = $('.cm-preview-wrapper:first');
                    } else {
                        var jc_box = $(this).parents('.jcarousel-skin:first');
                        var image_box = (jc_box.length) ? jc_box.parents(':first') : $(this).parents(':first');
                    }

                    $(image_box).trigger('owl.goTo', $(jelm).data('caImageOrder') || 0);
                }
            });
        },

        countElms: function(container) {
            if (scroller_type == 'owlcarousel') {
                return $('.cm-gallery-item', container).length;
            } else {
                return $('li', container).length;
            }
        }
    };

    $.fn.ceProductImageGallery = function(method) {

        if (!$().owlCarousel) {
            var gelms = $(this);
            $.getScript('design/themes/vivashop/js/owl.carousel.min.js', function() {
                gelms.ceProductImageGallery();
            });
            return false;
        }

        if (!$().jcarousel) {
            var gelms = $(this);
            $.getScript('js/lib/jcarousel/jquery.jcarousel.js', function() {
                gelms.ceProductImageGallery();
            });
            return false;
        }

        return $(this).each(function(i, elm) {

            // These vars are local for each element
            var errors = {};

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if ( typeof method === 'object' || ! method ) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('ty.productimagegallery: method ' +  method + ' does not exist');
            }
        });
    };
})(Tygh, Tygh.$);


(function(_, $) {
    $.ceEvent('on', 'ce.commoninit', function (context) {
        $('.cm-preview-wrapper', context).owlCarousel({
            direction: _.language_direction,
            pagination: false,
            singleItem: true,
            addClassActive: true,
            afterInit: function (item) {
                var thumbnails = $('.cm-thumbnails-mini', item.parents('.et-image-wrapper')),
                    previewers = $('.cm-image-previewer', item.parents('.et-image-wrapper'));

                previewers.each(function (index, elm) {
                    $(elm).data('caImageOrder', index);
                });

                thumbnails.on('click', function () {
                    item.trigger('owl.goTo', $(this).data('caImageOrder') ? $(this).data('caImageOrder') : 0);
                });

                $('.cm-image-previewer.hidden', item).toggleClass('hidden', false);

                $.ceEvent('trigger', 'ce.product_image_gallery.ready');
            },
            afterMove: function (item) {
                var _parent = item.parents(".et-image-wrapper");

                // inactive all thumbnails
                $('.cm-thumbnails-mini', _parent)
                    .toggleClass('active', false);

                // active only current thumbnail
                var elmOrderInGallery = $('.active', item).index(); // order of active image in carousel
                $('[data-ca-image-order=' + elmOrderInGallery + ']', _parent)
                    .toggleClass('active', true);

                // move mini-thumbnail-gallery
                $('.owl-carousel.cm-image-gallery', _parent)
                    .trigger('owl.goTo', elmOrderInGallery);

                $.ceEvent('trigger', 'ce.product_image_gallery.image_changed');
            }
        });
    });
})(Tygh, Tygh.$);
