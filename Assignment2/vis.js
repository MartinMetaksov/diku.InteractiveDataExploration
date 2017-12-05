d3.select(window).on('load', init);

let temperatureFormat = d3.format('0.1f');

function init() {

    plotGraphs('zurich');
    plotGraphs('st_petersburg');
}

function plotGraphs(station) {

    d3.csv(
        'data/' + station + '.csv',
        (error, data) => {
            if (error) throw error;

            plotMinMax(data, station);

            plotSeasons(data, station);
        });
}

function plotMinMax(data, station) {

    let svg = d3.select('#plot-minmax-' + station);
    if (svg.empty()) return;

    data.forEach(d => {
        let year = [+d.JAN, +d.FEB, +d.MAR, +d.APR, +d.MAY, +d.JUN,
            +d.JUL, +d.AUG, +d.SEP, +d.OCT, +d.NOV, +d.DEC];
        d.max = Math.max(...year);
        d.min = Math.min(...year);
        d.avg = year.reduce((p, c) => p + c, 0) / year.length;
        d.YEAR = +d.YEAR;
    });

    let margin = {top: 20, right: 10, bottom: 30, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.domain(data.map(d => d.YEAR));
    y.domain([d3.min(data, d => d.min), d3.max(data, d => d.max)]);

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x)
            .tickValues(d3.range(data[0].YEAR, data[data.length - 1].YEAR, 5)));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .text('Temperature, ºC');

    g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.min) - y(d.max))
        .attr('x', d => x(d.YEAR))
        .attr('y', d => y(d.max))
        .append('svg:title')
        .html(d =>
            '<span>Year: ' + d.YEAR + '</span>' +
            '<br />' +
            '<span>Min: ' + d.min + ' ºC</span>' +
            '<br />' +
            '<span>Max: ' + d.max + ' ºC</span>' +
            '<br />' +
            '<span>Avg: ' + temperatureFormat(d.avg) + ' ºC</span>'
        );


    let radius = x.bandwidth() / 2;
    g.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', radius)
        .attr('cx', d => x(d.YEAR) + radius)
        .attr('cy', d => y(d.avg));

    // Trendline: http://bl.ocks.org/benvandyke/8459843

    // get the x and y values for least squares
    let xSeries = d3.range(1, data.length + 1);
    let ySeries = data.map(d => d.avg);

    let leastSquaresCoeff = leastSquares(xSeries, ySeries);

    // apply the reults of the least squares regression
    let x1 = data[0].YEAR;
    let y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
    let x2 = data[data.length - 1].YEAR;
    let y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
    let trendData = [[x1, y1, x2, y2]];
    let decimalFormat = d3.format('0.2f');

    g.selectAll('.trendline')
        .data(trendData)
        .enter()
        .append('line')
        .attr('class', 'trendline')
        .attr('x1', d => x(d[0]))
        .attr('y1', d => y(d[1]))
        .attr('x2', d => x(d[2]) + x.bandwidth())
        .attr('y2', d => y(d[3]))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

    svg.append('text')
        .text('Trendline:')
        .attr('class', 'text-label')
        .attr('x', _ => x(x2) - 60)
        .attr('y', _ => height - 40);

    // display equation on the chart
    svg.append('text')
        .text('eq: ' + decimalFormat(leastSquaresCoeff[0]) + 'x + ' +
            decimalFormat(leastSquaresCoeff[1]))
        .attr('class', 'text-label')
        .attr('x', _ => x(x2) - 60)
        .attr('y', _ => height - 25);

    // display r-square on the chart
    svg.append('text')
        .text('r-sq: ' + decimalFormat(leastSquaresCoeff[2]))
        .attr('class', 'text-label')
        .attr('x', _ => x(x2) - 60)
        .attr('y', _ => height - 10);
}


function plotSeasons(data, station) {

    let svg = d3.select('#plot-seasons-' + station);

    if (svg.empty()) return;

    let margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let parseTime = d3.timeParse('%Y');

    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    let valueline = d3.line()
        .x(function (d) {
            return x(d.YEAR);
        })
        .y(function (d) {
            return y(d.SON);
        });

    let valueline2 = d3.line()
        .x(function (d) {
            return x(d.YEAR);
        })
        .y(function (d) {
            return y(d.JJA);
        });

    let valueline3 = d3.line()
        .x(function (d) {
            return x(d.YEAR);
        })
        .y(function (d) {
            return y(d.MAM);
        });

    let valueline4 = d3.line()
        .x(function (d) {
            return x(d.YEAR);
        })
        .y(function (d) {
            return y(d.DJF);
        });

    let legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (width - 100) + ',' + 20 + ')')
        .selectAll('g')
        .data(['DJF', 'JJA', 'MAM', 'SON'])
        .enter()
        .append('g');

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    data.forEach(function (d) {
        d.YEAR = parseTime(d.YEAR);
        d.SON = +d.SON;
        d.JJA = +d.JJA;
        d.MAM = +d.MAM;
        d.DJF = +d.DJF;
    });

    x.domain(d3.extent(data, function (d) {
        return d.YEAR;
    }));
    y.domain([d3.min(data, function (d) {
        return Math.min(d.DJF, d.MAM, d.JJA, d.SON);
    }),
        d3.max(data, function (d) {
            return Math.max(d.DJF, d.MAM, d.JJA, d.SON);
        })]);

    g.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', valueline);

    g.append('path')
        .data([data])
        .attr('class', 'line')
        .style('stroke', 'red')
        .attr('d', valueline2);

    g.append('path')
        .data([data])
        .attr('class', 'line')
        .style('stroke', 'orange')
        .attr('d', valueline3);

    g.append('path')
        .data([data])
        .attr('class', 'line')
        .style('stroke', 'green')
        .attr('d', valueline4);

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .text('Temperature, ºC');

    legend.append('circle')
        .attr('cy', function (d, i) {
            return i * 14;
        })
        .attr('cx', -10)
        .attr('r', 5)
        .attr('fill', function (d) {
            if (d === 'DJF')
                return 'blue';
            else if (d === 'MAM')
                return 'red';
            else if (d === 'JJA')
                return 'orange';
            else
                return 'green'
        });

    legend.append('text')
        .attr('y', function (d, i) {
            return i * 16;
        })
        .attr('x', -200)
        .text(function (d) {
            if (d === 'DJF')
                return 'December - January - February';
            else if (d === 'MAM')
                return 'March - April - May';
            else if (d === 'JJA')
                return 'Jun - July - August';
            else
                return 'September - October - November'
        });
}

// returns slope, intercept and r-square of the line
// http://bl.ocks.org/benvandyke/8459843
function leastSquares(xSeries, ySeries) {
    let reduceSumFunc = function (prev, cur) {
        return prev + cur;
    };

    let xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    let yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    let ssXX = xSeries.map(function (d) {
        return Math.pow(d - xBar, 2);
    })
        .reduce(reduceSumFunc);

    let ssYY = ySeries.map(function (d) {
        return Math.pow(d - yBar, 2);
    })
        .reduce(reduceSumFunc);

    let ssXY = xSeries.map(function (d, i) {
        return (d - xBar) * (ySeries[i] - yBar);
    })
        .reduce(reduceSumFunc);

    let slope = ssXY / ssXX;
    let intercept = yBar - (xBar * slope);
    let rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return [slope, intercept, rSquare];
}
