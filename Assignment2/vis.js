
d3.select(window).on('load', init);

function init() {

    d3.csv(
        'data/zurich.csv',
        (error, data) => {
            if (error) throw error;

            d3.select('body')
                .append('ul')
                .selectAll('li')
                .data(data)
                .enter()
                .append('li')
                .text(d => 'JAN ' + d.YEAR + ': ' + d.JAN + ' °C');
        });
}
