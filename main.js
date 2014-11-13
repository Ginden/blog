$('.tiles.activable > div').click(function(e) {
    var had = $(this).hasClass('active');
    console.log(e);
    if (e.target.nodeName !== 'A') {
        $(this).parent().children().removeClass('active');
        if (!had)
            $(this).addClass('active');
    }
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

$('.projects > div').each(function(i,$el) {
    $el = $($el);
    $el.append(
        $('<a class="github-fork" data-calculated-size="square" />')
            .attr('href', 'https://github.com/'+$el.attr('data-href'))
   );
})
onResize();