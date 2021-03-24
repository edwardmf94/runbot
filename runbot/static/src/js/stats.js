
var config = {
  type: 'line',
  options: {
    legend: {
        display: true,
    },
    responsive: true,
    tooltips: {
      mode: 'index'
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Batches'
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
    var seed = Array.from(module_name).map(c => c.charCodeAt(0)).reduce((a, b) => (a << 5 - a) + b, 0);
    var r = seed & 255;
    var g = seed >> 8 & 255;
    var b = seed >> 16 & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
};

window.onload = function() {
  fetch("/runbot/stats/1/3/module_loading_queries", {}, function(result){
    console.log(result);
    var builds = Object.keys(result);
    var first_build_stats = result[builds[0]];
    var modules = Object.keys(first_build_stats);

    modules.sort((m1, m2) => first_build_stats[m2] - first_build_stats[m1]);

    modules = modules.slice(0, 20);
    console.log(modules);

    config.data = {
        labels: builds,
        datasets: modules.map(function (key){
            return {
                label: key,
                data: builds.map(build => result[build][key] || NaN),
                borderColor: random_color(key),
                backgroundColor: 'rgba(0, 0, 0, 0)',
                lineTension: 0
            }
        })
      };
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
  });
};