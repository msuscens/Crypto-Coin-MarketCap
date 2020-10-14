/* Javascript logic for coin page   */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Global to the coin page
let theCoinPageData = {}            // No coin page data obtained as yet
const graphStartDaysAgo = 365       // Default for inital page load


// Metadata for the required Coin page data
const pageUrl = window.location.href
const coinCriteria = {
    coinId:  getParamFromUrl( pageUrl, "?coinid="),
    currencyId: getParamFromUrl( pageUrl, "&currencyid="),
    graphStartDaysAgo: graphStartDaysAgo }


// Initialise date picker (for coin price graph's start date)
$(function () {
    $("#myDatepicker").datepicker({
        dateFormat: "yy-mm-dd", defaultDate: `-${graphStartDaysAgo}d`,
        maxDate: "-5d", minDate: new Date(2010, 1 - 1, 1),
        yearRange: "2010:c"
    })
    $("#myDatepicker").datepicker("setDate", `-${graphStartDaysAgo}d`)
})

 try {
/* THIS ALSO WORKS - INSTEAD OF ASYNC ANNONYMOS FUNCTION BELOW - BUT IS IT BETTER/CLEARER??
    $("document").ready( function () {
        console.log("Inside  : $(\"document\").ready(function ()")

        populateCoinPage(coinCriteria)

    })
*/
    ;(async () => {
        // Obtain all the coin data for the page
        console.log("In coinLogic.js: annonoymous async(): theCoinPageData = ", theCoinPageData)
        theCoinPageData = await getTheCoinPageData( coinCriteria )

        console.log("Returned from getCoinPageData: theCoinPageData = ", theCoinPageData)

        // Display the data on the coin page, section by section        
        $("document").ready( function () {
            displayCoinHeader( theCoinPageData )
            const priceGraph = getPriceGraph( theCoinPageData )
            displayGraph( priceGraph )

            displayPriceStats( theCoinPageData )
            displayMarketStats( theCoinPageData )
            displayDescription( theCoinPageData )

            displayFooter( theCoinPageData )
        })
    })()

} catch (error) {
    console.log("Something went wrong: " + error)
}

/*  FOR ABOVE ALTERNATIVE APPROACH

async function populateCoinPage(coinCriteria) {
    try {
        // Obtain all the coin data for the page
        const theCoinPageData = await getTheCoinPageData(coinCriteria)

        // Display the data on the Coin page        
        displayBody(theCoinPageData)
        const priceGraph = getPriceGraph(theCoinPageData)
        drawGraph( priceGraph )
    }
    catch (error) {
        console.log("Error catch in displayCoinOnPage():", error)
    }
}
*/


function displayCoinHeader(coin) {

    // Display the basic coin data
    const coinNameLine = `<img src="${coin.image.large}"border=3 height=50 width=50>` +
                        `<big><strong> &nbsp ${coin.name}</strong></big> (${coin.symbol.toUpperCase()})`
    const coinPriceLine = `<strong>${currency2DP.format(coin.market_data.current_price.usd)}</strong>` +
                        ` (${coin.currency_id.toUpperCase()})`
    const coinBtcPriceLine = `<span>&#x20bf</span>${coin.market_data.current_price.btc.toFixed(8)}(BTC)`

    $("#coinIconNameSymbol").html(coinNameLine)
    $("#mcRank").html(coin.market_cap_rank)
    $("#priceLine").html(coinPriceLine)
    $("#priceInBtcLine").html(coinBtcPriceLine)
}

function displayPriceStats(coin) {

    const price1hrLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_1h_in_currency")
    const price24hrLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_24h_in_currency")
    const price7dLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_7d_in_currency")
    const price14dLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_14d_in_currency")
    const price30dLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_30d_in_currency")
    const price60dLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_60d_in_currency")
    const price200dLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_200d_in_currency")
    const price1yLine = getPriceChangeHtml(coin, "coin.market_data.price_change_percentage_1y_in_currency")
    const price24hrLowHighLine = getPrice24hrLowHighHtml( coin )
    const priceATLLine = getPriceAllTimeHtml( coin, "atl" )
    const priceATHLine = getPriceAllTimeHtml( coin, "ath" )
    const priceSentimentlLine = getPriceSentimentHtml( coin )

    $("#price1hr").html( price1hrLine )
    $("#price24hr").html( price24hrLine )
    $("#price7d").html( price7dLine )
    $("#price14d").html( price14dLine )
    $("#price30d").html( price30dLine )
    $("#price60d").html( price60dLine )
    $("#price200d").html( price200dLine )
    $("#price1y").html( price1yLine )
    $("#price24hrLowHigh").html( price24hrLowHighLine )
    $("#priceATL").html( priceATLLine )
    $("#priceATH").html( priceATHLine )
    $("#priceSentiment").html( priceSentimentlLine )
}

function getPriceChangeHtml( coin, baseAttribute )
{
    const currencyValueAttribute = `${baseAttribute}.${coin.currency_id}`
    const percentageChangeInCurrency = eval(currencyValueAttribute)
    const btcValueAttribute = `${baseAttribute}.btc`
    const percentageChangeInBtc = eval(btcValueAttribute)

    const cssStyleChangeVsCurrency = cssColorForNumber(percentageChangeInCurrency)
    const cssStyleChangeVsBtc = cssColorForNumber(percentageChangeInBtc)

    const priceChangeHtml =
        `<span style="${cssStyleChangeVsCurrency}">` +
        `${percentageChangeInCurrency.toFixed(2)}%</span>` +
        ` [<span style="${cssStyleChangeVsBtc}"> ` +
        `${percentageChangeInBtc.toFixed(2)}% </span>BTC]`

    return priceChangeHtml
}


function getPrice24hrLowHighHtml( coin )
{
    const currency24hrLowAttribute = `coin.market_data.low_24h.${coin.currency_id}`
    const price24hrLowInCurrency = eval(currency24hrLowAttribute)

    const currency24hrHighAttribute = `coin.market_data.high_24h.${coin.currency_id}`
    const price24hrHighInCurrency = eval(currency24hrHighAttribute)

    const price24hrLowHighHtml = `24hr High: <span style="color:green">` +
                                `${currency2DP.format(price24hrHighInCurrency)}</span><br>` +
                                `24hr Low : <span style="color:red">` +
                                `${currency2DP.format(price24hrLowInCurrency)}</span>`

    return price24hrLowHighHtml
}


function getPriceAllTimeHtml( coin, highOrLow )
{
    const currencyATAttribute = `coin.market_data.${highOrLow}.${coin.currency_id}`
    const priceATInCurrency = eval(currencyATAttribute)
    const btcATAttribute = `coin.market_data.${highOrLow}.btc`
    const priceATInBtc = eval(btcATAttribute)

    const currencyATChangePercentageAttribute = `coin.market_data.${highOrLow}_change_percentage.${coin.currency_id}`
    const priceATChangePercentageInCurrency = eval(currencyATChangePercentageAttribute)
    const cssStyleChangeVsCurrency = cssColorForNumber(priceATChangePercentageInCurrency)

    const btcATChangePercentageAttribute = `coin.market_data.${highOrLow}_change_percentage.btc`
    const priceATChangePercentageInBtc = eval(btcATChangePercentageAttribute)
    const cssStyleChangeVsBtc = cssColorForNumber(priceATChangePercentageInBtc)

    const currencyATDateAttribute = `coin.market_data.${highOrLow}_date.${coin.currency_id}`
    const priceATDateForCurrency = eval(currencyATDateAttribute)
    const btcATDateAttribute = `coin.market_data.${highOrLow}_date.btc`
    const priceATDateForBtc = eval(btcATDateAttribute)

    const priceAllTimeHtml = `${highOrLow.toUpperCase()}: ` +
                            `${currency2DP.format(priceATInCurrency)} ` +
                            `[<span style="${cssStyleChangeVsCurrency}">` +
                            `${priceATChangePercentageInCurrency.toFixed(0)}%</span>] ` +
                            `<small>${priceATDateForCurrency.slice(0, 10)}</small><br>` +
                            `${highOrLow.toUpperCase()}: ` +
//                          `BTC: ${btc6DP.format(priceATInBtc)} ` +
                            `<span>&#x20bf</span>${priceATInBtc} ` +
                            `[<span style="${cssStyleChangeVsBtc}">` +
                            `${priceATChangePercentageInBtc.toFixed(0)}%</span>] ` +
                            `<small>${priceATDateForBtc.slice(0, 10)}</small>`

    return priceAllTimeHtml
}


function getPriceSentimentHtml( coin )
{
    const votesDownPercentage = coin.sentiment_votes_down_percentage
    const votesUpPercentage = coin.sentiment_votes_up_percentage

    const priceSentimentHtml = `Sentiment: <span style="color:red">` +
            `<i class="fas fa-thumbs-down"></i> ${votesDownPercentage.toFixed(1)}%</span><br>` +
            `&nbsp (votes) &nbsp &nbsp <span style="color:green">` +
            `<i class="fas fa-thumbs-up"></i> ${votesUpPercentage.toFixed(1)}%</span>`

    return priceSentimentHtml
}


function displayMarketStats(coin) {

    const currencyMarketCapAttribute = `coin.market_data.market_cap.${coin.currency_id}`
    const marketCapInCurrency = eval(currencyMarketCapAttribute)
    const marketCapLine = `${currency0DP.format(marketCapInCurrency)} ${coin.currency_id.toUpperCase()}`
    const marketCapInBtcLine = `<span>&#x20bf</span>${coin.market_data.market_cap.btc} BTC`

    const currencyTotalVolumeAttribute = `coin.market_data.total_volume.${coin.currency_id}`
    const totalVolumeInCurrency = eval(currencyTotalVolumeAttribute)
    const totalVolumeLine = `${currency0DP.format(totalVolumeInCurrency)} ${coin.currency_id.toUpperCase()}`

    const totalVolumeInBtcLine = `<span>&#x20bf</span>${coin.market_data.total_volume.btc} BTC`
    const circulatingSupplyLine = `${coin.market_data.circulating_supply} ${coin.symbol.toUpperCase()}`
    const totalSupplyLine = `${coin.market_data.total_supply} ${coin.symbol.toUpperCase()}`

    $("#marketCap").html( marketCapLine )
    $("#totalVolume").html( totalVolumeLine )
    $("#circulatingSupply").html( circulatingSupplyLine )
    $("#totalSupply").html( totalSupplyLine )
    $("#marketCapInBtc").html( marketCapInBtcLine ) 
    $("#totalVolumeInBtc").html( totalVolumeInBtcLine ) 
}


function displayDescription(coin) {

    const coinDescriptionLine = `<p>${coin.description.en}</p>`
    $("#coinDescription").html( coinDescriptionLine )
}


function displayFooter(coin) {

    const footerHtml = `<p>Last updated: ${coin.last_updated}<p/>`
    $("#coinPageFooter").html( footerHtml ) 
}


// PRICE CHART RELATED FUNCTIONS

// Event handler for clicking 'Show Chart' button
$("#myShowChartButton").click(async function () {
    try {
        // Get the new graph data (given start date selected by user)
        const startDate = $("#myDatepicker").datepicker("getDate")
        const daysAgo = getDaysAgo( startDate )
        coinCriteria.graphStartDaysAgo = daysAgo
            
        const graph = await getCoinGraphData(coinCriteria)
        theCoinPageData.price_graph = graph.price_graph

        // Display the graph
        console.log("In EH: theCoinData.price_graph =", theCoinPageData.price_graph) 
        const priceGraph = getPriceGraph(theCoinPageData)

        console.log("In EH: priceGraph =", priceGraph) 

        displayGraph( priceGraph )

    } catch (error) {
        console.log("Something went wrong in EH: " + error)
    }
})

function getPriceGraph( coin ){

    const startDate = $("#myDatepicker").datepicker("getDate");
    const graph = {
        coinName: coin.name,
        currencyId: coin.currency_id,
        currencySymbol: getCurrencySymbol(coin.currency_id),
        startUnixTimestamp: Math.floor(startDate.getTime() / 1000),
        endUnixTimestamp: Math.floor(Date.now() / 1000),
        xs: coin.price_graph.xs,
        ys: coin.price_graph.ys,
        title: `Price of ${coin.name} (in ${coin.currency_id.toUpperCase()})`,
        type: "line",
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
    }
    return graph
}

function displayGraph( graph ){
// Create and display the coin price chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
            type: graph.type,
            data: {
                labels: graph.xs,
                datasets: [{
                    label: graph.title,
                    data: graph.ys,
                    fill: graph.fill,
                    backgroundColor: graph.backgroundColor,
                    borderColor: graph.borderColor,
                    borderWidth: graph.borderWidth
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return graph.currencySymbol + value
                            }
                        }
                    }]
                }
            }
        });

}

