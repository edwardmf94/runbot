
var config = {
  type: 'line',
  options: {
    legend: {
        display: true,
        position: 'right',
    },
    responsive: true,
    tooltips: {
      mode: 'point'
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Builds'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Queries'
        },
      }]
    }
  }
};

config.options.onClick = function(event, activeElements) {
    if (activeElements.length === 0)
        return;
    window.open('/runbot/build/stats/' + config.data.labels[activeElements[0]._index]);
};

function fetch(path, data, then) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const res = JSON.parse(this.responseText);
                then(res.result);
            }
        };
        xhttp.open("POST", path);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({params:data}));
    };

function random_color(module_name){
    var colors = ['#004acd', '#3658c3', '#4a66ba', '#5974b2', '#6581aa', '#6f8fa3', '#7a9c9d', '#85a899', '#91b596', '#a0c096', '#fdaf56', '#f89a59', '#f1865a', '#e87359', '#dc6158', '#ce5055', '#bf4150', '#ad344b', '#992a45', '#84243d'];
    var sum = 0;
    for (var i = 0; i < module_name.length; i++) {
        sum += module_name.charCodeAt(i);
    }
    sum = sum % colors.length;
    color = colors[sum];

    return color
};


function process_chart(){
    var builds = Object.keys(config.result);
    var newer_build_stats = config.result[builds[0]];
    var older_build_stats = config.result[builds.slice(-1)[0]];

    var mode = document.getElementById('mode_selector').value;

    function display_value(module, build_stats){
        // {'base': 50, 'crm': 25 ...}
        if (build_stats === undefined)
            build_stats = newer_build_stats;
        if (build_stats[module] === undefined)
            return NaN;
        if (mode == 'normal')
            return build_stats[module]
        if (older_build_stats[module] === undefined)
            return NaN;
        return build_stats[module] - older_build_stats[module]
    }

    var modules = Object.keys(newer_build_stats);

    modules.sort((m1, m2) => Math.abs(display_value(m2)) - Math.abs(display_value(m1)));

    modules = modules.slice(0, 20);

    config.data = {
        labels: builds,
        datasets: modules.map(function (key){
            return {
                label: key,
                data: builds.map(build => display_value(key, config.result[build])),
                borderColor: random_color(key),
                backgroundColor: 'rgba(0, 0, 0, 0)',
                lineTension: 0
            }
        })
      };
}

function fetch_stats(fetch_url) {
  fetch(fetch_url, {}, function(result){
    if (Object.keys(result).length > 0) {
        config.result = result;
        process_chart();
        var ctx = document.getElementById('canvas').getContext('2d');
        window.statsChart = new Chart(ctx, config);
    } else console.log('No data');
  });
};

function compute_url(){
    var stat_category = document.getElementById('category_selector').value;
    var bundle_id = document.getElementById('bundle_id').value;
    var trigger_id = document.getElementById('trigger_id').value;
    return '/runbot/stats/' + bundle_id + '/' + trigger_id + '/' + stat_category
};

window.onload = function() {

    var mode_selector = document.getElementById('mode_selector');
    var category_selector= document.getElementById('category_selector');
    //does not work
    config.options.scales.yAxes[0].scaleLabel = category_selector["options"][category_selector["selectedIndex"]].text;
    fetch_stats(compute_url());

    mode_selector.onchange = function() {
        process_chart(this.value);
        window.statsChart.update();
    };

    category_selector.onchange = function() {
        //does not work
        config.options.scales.yAxes[0].scaleLabel = this.value;
        fetch_stats(compute_url());
    }
};
