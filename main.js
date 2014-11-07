$('.tiles.activable > div').click(function(e) {
    var had = $(this).hasClass('active');
    $(this).parent().children().removeClass('active');
    if (!had)
        $(this).addClass('active');
    onResize();
});

var calculationFuncs = {
    npm: function($el) {
        $el = $($el);
        $el.height($el.width() * 0.39);
    },
    square: function($el) {
        $el = $($el);
        $el.height($el.width());
    },
    php: function($el) {
        $el = $($el);
        $el.height($el.width()*(300/159));
    }
}
function onResize(){
    $('*[data-calculated-size]').each(function(index,el){
        calculationFuncs[$(el).attr('data-calculated-size')](el);
    });
}
$(window).resize(onResize);
onResize();
