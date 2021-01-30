//
// GRAPH FUNCTIONS (APPLICATION SPECIFIC)
//

function getGraphStyle() {
// Returns the graph styles common to appliction
  try {
    return { type: "line",
            fill: false,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
           }
  }
  catch (errMsg) {
    throw("In graphFunctions.js: getGraphStyle(): " + errMsg)
  } 
}
  
function displayGraph(graph) {
// Create and display the graph
  try {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
            type: graph.style.type,
            data: {
                labels: graph.coordinates.xs,
                datasets: [{
                    label: graph.title,
                    data: graph.coordinates.ys,
                    fill: graph.style.fill,
                    backgroundColor: graph.style.backgroundColor,
                    borderColor: graph.style.borderColor,
                    borderWidth: graph.style.borderWidth
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return graph.currency_symbol + value
                            }
                        }
                    }]
                }
            }
        });
  }
  catch (errMsg) {
    throw("In graphFunctions.js: displayGraph(graph): " + errMsg)
  }
}