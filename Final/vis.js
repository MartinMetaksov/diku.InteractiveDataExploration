d3.select(window).on('load', loadData);

function loadData() {
    d3.json('data/sfpd_crime.topojson', (error, data) => {
        if (error) throw error;
        init(data);
    });
}

function init(data) {
    console.log('add final assignment here :D');
}