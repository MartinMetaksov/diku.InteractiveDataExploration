
d3.select(window).on('load', init);

function init() {

    let svg = d3.select('#plot-zurich'),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv(
        'data/zurich.csv',
        (error, data) => {
            if (error) throw error;

            x.domain(data.map(d => d.YEAR));
            y.domain([d3.min(data, d => d.min), d3.max(data, d => d.max)]);

            g.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(x)
                        .tickValues(d3.range(data[0].YEAR, data[data.length - 1].YEAR, 10)));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .text("Temperature, ºC");

            g.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('width', x.bandwidth())
                .attr('height', d => y(d.min) - y(d.max))
                .attr('x', d => x(d.YEAR))
                .attr('y', d => y(d.max));


            let radius = x.bandwidth() / 2;
            g.selectAll('.point')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'point')
                .attr('r', radius)
                .attr('cx', d => x(d.YEAR) + radius)
                .attr('cy', d => y(d.avg));

        })
        .row(d => {
            let year = [+d.JAN, +d.FEB, +d.MAR, +d.APR, +d.MAY, +d.JUN,
                        +d.JUL, +d.AUG, +d.SEP, +d.OCT, +d.NOV, +d.DEC];
            d.max = Math.max(...year);
            d.min = Math.min(...year);
            d.avg = year.reduce( ( p, c ) => p + c, 0 ) / year.length;
            console.log(d.avg);
            return d;
        });
}
