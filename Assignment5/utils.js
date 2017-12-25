// $(document).ready(function(){
//
//     /* Tooltips */
//     let absTooltip = $('.abs-tooltip');
//     absTooltip.on('mousemove', function(e) {
//         let tar = e.target.id,
//             id = tar.substring(tar.lastIndexOf('-')+1, tar.length);
//
//             $('[data-toggle="tooltip-' + id + '"]').tooltip('show');
//         setTimeout(function() {
//             $("[id^=tooltip]").css({top: e.pageY, left: e.pageX});
//         }, 0.00001);
//
//
//     });
//
//     absTooltip.on('mouseleave', function(e) {
//         let tar = e.target.id,
//             id = tar.substring(tar.lastIndexOf('-')+1, tar.length);
//
//         $('[data-toggle="tooltip-' + id + '"]').tooltip('hide');
//     });
//
// });