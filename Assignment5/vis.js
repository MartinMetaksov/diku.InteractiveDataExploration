d3.select(window).on('load', loadData);

let formatter = d3.format('0.2f');

function zip(a, b) {
    return a.map(function(e, i) { return [e, b[i]]; });
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

    let svg = d3.select("#map");

    let color = d3.scaleLinear()
        .domain([0, 9])
        .clamp(true)
        .range(['#F0F8FF', '#002147']);

    /*
    * Mercator is a projection type
    * https://en.wikipedia.org/wiki/Mercator_projection
    */
    let projection = d3.geoMercator()
        .center([-122.433701, 37.767683])
        // .scale(width / 2 / Math.PI)
        .scale(500)
        .translate([width / 2, height / 2]);

    let path = d3.geoPath()
        .projection(projection);

    let plane = topojson.feature(data, data.objects.collection);  <!-- read data -->

    projection.scale(1).translate([0, 0]);
    let b = path.bounds(plane);
    let s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    let t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);

    vector= svg.selectAll("path")
        .data(plane.features)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("id", (_, i) => "id-"+i)
        .attr('data-toggle', 'tooltip')
        .attr('title', (_, i) => 'District ' + i)
        .attr("d", path)
        .attr('fill', (_, i) => color(i));

}