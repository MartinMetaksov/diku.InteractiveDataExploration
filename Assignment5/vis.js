d3.select(window).on('load', loadData);

let formatter = d3.format('0.2f');

function zip(a, b) {
    return a.map(function(e, i) { return [e, b[i]]; });
}

function loadData() {
    d3.text('data/sf_crime.geojson', (error1, data) => {
        if (error1) throw error1;
        init(data);
    });
}

function init(data) {

}