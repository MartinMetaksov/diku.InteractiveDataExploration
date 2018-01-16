d3.select(window).on('load', init);

let ufoData,
    cfData,
    startDate = moment('12/10/2013'),
    endDate = moment('01/01/2014'),
    currentMoment,
    totalDuration,
    interval,
    datetimeDimension,
    monthLetter = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayLetter = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


function init() {
    plotVisualizations('scrubbed');
}

function plotVisualizations(db) {
    d3.csv(
        'data/' + db + '.csv',
        (error, data) => {
            if (error) throw error;

            // Data cleanup
            data.forEach(d => {
                d.dt = new Date(d.dt);
                d.year = d.dt.getFullYear();
                d.month = monthLetter[d.dt.getMonth()];
                d.day = dayLetter[d.dt.getDay()];
                d.duration_sec = +d.duration_sec || 0;
                d.city = d.city.capitalize();
                d.state = d.state.length <= 3 ? d.state.toUpperCase() : d.state.capitalize();
                d.country = d.country.length <= 3 ? d.country.toUpperCase() : d.country.capitalize();
                d.latitude = +d.latitude;
                d.longitude = +d.longitude;
            });
            ufoData = data.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude) && d.latitude !== 0 && d.longitude !== 0);

            cfData = crossfilter(data); // crossfilter - when data sizes are huge - http://square.github.io/crossfilter/
            datetimeDimension = cfData.dimension(d => d.dt);


            initMap(ufoData);
            plotUfos();
        });
}

function plotUfos() {
    switch ($("#plot-selector").val()) {
        case "country":
            plotUfosByCountry(ufoData);
            break;
        case "year":
            plotUfosByYear(ufoData);
            break;
        case "month":
            plotUfosByMonth(ufoData);
            break;
        case "day":
            plotUfosByDay(ufoData);
            break;
        default:
            plotUfosByShape(ufoData);
    }
}

function plotUfosByShape(data) {

    d3.select("#plot-ufos-title").html("UFOs by shape");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = {};

    data.forEach(d => {
        if (!counts[d.shape]) {
            counts[d.shape] = 0;
        }
        counts[d.shape]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            shape: key,
            count: counts[key]
        });
    });

    dataObj.forEach(d => {
        d.count = +d.count;
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => d.shape));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, d => d.count)]).nice();

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

    let colors = d3.scaleOrdinal(d3.schemeCategory10);
    let tooltip = d3.select('body').append('div').attr('class', 'toolTip');

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.shape))
        .attr('y', height)
        .on('mousemove', d => {
            tooltip
                .style('left', d3.event.pageX - 50 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .style('display', 'inline-block')
                .html((d.shape) + '<br>' + (d.count) + ' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .style('fill', (d, i) => colors(i))
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .style('fill', (d, i) => colors(i));
}

function plotUfosByCountry(data) {

    d3.select("#plot-ufos-title").html("UFOs by country");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = {};

    data.forEach(d => {
        switch (d.country) {
            case ("AU" || "Australia"):
                d.country = "Australia";
                break;
            case ("DE" || "Germany"):
                d.country = "Germany";
                break;
            case ("CA" || "Canada"):
                d.country = "Canada";
                break;
            case ("GB" || "Great Britain"):
                d.country = "Great Britain";
                break;
            case ("US" || "United States"):
                d.country = "United States";
                break;
            case (""):
                d.country = "N/A";
                break;
            default:
                break;
        }
        if (!counts[d.country]) {
            counts[d.country] = 0;
        }
        counts[d.country]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            country: key,
            count: counts[key]
        });
    });

    dataObj.forEach(d => {
        //d.state = d.state.toUpperCase();
        d.count = +d.count;
    });

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
        g.selectAll('.tick text').attr('x', -20).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let colors = d3.scaleOrdinal(d3.schemeCategory20);
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
                .html((d.country) + '<br>' + (d.count) + ' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .style('fill', (d, i) => colors(i))
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));
}


function plotUfosByYear(data) {

    d3.select("#plot-ufos-title").html("UFOs by year");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = {};

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
        g.selectAll('.tick text').attr('x', -20).attr('dy', -4);
    }

    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(customXAxis);

    g.append('g')
        .call(customYAxis);

    let colorScale = d3.scaleQuantile()
        .domain([0, d3.max(dataObj, d => d.count)])
        .range(d3.schemeCategory20);
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
                .html((d.dt) + '<br>' + (d.count) + ' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .style("fill", (d,i) => colorScale(d.count));
}

function plotUfosByMonth(data) {

    d3.select("#plot-ufos-title").html("UFOs by month");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = {};

    data.forEach(d => {
        if (!counts[d.month]) {
            counts[d.month] = 0;
        }
        counts[d.month]++;
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
        g.selectAll('.tick text').attr('transform', 'rotate(0)').attr('y', 6).attr('dy', '1.9em').attr('dx', '0em');
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

    let colorScale = d3.scaleQuantile()
        .domain([0, d3.max(dataObj, d => d.count)])
        .range(d3.schemeCategory10);
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
                .html((d.dt) + '<br>' + (d.count) + ' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .style("fill", (d,i) => colorScale(d.count));
}

function plotUfosByDay(data) {

    d3.select("#plot-ufos-title").html("UFOs by day");

    let svg = d3.select('#plot-ufos');
    svg.selectAll("*").remove();

    let counts = {};

    data.forEach(d => {
        if (!counts[d.day]) {
            counts[d.day] = 0;
        }
        counts[d.day]++;
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
        g.selectAll('.tick text').attr('transform', 'rotate(0)').attr('y', 6).attr('dy', '1.9em').attr('dx', '0em');
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

    let colorScale = d3.scaleQuantile()
        .domain([0, d3.max(dataObj, d => d.count)])
        .range(d3.schemeCategory20);
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
                .html((d.dt) + '<br>' + (d.count) + ' UFOs');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        })
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .duration(200)
        .delay((d,i) => i * 50)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .style("fill", (d,i) => colorScale(d.count));
}



// Source: http://techslides.com/d3-map-starter-kit
function initMap(data) {

    d3.select(window).on('resize', throttle);

    let shapes = getUniqueShapes(data);

    let shapeColor = d3.scaleOrdinal(d3.schemeCategory10);

    drawMapLegend();

    let zoom = d3.zoom()
        .scaleExtent([1, 9])
        .on('zoom', move);

    let c = document.getElementById('map-container');
    let width = c.offsetWidth;
    let height = width / 2;

    //offsets for tooltips
    let offsetL = c.offsetLeft + 20;
    let offsetT = c.offsetTop + 10;

    let topo, projection, path, svg, g, centerTransform;

    let tooltip = d3.select('#map-container').append('div').attr('class', 'tooltip hidden');

    setup(width, height);

    function getUniqueShapes(data) {
        let x = Array.from(new Set(data.map(d => d.shape)));
        x.splice(x.indexOf(""), 1);
        return x;
    }

    function drawMapLegend() {
        let g = d3.select('#map-legend')
            .attr('height', 500);
        let dg = g.selectAll('circle')
            .data(shapes).enter();

        dg.append('circle')
            .attr('cx', (_, i) => i%2 === 0 ? 100 : 10)
            .attr('cy', (_, i) => i%2 === 0 ? 15 * (i-1) + 10 : 15 * i + 10)
            .attr('r', 5)
            .style('fill', (_, i) => shapeColor(i));

        dg.append('text')
            .attr('class', 'map-legend-text')
            .attr('x', (_, i) => i%2 === 0 ? 110 : 20)
            .attr('y', (_, i) => i%2 === 0 ? 15 * (i-1) + 13 : 15 * i + 13)
            .text(d => d);
    }

    function setup(width, height) {
        projection = d3.geoMercator()
            .translate([(width / 2), (height / 2)])
            .scale(width / 2 / Math.PI);

        path = d3.geoPath().projection(projection);

        svg = d3.select('#map-container').append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(zoom)
            .on('dblclick.zoom', null);

        g = svg.append('g');
    }

    d3.json('data/world-topo-min.json', (error, world) => {

        topo = topojson.feature(world, world.objects.countries).features;

        draw(topo);

    });

    function handleMouseOver(text) {
        let mouse = d3.mouse(svg.node()).map(d => parseInt(d));

        tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + offsetL) + 'px;top:' + (mouse[1] + offsetT) + 'px')
            .html(text);
    }

    function handleMouseOut() {
        tooltip.classed('hidden', true);
    }

    function draw(topo) {

        let country = g.selectAll('.country').data(topo);

        country.enter().insert('path')
            .attr('class', 'country')
            .attr('d', path)
            .attr('id', d => d.id)
            .attr('title', d => d.properties.name)
            .on('mouseover', d => handleMouseOver(d.properties.name))
            .on('mouseout', handleMouseOut)
            .on('click', clicked);

        // Center the map (Chad works fine)
        let chad = topo.find(d => d.id === 213),
            bounds = path.bounds(chad),
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            translate = [width / 2 - x, height / 2 - y];

        centerTransform = d3.zoomIdentity.translate(translate[0],translate[1]).scale(1);

        svg.transition().call(zoom.transform, centerTransform);

        addPoints(data.slice(0, 100));
    }

    function redraw() {
        width = c.offsetWidth;
        height = width / 2;
        d3.select('svg').remove();
        setup(width, height);
        draw(topo);
    }

    function move() {

        let t = [d3.event.transform.x, d3.event.transform.y];

        let s = d3.event.transform.k;
        zscale = s;
        let h = height / 4;

        t[0] = Math.min(
            (width / height) * (s - 1),
            Math.max(width * (1 - s), t[0])
        );

        t[1] = Math.min(
            h * (s - 1) + h * s,
            Math.max(height * (1 - s) - h * s, t[1])
        );

        g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

        //adjust the country hover stroke width based on zoom level
        d3.selectAll('.country').style('stroke-width', .5 / s);

    }

    let throttleTimer;

    function throttle() {
        window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(() => {
            redraw();
        }, 200);
    }


    // Country zoom and center
    // source: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    let active = d3.select(null);

    function clicked(d) {
        if (active.node() === this) return reset();
        active.classed('active', false);
        active = d3.select(this).classed('active', true);

        let bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
    }

    function reset() {
        active.classed('active', false);
        active = d3.select(null);

        svg.transition()
            .duration(750)
            .call(zoom.transform, centerTransform);
    }

    function addPoints(data) {

        let scaleDuration = d3.scaleLinear()
            .domain([0, 1000])
            .range([1, 3])
            .clamp(true);

        g.selectAll('.gpoint')
            .transition()
            .duration(50)
            .style('opacity', 0.0)
            .remove();

        g.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'gpoint')
            .append('svg:circle')
            .attr('cx', d => projection([d.longitude, d.latitude])[0])
            .attr('cy', d => projection([d.longitude, d.latitude])[1])
            .attr('r', d => scaleDuration(d.duration_sec))
            .style('fill', d => d.shape === "" ? shapeColor(shapes.indexOf("unknown")) : shapeColor(shapes.indexOf(d.shape)))
            .on('mouseover', d => handleMouseOver(d.dt.toLocaleString() + '<br />' + d.city
                + (d.state ? ', ' : '') + d.state + (d.country ? ', ' : '') + d.country + '<br />' + d.comments))
            .on('mouseout', handleMouseOut)
            .style('opacity', 0.0)
            .transition()
            .duration(100)
            .style('opacity', 1.0)
    }

}

String.prototype.capitalize = function(){
    return this.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

/*
 * Timeline related functions
 */

$(function () {
    $('#dtpicker-start, #dtpicker-end').datetimepicker({
        viewMode: 'years',
        format: 'DD/MM/YYYY',
        minDate: '1940/01/01',
        maxDate: '2014/01/01',
        useCurrent: false,
    });

    $('#dtpicker-start').data('DateTimePicker').defaultDate(startDate);
    $('#dtpicker-end').data('DateTimePicker').defaultDate(endDate);

    $('#dtpicker-start').on('dp.change', function(e) {
        startDate = e.date;
        resetProgressBar();
        $('#dtpicker-end').data("DateTimePicker").minDate(e.date.clone().add(1, 'days'));
    });

    $('#dtpicker-end').on('dp.change', function(e) {
        endDate = e.date;
        resetProgressBar();
    });

});

function getPercByMoment() {
    return Number((currentMoment / totalDuration) * 100).toFixed(2);
}

function getMomentByPerc(perc) {
    return Number((perc * totalDuration) / 100).toFixed(0);
}

function validateDates() {
    return startDate && endDate;
}

function getBarWidthInPerc(bar) {
    return $(bar).width() / $(bar).parent().width() * 100;
}

$(document).ready(function() {
    $('.play-pause-icon').on('click', function() {
        if (!validateDates()) {
            alert('You need to choose both a start and an end date');
            return;
        }
        if ($(this).attr('src').includes('play')) {
            totalDuration = endDate.diff(startDate, 'days');
            currentMoment = 0;
            play();
        } else {
            pause();
        }
    });

    let tlHover = $('.tl-hover');
    tlHover.on('mousemove', function(e) {
        let t = $('.timeline'),
            mouse = e.pageX - t.offset().left,
            p = t.parent().width(),
            m = mouse / p * 100;
        $('.timeline-progress-hover').show().css({marginLeft: m + '%'});
    });

    tlHover.on('mouseleave', function() {
        $('.timeline-progress-hover').hide();
    });

    tlHover.on('click', function(e) {
        if (!validateDates()) {
            alert('You need to choose both a start and an end date');
            return;
        }
        let t = $('.timeline'),
            mouse = e.pageX - t.offset().left,
            p = t.parent().width(),
            m = mouse / p * 100,
            playing = $('.play-pause-icon').attr('src').includes('pause');
        pause();
        setProgressBar(m);
        currentMoment = getMomentByPerc(m);
        totalDuration = endDate.diff(startDate, 'days');
        $('.progress-indicator').text(startDate.clone().add(currentMoment, 'days').format("DD/MM/YYYY"));
        if (playing) {
            play();
        }
    });

    $(document).keypress(function(e) {
        if (e.which === 115) {
            $('.play-pause-icon').click();
        }
    });
});

function resetProgressBar() {
    pause();
    currentMoment = undefined;
    totalDuration = undefined;
    $('.progress-indicator').text(startDate.clone().format("DD/MM/YYYY"));
    setProgressBar(0.0);
}

// distance must be in %
function setProgressBar(distance) {
    $('.timeline-progress').width(distance + '%');
    $('.progress-indicator').css({paddingLeft: distance + '%'});
}


function getAndDisplaySightings() {
    let date = startDate.clone().add(currentMoment, 'days');
    let cfDayData;
    cfDayData = datetimeDimension.filterAll().filter(dt => moment(dt).isSame(date, 'day')).top(Infinity);

    
}

function play() {
    $('.play-pause-icon').attr('src', 'img/pause.svg');
    let bar = $('.timeline-progress')[0];
    let cWidth = getBarWidthInPerc(bar);

    interval = setInterval(function() {
        cWidth = Number(getPercByMoment());
        if (cWidth >= 100) {
            cWidth = 100;
        }
        getAndDisplaySightings();
        $('.progress-indicator').text(startDate.clone().add(currentMoment, 'days').format("DD/MM/YYYY"));
        if (cWidth === 100) {
            $('.play-pause-icon').attr('src', 'img/play.svg');
            clearInterval(interval);
            interval = undefined;
        }
        setProgressBar(cWidth);
        currentMoment++;
    }, 300)
}


function pause() {
    $('.play-pause-icon').attr('src', 'img/play.svg');
    if (interval) {
        clearInterval(interval);
        interval = undefined;
    }
}