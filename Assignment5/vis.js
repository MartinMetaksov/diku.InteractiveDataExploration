const cs = 11; // allowed char space in pixels
let formatter = d3.format('0.1f');
let crime_dots;
let selected_crimes = [];
let selected_days = [];
let selected_hours = [];
let selected_districts = [];

function zip(a, b) {
    return a.map(function(e, i) { return [e, b[i]]; });
}

d3.select(window).on('load', loadData);

function jsUcfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function loadData() {
    d3.json('data/sfpd_crime.topojson', (error1, sfpd_map) => {
        if (error1) throw error1;
        d3.json('data/sf_crime.geojson', (error2, sf_crime) => {
            if (error2) throw error2;
            init(sfpd_map, sf_crime);
        });
    });
}

function groupCategories(allOccurences) {
    let res = [];
    allOccurences.map(f => {
        if ($.inArray(f.properties.Category, res) === -1) {
            res.push(f.properties.Category)
        }
    });
    return res;
}

function init(sfpd_map, sf_crime) {
    let jq_map = $('#map'),
        width = jq_map.width(),
        height = jq_map.height();

    let svg = d3.select('#map');

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

    let plane = topojson.feature(sfpd_map, sfpd_map.objects.collection);

    projection.scale(1).translate([0, 0]);
    let b = path.bounds(plane);
    let s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    let t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);

    let sf_map = svg.selectAll('path')
        .data(plane.features)
        .enter();


    /*
     * Draw regions
     */
    sf_map.append('path')
        .attr('class', 'link')
        .attr('id', (_, i) => 'district-'+i)
        .attr('d', path)
        .attr('fill', 'lightgrey')
        .attr('stroke', 'darkgrey')
        .on('mousemove', (d, i) => mousemoveDistrict(d, i))
        .on('mouseout', (_, i) => mouseoutDistrict(i))
        .on('click', (d, i) => mouseclickDistrict(d.properties.district, i));

    /*
     * Draw circles/dots for crimes in different colors
     */
    crime_dots = svg.selectAll("circle")
        .data(sf_crime.features).enter()
        .append('circle')
        .attr('cx', d => projection(d.geometry.coordinates)[0])
        .attr('cy', d => projection(d.geometry.coordinates)[1])
        .attr('r', '1px')
        .attr('class', 'inactive')
        .attr("fill", 'red');


    /*
     * draw tooltips (hidden by default)
     * tooltips are drawn after the actual regions because of layering
     */
    let tooltips = sf_map.append('g')
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

    /*
     * Write some statistics
     */
    updatePercentages();

    /*
     * Draw filters
     */
    let categories = groupCategories(sf_crime.features);
    drawCategoryFilter(categories);
    drawDaysOfWeekFilter();
    drawHoursFilter();
}

function mousemoveDistrict(d, i) {
    let map = $('#map')[0],
        tt = $('#district-tt-'+i);

    d3.select('#district-'+i).attr('fill', 'grey');

    tt.show();
    d3.select('#district-tt-'+i)
        .attr('transform', 'translate(' + (d3.mouse(map)[0] - (d.properties.district.length * cs)/2) + ', ' + (d3.mouse(map)[1] + 20) + ')');
}

function mouseoutDistrict(i) {
    d3.select('#district-'+i).attr('fill', 'lightgrey');
    $('#district-tt-'+i).hide();
}

function mouseclickDistrict(district, i) {
    $('#district-'+i).toggleClass('clicked-district');
    filter(district, i, 'district');
}

function drawCategoryFilter(categories) {
    let jsvg = $('#category-filter');
    let svg = d3.select('#category-filter');
    drawFilter(svg, jsvg.width(), jsvg.height(), categories, 'crimes');
}

function drawDaysOfWeekFilter() {
    let jsvg = $('#day-filter');
    let svg = d3.select('#day-filter');
    let daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    drawFilter(svg, jsvg.width(), jsvg.height(), daysOfWeek, 'days');
}

function drawHoursFilter() {
    let jsvg = $('#hour-filter');
    let svg = d3.select('#hour-filter');
    let hours = ['00-04h', '04-08h', '08-12h', '12-16h', '16-20h', '20-24h'];
    drawFilter(svg, jsvg.width(), jsvg.height(), hours, 'hours');
}

function drawFilter(svg, width, height, cats, cat_type) {
    let categories = svg.selectAll('.categories')
        .data(cats)
        .enter();

    categories.append('g')
        .attr('transform', 'rotate(-45)')
        .append('text')
        .text(d => d)
        .attr('id', (d,i) => cat_type + '-' + i)
        .attr('fill', 'lightgrey')
        .attr('class', 'link toggleable')
        .attr('font-size', 11)
        .on('click', (d,i) => filter(d,i, cat_type))
        .attr('transform', (d, i) => 'translate(' + (12*i - 85) + ',' + (12*i + 125) + ')');
}

function filter(d, i, cat_type) {
    // set filter(s)
    let item;
    let indexElement;
    if (cat_type !== 'district') {
         item = $('#' + cat_type + '-' + i);
        item.toggleClass('selected');
    }
    switch(cat_type) {
        case 'crimes':
            item.hasClass('selected') ? selected_crimes.push(d) : selected_crimes.pop(d);
            break;
        case 'days':
            item.hasClass('selected') ? selected_days.push(d) : selected_days.pop(d);
            break;
        case 'hours':
            item.hasClass('selected') ? selected_hours.push(d) : selected_hours.pop(d);
            break;
        case 'district':
            if ($('#district-'+i).hasClass('clicked-district') == true) {
                selected_districts.push(d);
            }
            else {
                indexElement= selected_districts.indexOf(d);
                selected_districts.splice(indexElement,1);
            }
            break;
        default: throw new Error('Range error')
    }

    // apply filter(s)
    crime_dots
        .attr('class', 'inactive') // set all as active
        .filter(dot => {
            if (selected_crimes.length === 0 &&
                selected_hours.length === 0 &&
                selected_days.length === 0 &&
                selected_districts.length === 0) {
                // do not filter if no filter selections are made
                return false;
            }

            return (selected_districts.length > 0 ? $.inArray(dot.properties.PdDistrict, selected_districts) > -1 : true) &&
                (selected_crimes.length > 0 ? $.inArray(dot.properties.Category, selected_crimes) > -1 : true) &&
                (selected_days.length > 0 ? $.inArray(dot.properties.DayOfWeek.toUpperCase(), selected_days) > -1 : true) &&
                (selected_hours.length > 0 ? isInHourRange(dot.properties.Dates) : true);
        })
        .attr('class', 'active'); // set all but the filtered to inactive

    updatePercentages(); // redraw it
}

function isInHourRange(datetime) {
    let hour = new Date(datetime).getHours();
    for (let i = 0; i < selected_hours.length; i++) {
        let lb = parseInt(selected_hours[i].substring(0, 2));
        let ub = parseInt(selected_hours[i].substring(3, 5));
        if (hour >= lb && hour < ub) {
            return true;
        }
    }
    return false;
}

function getTotalCrimesPercentage() {
    let shown = $('.active').length;
    let total = crime_dots.size();
    return total === 0 ? 0 : Math.round((shown/parseFloat(total))*100);
}

function updatePercentages() {
    $('#totalCrime').text(getTotalCrimesPercentage());
}