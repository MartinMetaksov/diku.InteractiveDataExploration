let monthLetter = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayLetter = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function plotUfos(category) {

    switch (category) {
        case "countries":
            plotUfosByCountry(ufoData);
            break;
        case "years":
            plotUfosByYear(ufoData);
            break;
        case "months":
            plotUfosByMonth(ufoData);
            break;
        case "days":
            plotUfosByDay(ufoData);
            break;
        default:
            plotUfosByShape(shapes);
    }
}

function plotUfosByShape(data) {

    d3.select("#plot-ufos-title").html("UFOs by shape");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(data.map(d => d.shape));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.count)]).nice();

    let xAxis = d3.axisBottom(x);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function (d) {
            return this.parentNode.nextSibling
                ? '\xa0' + d
                : d + ' count';
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('.tick text').attr('transform', 'rotate(-80)').attr('y', 6).attr('dy', '-0.1em').attr('dx', '-3.0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select('.domain').remove();
        g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#000000').attr('stroke-dasharray', '2,2');
        g.selectAll('.tick text').attr('x', -20).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.shape))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.shape) + '<br>' + (d.count) + ' ('+ ((d.count/80332)*100).toFixed(0) + '%) UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .style('fill', (d, i) => shapeColor(i))
        .attr('height', 0)
        .transition()
        .duration(500)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}

function plotUfosByCountry(data) {

    d3.select("#plot-ufos-title").html("UFOs by country");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = [];

    data.forEach(d => {
        if (d.country) {
            if (!counts[d.country]) {
                counts[d.country] = 0;
            }
            counts[d.country]++;
        }
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            country: key,
            count: counts[key]
        });
    });
    dataObj.sort((a, b) => b.count - a.count);
    dataObj.length = 10;

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => d.country));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, d => d.count)]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.datetime);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function (d) {
            return this.parentNode.nextSibling
                ? '\xa0' + d
                : d + ' count';
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('.tick text').attr('transform', 'rotate(0)').attr('y', 6).attr('dy', '1.9em').attr('dx', '0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select('.domain').remove();
        g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#000000').attr('stroke-dasharray', '2,2');
        g.selectAll('.tick text').attr('x', -30).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.country) + '<br>' + (d.count) + ' ' +'('+ ((d.count/80332)*100).toFixed(0) + '%)' +' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .style('fill', () => '#006d2c')
        .attr('height', 0)
        .transition()
        .duration(500)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}

function plotUfosByYear(data) {

    d3.select("#plot-ufos-title").html("UFOs by year");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = [];

    data.forEach(d => {
        if (!counts[d.year]) {
            counts[d.year] = 0;
        }
        counts[d.year]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            dt: key,
            count: counts[key]
        });
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => d.dt));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, d => d.count)]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.dt);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function (d) {
            return this.parentNode.nextSibling
                ? '\xa0' + d
                : d + ' count';
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('.tick text').attr('transform', 'rotate(-80)').attr('y', 6).attr('dy', '-0.1em').attr('dx', '-2.0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select('.domain').remove();
        g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#000000').attr('stroke-dasharray', '2,2');
        g.selectAll('.tick text').attr('x', -30).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.dt))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.dt) + '<br>' + (d.count) + ' ' +'('+ ((d.count/80332)*100).toFixed(0) + '%)' +' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .style("fill", () => '#006d2c')
        .transition()
        .duration(500)
        .delay((d,i) => i * 25)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}

function plotUfosByMonth(data) {

    d3.select("#plot-ufos-title").html("UFOs by month");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = [];

    data.forEach(d => {
        if (!counts[d.month]) {
            counts[d.month] = 0;
        }
        counts[d.month]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            dt: monthLetter[key],
            count: counts[key]
        });
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => d.dt));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, d => d.count)]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.dt);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function (d) {
            return this.parentNode.nextSibling
                ? '\xa0' + d
                : d + ' count';
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('.tick text').attr('transform', 'rotate(0)').attr('y', 6).attr('dy', '1.9em').attr('dx', '0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select('.domain').remove();
        g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#000000').attr('stroke-dasharray', '2,2');
        g.selectAll('.tick text').attr('x', -30).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.dt))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.dt) + '<br>' + (d.count) + ' ('+ ((d.count/80332)*100).toFixed(0) + '%) UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .style("fill", () => '#006d2c')
        .transition()
        .duration(500)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}

function plotUfosByDay(data) {

    d3.select("#plot-ufos-title").html("UFOs by day");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = [];

    data.forEach(d => {
        if (!counts[d.day]) {
            counts[d.day] = 0;
        }
        counts[d.day]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            dt: dayLetter[key],
            count: counts[key]
        });
    });

    // Put Sunday were it belongs, stupid Americans...
    dataObj.push(dataObj.shift());

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => d.dt));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, d => d.count)]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.dt);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function (d) {
            return this.parentNode.nextSibling
                ? '\xa0' + d
                : d + ' count';
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select('.domain').remove();
        g.selectAll('.tick text').attr('transform', 'rotate(0)').attr('y', 6).attr('dy', '1.9em').attr('dx', '0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select('.domain').remove();
        g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#000000').attr('stroke-dasharray', '2,2');
        g.selectAll('.tick text').attr('x', -30).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.dt))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.dt) + '<br>' + (d.count) + ' ' +'('+ ((d.count/80332)*100).toFixed(0) + '%)' +' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .style("fill", () => '#006d2c')
        .transition()
        .duration(500)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}
