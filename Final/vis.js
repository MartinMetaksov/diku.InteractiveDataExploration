d3.select(window).on('load', init);

let ufoData,
    cfData,
    startDate = moment('12/10/2012'),
    endDate = moment('01/01/2014'),
    stepLength = 1000,
    currentMoment,
    totalDuration = endDate.diff(startDate, 'days'),
    interval,
    datetimeDimension,
    shapes,
    shapeColor = d3.scaleOrdinal(d3.schemeCategory20);

function init() {
    plotVisualizations('dataset');
}

function plotVisualizations(db) {
    d3.csv(
        'data/' + db + '.csv',
        (error, data) => {
            if (error) throw error;

            // Data cleanup
            let shapeCounts = new Map();
            ufoData = data.filter(d => !isNaN(+d.latitude) && !isNaN(+d.longitude) && +d.latitude !== 0 && +d.longitude !== 0);
            ufoData.forEach(d => {
                d.dt = new Date(d.dt);
                d.year = d.dt.getFullYear();
                d.month = d.dt.getMonth();
                d.day = d.dt.getDay();
                d.duration_sec = +d.duration_sec;
                d.latitude = +d.latitude;
                d.longitude = +d.longitude;
                shapeCounts.set(d.shape, (shapeCounts.get(d.shape) || 0) + 1);
            });
            // Shapes sorted by count
            shapes = Array.from(shapeCounts, d => ({shape: d[0], count: d[1]})).sort((a, b) => b.count - a.count);

            cfData = crossfilter(ufoData); // crossfilter - when data sizes are huge - http://square.github.io/crossfilter/
            datetimeDimension = cfData.dimension(d => d.dt);


            initMap(ufoData);
            plotUfos();
        });
}

// Source: http://techslides.com/d3-map-starter-kit
function initMap() {

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

    function drawMapLegend() {
        let g = d3.select('#map-legend')
            .attr('height', 500)
            .attr('width', 180)
            .attr('transform', 'translate(0,20)');
        let dg = g.selectAll('circle')
            .data(shapes).enter();

        dg.append('circle')
            .attr('cx', (_, i) => i%2 === 1 ? 100 : 10)
            .attr('cy', (_, i) => i%2 === 1 ? 15 * (i-1) + 10 : 15 * i + 10)
            .attr('r', 5)
            .style('fill', (_, i) => shapeColor(i));

        dg.append('text')
            .attr('class', 'map-legend-text')
            .attr('x', (_, i) => i%2 === 1 ? 110 : 20)
            .attr('y', (_, i) => i%2 === 1 ? 15 * (i-1) + 13 : 15 * i + 13)
            .text(d => d.shape);
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

        let oldPoints = g.selectAll('.gpoint');

        g.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'gpoint')
            .append('svg:circle')
            .attr('cx', d => projection([d.longitude, d.latitude])[0])
            .attr('cy', d => projection([d.longitude, d.latitude])[1])
            .attr('r', d => scaleDuration(d.duration_sec))
            .style('fill', d => shapeColor(shapes.findIndex(s => d.shape === s.shape)))
            .on('mouseover', d => handleMouseOver(d.dt.toLocaleString() + '<br />' + d.city
                + (d.state ? ', ' : '') + d.state + (d.country ? ', ' : '') + d.country + '<br />Shape: ' + d.shape + '<br />' + d.comments))
            .on('mouseout', handleMouseOut)
            .style('opacity', 0.0)
            .transition()
            .duration(400)
            .style('opacity', 1.0);

        setTimeout(function() {
            oldPoints
                .transition()
                .duration(600)
                .style('opacity', 0.0)
                .remove();
        }, 2000);
    }

    /*
     * Timeline related functions
     */

    $('#dtpicker-start, #dtpicker-end').datetimepicker({
        viewMode: 'years',
        format: 'DD/MM/YYYY',
        minDate: '1940/01/01',
        maxDate: '2014/01/01',
        useCurrent: false,
    });

    $('#dtpicker-start').data('DateTimePicker').defaultDate(startDate);
    $('#dtpicker-end').data('DateTimePicker').defaultDate(endDate);

    $('#dtpicker-end').on('dp.change', function(e) {
        endDate = e.date;
        resetProgressBar();
    });

    $('#dtpicker-start').on('dp.change', function(e) {
        startDate = e.date;
        resetProgressBar();
        $('#dtpicker-end').data("DateTimePicker").minDate(e.date.clone().add(1, 'days'));
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

    $('.play-pause-icon').on('click', function() {
        if (!validateDates()) {
            alert('You need to choose both a start and an end date');
            return;
        }
        if ($(this).attr('src').includes('play')) {
            totalDuration = endDate.diff(startDate, 'days');
            currentMoment = currentMoment ? currentMoment : 0;
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
        addPoints(cfDayData);
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
        }, stepLength)
    }


    function pause() {
        $('.play-pause-icon').attr('src', 'img/play.svg');
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
    }

}

String.prototype.capitalize = function(){
    return this.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

