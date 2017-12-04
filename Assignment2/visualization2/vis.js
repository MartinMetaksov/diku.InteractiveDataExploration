
d3.select(window).on('load', init);

function init() {

    let svg = d3.select('#plot-zurich'),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    let parseTime = d3.timeParse("%Y");

    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    let valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.SON); });

    let valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.JJA); });

    let valueline3 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.MAM); });

    let valueline4 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.DJF); });
    
    let legend = svg.append("g")
        .attr("class","legend")
        .attr("transform", "translate(" + (width - 100) + "," + 20 + ")")
        .selectAll("g")
        .data(["DJF","JJA","MAM","SON"])
        .enter()
        .append("g");

    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    d3.csv("data/zurich.csv", function(error, data) {
      if (error) throw error;

      data.forEach(function(d) {
          d.YEAR = parseTime(d.YEAR);
          d.SON = +d.SON;
          d.JJA = +d.JJA;
          d.MAM = +d.MAM;
          d.DJF = +d.DJF;
      });

      x.domain(d3.extent(data, function(d) { return d.YEAR; }));
      y.domain([d3.min(data,function(d) { 
                    return Math.min(d.DJF, d.MAM,d.JJA, d.SON); }), 
                d3.max(data, function(d) { 
                    return Math.max(d.DJF, d.MAM,d.JJA, d.SON); })]);

      g.append("path")
          .data([data])
          .attr("class", "line")
          .attr("d", valueline);

      g.append("path")
          .data([data])
          .attr("class", "line")
          .style("stroke", "red")
          .attr("d", valueline2);

      g.append("path")
          .data([data])
          .attr("class", "line")
          .style("stroke", "orange")
          .attr("d", valueline3);

      g.append("path")
          .data([data])
          .attr("class", "line")
          .style("stroke", "green")
          .attr("d", valueline4);

      g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text("Temperature, ºC");

      legend.append("circle")
            .attr("cy", function(d, i) {
                return i*14;
            })
            .attr("cx", function(d, i) {
                return -10;
            })
            .attr("r",5)
            .attr("fill", function(d) {
                if (d == "DJF") 
                    return 'blue';
                else if (d == "MAM")
                    return 'red';
                else if (d == "JJA")
                    return 'orange';
                else
                    return "green"
            });

      legend.append("text")
            .attr("y", function(d, i) {
                return i*16;
            })
            .attr("x", -200)
            .text(function(d) {
                if (d == "DJF") 
                    return 'December - January - February';
                else if (d == "MAM")
                    return 'March - April - May';
                else if (d == "JJA")
                    return 'Jun - July - August';
                else
                    return "September - October - November"
            });
    });
}
