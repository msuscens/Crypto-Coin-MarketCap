/* Javascript logic for coin page   */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// *** TODO: Refactor populateCoinPage() to instead just gather data here 
// ***      and then display data from inside "$("document").ready()""
// ***      Note: will need coinid and currency id (from invoking index page)

$("document").ready(function () {

    // Get and collate relevant coin data, displaying on the coin page
    populateCoinPage()

})


// FUNCTIONS

async function populateCoinPage() {
    try {
        // Obtain the Coin Data
        const theCoin = await getTheCoin("bitcoin", "usd")

        // Display the data on the Coin page        
        displayOnPage(theCoin)
        const graphParams = getGraphParams(theCoin)
        drawGraph( graphParams )
    }
    catch (error) {
        console.log("Error catch in displayCoinOnPage():", error)
    }
}

function displayOnPage(coin) {

    console.log("Inside displayOnPage(coin): coin = ", coin)

    // Display the basic coin data
    const coinNameLine = `<img src="${coin.image.large}"border=3 height=50 width=50> <strong>${coin.name}</strong> (${coin.symbol})`
    const coinPriceLine = "<strong>" + currency2DP.format(coin.market_data.current_price.usd) + "</strong>" +
                        " (USD)" +
                        " [" + coin.market_data.price_change_percentage_24h.toFixed(2) + "% in 24hrs]"
    const coinBtcPriceLine = coin.market_data.current_price.btc.toFixed(8) + " (BTC)" //TODO: ADD % BTC change

    $("#coinIconNameSymbol").html(coinNameLine)
    $("#mcRank").html(coin.market_cap_rank)
    $("#priceLine").html(coinPriceLine)
    $("#priceInBtcLine").html(coinBtcPriceLine)

}


// PRICE CHART RELATED FUNCTIONS

function getGraphParams( coin ){
// TODO: Replace hardcoded currencyID
// (perhaps get from coin page url, or from a saved property data, or from 
// previously added attribute to coin object )

    const startDate = $("#myDatepicker").datepicker("getDate");
    const graphParams = {
        coinName: coin.name,
        currencyId: "USD",
        startUnixTimestamp: Math.floor(startDate.getTime() / 1000),
        endUnixTimestamp: Math.floor(Date.now() / 1000),
        xs: coin.priceGraph.xs,
        ys: coin.priceGraph.ys
    }

    return graphParams
}

function drawGraph ( graphParams ){
// Create and display the coin price chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: graphParams.xs,
                datasets: [{
                    label: 'Bitcoin in USD ($)',  // TODO: Replace hardcoded title
                    data: graphParams.ys,
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return '$' + value     // TODO: Replace hardcoded '$' symbol
                            }
                        }
                    }]
                }
            }
        });

}


$(function () {
    $("#myDatepicker").datepicker({
        dateFormat: "yy-mm-dd", defaultDate: "-5y",
        maxDate: "-5d", minDate: new Date(2010, 1 - 1, 1),
        yearRange: "2010:c"
    })
    $("#myDatepicker").datepicker("setDate", "-5y")
})


// Event handler for clicking 'Show Chart' button
$("#myShowChartButton").click(async function () {

    // Set data requirements for graph (including user selected start date/currency)
    const startDate = $("#myDatepicker").datepicker("getDate");
    const params = {
           coinId: "bitcoin",   // TODO: Replace Hardcoding - change to use coin.name (scope!?)
           currencyId: "usd",   // TODO: Replace Hardcoding - change to take currency from UI
           startUnixTimestamp: Math.floor(startDate.getTime() / 1000),
           endUnixTimestamp: Math.floor(Date.now() / 1000)
    }

    const graphData = await getCoinGraphData(params) 
    
        // Graph data now available
        drawGraph( graphData.priceGraph )
})
