d3.select(window).on('load', loadData);

function loadData() {
    d3.json(
        'data/hands.json',
        (error, data) => {
            if (error) throw error;

            init(data);
        });
}

function init(data) {


}
