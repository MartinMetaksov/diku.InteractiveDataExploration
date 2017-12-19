d3.select(window).on('load', loadData);

let formatter = d3.format('0.2f');

function zip(a, b) {
    return a.map(function(e, i) { return [e, b[i]]; });
}

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

    hands.forEach((_hand, i) => {
        plotHand(getHandAt(hands, i), svg, width, height, i, pointMin, pointMax);
    });


    const svg2Elem = document.getElementById('pca');
    const svg2 = d3.select('#pca');
    const svg2width = svg2Elem.clientWidth;
    const svg2height = svg2Elem.clientHeight;

    plotScatter(hands_pca.map(val => val[0]),
        hands_pca.map(val => val[1]),
        svg2, svg2width, svg2height);
}

function plotHand(hand, svg, width, height, i, pointMin, pointMax) {

    const size = Math.min(width, height);
    const x = d3.scaleLinear().rangeRound([0, size]);
    const y = d3.scaleLinear().rangeRound([size, 0]);
    const radius = size / hand.length / 4;

    x.domain([pointMin, pointMax]);
    y.domain([pointMin, pointMax]);

    // Rotate to show the hand vertically
    const g = svg.append('g')
        .attr('id', 'hand-' + i)
        .attr('transform', 'translate(' + (width-size) + ',' + 0 + ') rotate(90,' + size/2 + ',' + size/2 + ')');

    // Add selectable points
    g.selectAll('.point')
        .data(hand)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('class', 'blurred')
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
        .attr('class', 'blurred')
        .attr('x1', d => x(hand[d].x))
        .attr('y1', d => y(hand[d].y))
        .attr('x2', d => x(hand[d + 1].x))
        .attr('y2', d => y(hand[d + 1].y))
        .attr('stroke', 'black')
        .attr('stroke-width', radius / 3);
}

function toggleCircleClick(i) {
    $('#hand-'+i).children().removeClass('semi-blurred').toggleClass('blurred');
    $('#circle-'+i).toggleClass('clicked');
}

function hoverCircle(i) {
    let h = $('#hand-'+i);
    if (h.children().hasClass('blurred')) {
        h.children().addClass('semi-blurred');
    }
}

function unhoverCircle(i) {
    $('#hand-'+i).children().removeClass('semi-blurred');
}

function plotScatter(xs, ys, hands_pca, width, height) {

    const offset = 0.05;

    const pointMinX = Math.min(...xs);
    const pointMaxX = Math.max(...xs);
    const pointMinY = Math.min(...ys);
    const pointMaxY = Math.max(...ys);

    const x = d3.scaleLinear().rangeRound([0, width-50]);
    const y = d3.scaleLinear().rangeRound([height-30, 0]);

    x.domain([pointMinX-offset, pointMaxX+offset]);
    y.domain([pointMinY-offset, pointMaxY+offset]);

    let g = hands_pca.append('g')
        .attr('transform', 'translate(30, 10)');

    g.append('g')
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).ticks(5));

    g.append('g')
        .attr('transform', 'translate(0, ' + (height - 30) + ')')
        .call(d3.axisBottom(x).ticks(10));

    g.selectAll('circle')
        .data(zip(xs, ys))
        .enter()
        .append('circle')
        .attr('id', (_, i) => 'circle-'+ i)
        .attr('cx', d => x(d[0]) + 'px')
        .attr('cy', d => y(d[1]) + 'px')
        .attr('r', '6px')
        .attr('class', 'circle')
        .on('mouseover', (_, i) => hoverCircle(i))
        .on('mouseout', (_, i) => unhoverCircle(i))
        .on('click', (_, i) => toggleCircleClick(i))
        .append('svg:title')
        .html((d, i) =>
            '<span>Index: ' + i + '</span>' +
            '<br />' +
            '<span>x = ' + formatter(d[0]) + '</span>' +
            '<br />' +
            '<span>y = ' + formatter(d[1]) + '</span>'
        );
}