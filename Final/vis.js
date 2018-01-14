d3.select(window).on('load', init);

function init() {
    plotVisualizations('scrubbed');
}

function plotVisualizations(db) {

    d3.csv(
        'data/' + db + '.csv',
        (error, data) => {
            if (error) throw error;

            initMap(data);
            plotUfosByShape(data);
            plotUfosByState(data);
            plotUfosByYear(data);
        });
}

function plotUfosByShape(data) {

    let svg = d3.select('#plot-1');

    if (svg.empty()) return;

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
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
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
        .style('fill', (d, i) => colors(i));
}

function plotUfosByState(data) {
    let svg = d3.select('#plot-2');

    if (svg.empty()) return;

    let counts = {};

    data.forEach(d => {
        if (!counts[d.state]) {
            counts[d.state] = 0;
        }
        counts[d.state]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            state: key,
            count: counts[key]
        });
    });

    dataObj.forEach(d => {
        d.state = d.state.toUpperCase();
        d.count = +d.count;
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(d => (d.state)));

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
        g.selectAll('.tick text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '-0.1em').attr('dx', '-1.5em');
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

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.state))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
        .style('fill', (d, i) => colors(i));
}

function plotUfosByYear(data) {
    let svg = d3.select('#plot-3');

    if (svg.empty()) return;

    let counts = {};

    data.forEach(d => {
        d.datetime = new Date(d.datetime).getFullYear();

        if (!counts[d.datetime]) {
            counts[d.datetime] = 0;
        }
        counts[d.datetime]++;
    });

    let dataObj = [];

    Object.keys(counts).forEach(key => {
        dataObj.push({
            datetime: key,
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
        .domain(dataObj.map(d => d.datetime));

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

    g.selectAll('.bar')
        .data(dataObj)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.datetime))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
}

// Source: http://techslides.com/d3-map-starter-kit
function initMap(data) {

    d3.select(window).on('resize', throttle);

    let shapes = getUniqueShapes(data);

    let shapeColor = d3.scaleOrdinal(d3.schemeCategory20c);

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

    function handleMouseOver() {
        let mouse = d3.mouse(svg.node()).map(d => parseInt(d));

        tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + offsetL) + 'px;top:' + (mouse[1] + offsetT) + 'px')
            .html(this.__data__.properties.name);
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
            .on('mouseover', handleMouseOver)
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

        addPoints(data);
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


    //function to add points and text to the map (used in plotting capitals)
    function addPoints(data) {
        /*
        We have noticed that some of the data has its shape and duration (hours,min)
         */
        let clearData = data.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));

        g.selectAll('g')
            .data(clearData).enter()
            .append('g').attr('class', 'gpoint')
            .append('svg:circle')
            .attr('cx', d => projection([d.longitude, d.latitude])[0])
            .attr('cy', d => projection([d.longitude, d.latitude])[1])
            .attr('class', 'point')
            .style('fill', d => d.shape === "" ? shapeColor(shapes.indexOf("unknown")) : shapeColor(shapes.indexOf(d.shape)))
            .attr('r', .3);


        // let x = projection([lon, lat])[0];
        // let y = projection([lon, lat])[1];
        //
        // gpoint.append('svg:circle')
        //     .attr('cx', x)
        //     .attr('cy', y)
        //     .attr('class', 'point')
        //     .attr('r', 3);
    }

}