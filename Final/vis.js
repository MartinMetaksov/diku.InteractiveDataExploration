d3.select(window).on('load', loadData);

$(document).ready(function() {
    $(window).scroll($.debounce( 250, true, function(){
        $('#ufo-image').attr('src', 'ufos/ufo_flying.svg');
    }));
    $(window).scroll($.debounce( 250, function(){
        $('#ufo-image').attr('src', 'ufos/ufo_abduct.svg');
    }));
});

function loadData() {
    // d3.json('data/sfpd_crime.topojson', (error, data) => {
    //     if (error) throw error;
    //     init(data);
    // });
}

function init(data) {
    console.log('add final assignment here :D');
}