d3.select(window).on('load', loadData);

let depth_spouses = 0;
let depth_children = 0;

function getTwitterAvatar(handle) {
    return 'https://twitter.com/' + handle + '/profile_image?size=bigger';
}
// Age calculation: https://stackoverflow.com/a/21984136/2627680
// Tree inspiration: https://bl.ocks.org/tejaser/55c43b4a9febca058363a5e58edbce81
function calculateAge(birthday) { // birthday is a date
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function loadData() {
    d3.json(
        'data/trump_family.json',
        (error, data) => {
            if (error) throw error;

            init(data, extractLinearData(data));
        });
}

function extractLinearData(treeData) {

    const node = {'name': treeData.name, 'twitter': treeData.twitter};

    const innerNodes = treeData.partners ? treeData.partners
        : (treeData.children ? treeData.children : []);

    return [node].concat(...innerNodes.map(node => extractLinearData(node)));
}

function isParent(d) {
    return d.parent && 'partners' in d.parent.data;
}

function getDepthOfSpousesAndChildren(d) {
    if (d.depth === 0) {
        return [0, 0];
    } else {
        let x = d,
            parentsDepth = 0,
            childrenDepth = 0;
        while (x.parent) {
            isParent(x) ? parentsDepth += 1 : childrenDepth += 1;
            x = x.parent;
        }
        return [parentsDepth, childrenDepth];
    }
}

function init(data, linearData) {

    const radius = 25;

    const colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(['red', 'green']);
    const widthScale = d3.scaleLinear()
        .domain([1, 80])
        .range([1, 10]);

    // append the svg object to the body of the page
    const svg = d3.select('#trump');

    // append picture definitions
    svg.append('defs')
        .selectAll('pattern')
        .data(linearData.filter(d => d.twitter))
        .enter()
        .append('pattern')
        .attr('id', d => 'image-' + d.twitter)
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('x', '0%')
        .attr('y', '0%')
        .attr('viewBox', '0 0 73 73')
        .append('image')
        .attr('xlink:href', d => getTwitterAvatar(d.twitter))
        .attr('width', '73')
        .attr('height', '73')
        .attr('x', '0%')
        .attr('y', '0%');

    // append a 'group' element to 'svg'
    // move the 'group' element to the top left margin
    const group = svg.append('g')
        .attr('transform', 'translate(' + 250 + ',' + -10 + ')');

    let i = 0;
    const duration = 750;

    const svgElem = document.getElementById('trump');
    const height = svgElem.clientHeight;
    const width = svgElem.clientWidth;

    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    // Assigns parent, partners, height, depth
    const root = d3.hierarchy(data, d => d.children ? d.children : d.partners);
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    function update(source) {

        // Assigns the x and y position for the nodes
        const treeData = treemap(root);

        // Compute the new tree layout.
        const nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(d => {
            let x = getDepthOfSpousesAndChildren(d);
            let parentsDepth = x[0],
                childrensDepth = x[1];
            d.y = parentsDepth * 120 + childrensDepth * 300;
        });

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = group.selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++i));

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', d => {
                // return 'node';
                if (isParent(d)) {
                    return 'node parent';
                } else {
                    return 'node';
                }
            })
            .attr('transform', () => 'translate(' + source.y0 + ',' + source.x0 + ')')
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style('fill', d => d.data.twitter ? ('url(#image-' + d.data.twitter + ')') : 'lightgrey')
            .style('stroke', colorScale[5]);

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr('dy', '.35em')
            .attr('x', d => d.children || d._children ? 0 : radius + 10)
            .attr('y', d => d.children || d._children
                ? 40 : 0
            )
            .attr('text-anchor', d => d.children || d._children ? 'middle' : 'start')
            // .attr('text-anchor', 'middle')
            .text(d => d.data.name + ', age ' + calculateAge(new Date(d.data.born)));

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')');

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', radius)
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', () => 'translate(' + source.y + ',' + source.x + ')')
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        const link = group.selectAll('path.link')
            .data(links, d => d.id)
            .style('stroke-width', d => {
                return isParent(d) ? 3 : 1;
            })
            .style('stroke', d => {
                return isParent(d) ? 'blue' : 'red';
            });

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', () => {
                const o = {x: source.x0, y: source.y0};
                return diagonal(o, o)
            })
            .style('stroke-width', d => {
                return isParent(d) ? 3 : 1;
            })
            .style('stroke', d => {
                return isParent(d) ? 'blue' : 'red';
            });

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', d => diagonal(d, d.parent));

        // Remove any exiting links
        link.exit().transition()
            .duration(duration)
            .attr('d', () => {
                const o = {x: source.x, y: source.y};
                return diagonal(o, o)
            })
            .style('stroke-width', d => widthScale(d.data.value))
            .remove();

        // Store the old positions for transition.
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}
