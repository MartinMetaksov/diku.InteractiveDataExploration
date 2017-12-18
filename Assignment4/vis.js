d3.select(window).on('load', loadData);

function loadData() {
    d3.text('data/hands.csv', (error1, hands) => {
        if (error1) throw error1;
        d3.text('data/hands_pca.csv', (error2, hands_pca) => {
            if (error2) throw error2;
            init(d3.csvParseRows(hands), d3.csvParseRows(hands_pca));
        });
    });
}

function getHandAt(hands, index) {

    const hand = hands[index];
    const coords = hand.length / 2;
    const ret = [];
    for (let i = 0; i < coords; ++i) {
        ret.push({x: +hand[i], y: +hand[i + coords]});
    }
    return ret;
}

function init(hands, hands_pca) {

    const svgElem = document.getElementById('hands');
    const height = svgElem.clientHeight;
    const width = svgElem.clientWidth;

    const svg = d3.select('#hands');
    const pointMin = d3.min(hands, hand => Math.min(...hand));
    const pointMax = d3.max(hands, hand => Math.max(...hand));

    const handIndex = 0;

    const svg2 = d3.select('#pca');

    plotHand(getHandAt(hands, handIndex), svg, width / 2, pointMin, pointMax);
    plotScatter(hands_pca.map(function(val, i) { return val[0] }),
        hands_pca.map(function(val, i) { return val[1] }),
        svg2, width / 2);
}

function plotHand(hand, svg, size, pointMin, pointMax) {

    const x = d3.scaleLinear().rangeRound([0, size]);
    const y = d3.scaleLinear().rangeRound([size, 0]);
    const radius = size / hand.length / 2;

    x.domain([pointMin, pointMax]);
    y.domain([pointMin, pointMax]);

    // Rotate to show the hand vertically
    const g = svg.append('g')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ') rotate(90,' + size + ',' + size + ')');

    // Add selectable points
    g.selectAll('.point')
        .data(hand)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', radius)
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .append('svg:title')
        .text((d, i) => 'Point ' + i);

    // Add lines
    g.selectAll('.hand-line')
        .data([...Array(hand.length - 1).keys()])
        .enter()
        .append('line')
        .attr('class', 'hand-line')
        .attr('x1', d => x(hand[d].x))
        .attr('y1', d => y(hand[d].y))
        .attr('x2', d => x(hand[d + 1].x))
        .attr('y2', d => y(hand[d + 1].y))
        .attr('stroke', 'black')
        .attr('stroke-width', radius / 3);
}

function plotScatter(xs, ys, hands_pca, size) {

    console.log('xs:');
    console.log(xs);
    console.log('ys:');
    console.log(ys);
    data = new Array();

    const pointMinX = d3.min(xs, hand_pca => Math.min(...xs));
    const pointMaxX = d3.max(xs, hand_pca => Math.max(...xs));
    const pointMinY = d3.min(ys, hand_pca => Math.min(...ys));
    const pointMaxY = d3.max(ys, hand_pca => Math.max(...ys));

    console.log(pointMinX);
    console.log(pointMaxX);
    console.log(pointMinY);
    console.log(pointMaxY);


    for(var i=0; i<xs.length; i++)
        data[i] = new Array()

    for(var i=0; i<xs.length; i++)
        for(var j=0; j<2; j++)
            data[i][j] = 0;

    for(var i=0; i<xs.length; i++)
        data[i][0] = xs[i];

    for(var i=0; i<xs.length; i++)
        data[i][1] = ys[i];
    console.log('size '+ size);
    const x = d3.scaleLinear().rangeRound([0, 500]);
    const y = d3.scaleLinear().rangeRound([150, 0]);

    x.domain([pointMinX, pointMaxX]);
    y.domain([pointMinY, pointMaxY]);

    let g = hands_pca.append('g')
        .attr('transform', 'translate(' + 90 + ',' + 100 + ')');

    g.append('g')
        .attr('class', 'axis axis--y')
        .attr("transform", "translate(219.3,0)")
        .call(d3.axisRight(y))
        .append('text')
        .attr('transform', 'rotate(70)')
        .attr('y', -5)
        .attr('dy', '0.71em')
        .attr('fill', '#000')

    g.append('g')
        .attr("class", "x axis")
        .attr("transform", "translate(0,78.5)")
        .call(d3.axisBottom(x).ticks(5))

    g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d){console.log('x: ' + d[0]);return x(d[0]) + "px";})
        .attr('cy', function(d){console.log('y: ' + d[1]); return y(d[1]) + "px";})
        .attr('r', '3px')
        .attr('fill', 'black')
        .append('svg:title')
        .html(d =>
            '<span>x = ' + (d[0]) + '</span>' +
            '<br />' +
            '<span>y = ' + (d[1]) + '</span>'
        );
}