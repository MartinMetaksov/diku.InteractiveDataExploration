const cs = 11; // allowed char space in pixels
let formatter = d3.format('0.2f');

function zip(a, b) {
    return a.map(function(e, i) { return [e, b[i]]; });
}

d3.select(window).on('load', loadData);

function jsUcfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function loadData() {
    d3.json('data/sfpd_crime.topojson', (error1, data) => {
        if (error1) throw error1;
        init(data);
    });
}

function init(data) {
    let jq_map = $('#map'),
        width = jq_map.width(),
        height = jq_map.height();

    let svg = d3.select('#map');

    let color = d3.scaleLinear()
        .domain([0, 9])
        .clamp(true)
        .range(['#a6cee3', '#1f78b4']);
    /*
    * Mercator is a projection type
    * https://en.wikipedia.org/wiki/Mercator_projection
    */
    let projection = d3.geoMercator()
        .center([-122.433701, 37.767683])
        .scale(500)
        .translate([width / 2, height / 2]);

    let path = d3.geoPath()
        .projection(projection);

    let plane = topojson.feature(data, data.objects.collection);

    projection.scale(1).translate([0, 0]);
    let b = path.bounds(plane);
    let s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    let t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);

    let points = svg.selectAll('path')
        .data(plane.features)
        .enter();


    /*
     * draw regions
     */
    points.append('path')
        .attr('class', 'link')
        .attr('id', (_, i) => 'district-'+i)
        .attr('d', path)
        .attr('fill', (_, i) => color(i))
        .on('mousemove', (d, i) => mousemoveDistrict(d, i))
        .on('mouseout', (_, i) => mouseoutDistrict(i, color));

    /*
     * draw tooltips (hidden by default)
     * tooltips are drawn after the actual regions because of layering
     */
    let tooltips = points.append('g')
        .attr('id', (_, i) => 'district-tt-' + i)
        .attr('class', 'abs-tooltip');


    tooltips.append('rect')
        .attr('width', d => d.properties.district.length * cs )
        .attr('height', '25')
        .attr('rx', '5') // radius
        .attr('ry', '5') // radius
        .attr('fill', 'rgb(0,0,255,0.7)');

    tooltips.append('text')
        .attr('width',  d => (d.properties.district.length * cs))
        .attr('text-anchor', 'middle')
        .attr('x', d => (d.properties.district.length * cs)/2 )
        .attr('y', 18)
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .text(d => jsUcfirst(d.properties.district));
}

function mousemoveDistrict(d, i) {
    let map = $('#map')[0],
        tt = $('#district-tt-'+i);

    d3.select('#district-'+i).attr('fill', '#b2df8a');

    tt.show();
    d3.select('#district-tt-'+i)
        .attr('transform', 'translate(' + (d3.mouse(map)[0] - (d.properties.district.length * cs)/2) + ', ' + (d3.mouse(map)[1] + 20) + ')');
}

function mouseoutDistrict(i, color) {
    d3.select('#district-'+i).attr('fill', color(i));
    $('#district-tt-'+i).hide();
}

