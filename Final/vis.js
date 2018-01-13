d3.select(window).on('load', init);

$(document).ready(function() {
    $(window).scroll($.debounce( 250, true, function(){
        $('#ufo-image').attr('src', 'ufos/ufo_flying.svg');
    }));
    $(window).scroll($.debounce( 250, function(){
        $('#ufo-image').attr('src', 'ufos/ufo_abduct.svg');
    }));
});

/*function loadData() {
     d3.json('data/sfpd_crime.topojson', (error, data) => {
         if (error) throw error;
         init(data);
    });
}*/

function init() {
   plotVisualizations('scrubbed');
}

function plotVisualizations(db) {

    d3.csv(
        'data/' + db + '.csv',
        (error, data) => {
            if (error) throw error;

            plotUfosByShape(data);
            plotUfosByState(data);
            plotUfosByYear(data);
        });
}

function plotUfosByShape(data) {

    let svg = d3.select('#plot-1');

    if (svg.empty()) return;

    var counts = {};

    data.forEach(function (d) {
        if (!counts[d.shape]) {
            counts[d.shape] = 0;
        }
        counts[d.shape]++;
    });

    var dataObj = [];

    Object.keys(counts).forEach(function(key) {
        dataObj.push({
            shape: key,
            count: counts[key]
        });
    });

    dataObj.forEach(function (d) {
        d.shape = d.shape;
        d.count = +d.count;
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(function(d) { return d.shape; }));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, function(d) { return d.count; })]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.datetime);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function(d) {
            var s = d
            return this.parentNode.nextSibling
                ? "\xa0" + s
                :  s + " count";
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select(".domain").remove()
        g.selectAll(".tick text").attr('transform', 'rotate(-80)').attr('y',6).attr('dy', '-0.1em').attr('dx', '-3.0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#000000").attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text").attr("x", -20).attr("dy", -4);
    }

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(customXAxis);

    g.append("g")
        .call(customYAxis);

    let colors = d3.scaleOrdinal(d3.schemeCategory10);
    let tooltip = d3.select("body").append("div").attr("class", "toolTip");
    g.selectAll(".bar")
        .data(dataObj)
        .enter().append("rect")
        .attr('class', 'bar')
        .attr("x", function(d) { return x(d.shape); })
        .attr("y", function(d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.count); })
        .on("mousemove", function(d){
            tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html((d.shape) + "<br>" + (d.count) + " UFOs");
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");})
        .style("fill",function(d,i){return colors(i)});
}

function plotUfosByState(data) {
    let svg = d3.select('#plot-2');

    if (svg.empty()) return;

    var counts = {};

    data.forEach(function (d) {
        if (!counts[d.state]) {
            counts[d.state] = 0;
        }
        counts[d.state]++;
    });

    var dataObj = [];

    Object.keys(counts).forEach(function(key) {
        dataObj.push({
            state: key,
            count: counts[key]
        });
    });

    dataObj.forEach(function (d) {
        d.state = d.state.toUpperCase();
        d.count = +d.count;
    });

    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(function(d) { return (d.state); }));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, function(d) { return d.count; })]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.datetime);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function(d) {
            var s = d
            return this.parentNode.nextSibling
                ? "\xa0" + s
                :  s + " count";
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select(".domain").remove()
        g.selectAll(".tick text").attr('transform', 'rotate(-90)').attr('y',6).attr('dy', '-0.1em').attr('dx', '-1.5em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#000000").attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text").attr("x", -20).attr("dy", -4);
    }

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(customXAxis);

    g.append("g")
        .call(customYAxis);

    let colors = d3.scaleOrdinal(d3.schemeCategory20);

    g.selectAll(".bar")
        .data(dataObj)
        .enter().append("rect")
        .attr('class', 'bar')
        .attr("x", function(d) { return x(d.state); })
        .attr("y", function(d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.count); })
        .style("fill",function(d,i){return colors(i)});
}

function plotUfosByYear(data) {
    let svg = d3.select('#plot-3');

    if (svg.empty()) return;

    var counts = {};

    data.forEach(function (d) {
        d.datetime = new Date(d.datetime).getFullYear();

        if (!counts[d.datetime]) {
            counts[d.datetime] = 0;
        }
        counts[d.datetime]++;
    });

    var dataObj = [];

    Object.keys(counts).forEach(function(key) {
        dataObj.push({
            datetime: key,
            count: counts[key]
        });
    });

    dataObj.forEach(function (d) {
        d.count = +d.count;
    });


    let margin = {top: 20, right: 20, bottom: 60, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let g = svg.append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
        .domain(dataObj.map(function(d) { return d.datetime; }));

    let y = d3.scaleLinear().rangeRound([height, 0])
        .domain([0, d3.max(dataObj, function(d) { return d.count; })]).nice();

    let xAxis = d3.axisBottom(x)
        .ticks(d3.datetime);

    let yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function(d) {
            var s = d
            return this.parentNode.nextSibling
                ? "\xa0" + s
                :  s + " count";
        });

    function customXAxis(g) {
        g.call(xAxis);
        g.select(".domain").remove()
        g.selectAll(".tick text").attr('transform', 'rotate(-80)').attr('y',6).attr('dy', '-0.1em').attr('dx', '-2.0em');
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#000000").attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text").attr("x", -20).attr("dy", -4);
    }

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(customXAxis);

    g.append("g")
        .call(customYAxis);

    let colors = d3.scaleOrdinal(d3.schemeCategory10);

    g.selectAll(".bar")
        .data(dataObj)
        .enter().append("rect")
        .attr('class', 'bar')
        .attr("x", function(d) { return x(d.datetime); })
        .attr("y", function(d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.count); })
}