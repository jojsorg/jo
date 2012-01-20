(function ($) {
    $.fn.badge = function (action, options) {
        // these are the default options  
        var defaults = {
            top: '-8px',
            left: '-8px',
            cssClass: 'badge'
        };
        return this.each(function () {
            var obj = $(this);
            var eleId = this.id + "-badge";
            // these are the 2 additional options  
            switch (action) {
                case 'toggle':
                    $('#' + eleId).toggle();
                    return;
                case 'hide':
                    $('#' + eleId).hide();
                    return;
            }
            // this merges the passed in settings with the default settings  
            var opts = $.extend({}, defaults, options);
            if (!$("#" + eleId).length) {
                var badge_html = "<div style='position:relative;float:left;'><div id='" + eleId + "' />8</div>";
                obj.prepend(badge_html);
            }
            var badgeEle = $('#' + eleId);
            badgeEle.addClass(opts.cssClass);
            badgeEle.show().css({
                position: 'absolute',
                left: opts.left,
                top: opts.top
            });
            return;
        });
    };
})(jQuery);

$(function () {
    $('.badges').badge();
});