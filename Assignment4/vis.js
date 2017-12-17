d3.select(window).on('load', loadData);

function loadData() {
    d3.text(
        'data/hands.csv',
        (error, data) => {
            if (error) throw error;

            init(d3.csvParseRows(data));
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

function init(hands) {

    const svgElem = document.getElementById('hands');
    const height = svgElem.clientHeight;
    const width = svgElem.clientWidth;

    const svg = d3.select('#hands');
    const pointMin = d3.min(hands, hand => Math.min(...hand));
    const pointMax = d3.max(hands, hand => Math.max(...hand));
    const handIndex = 0;

    plotHand(getHandAt(hands, handIndex), svg, width / 2.5, pointMin, pointMax);
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
