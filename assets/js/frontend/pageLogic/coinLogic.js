/* Javascript logic for coin details page   */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Where to store (and retrive) the coin details and price graph data
const idElementStoringCoinData = "coinDetailsTable" 
const idElementStoringCoinPriceGraphData = "coinPriceGraph" 

// Initial coin page parameters 
const coinId = getParamFromUrl( window.location.href, "?coinid=")
const currencyId = getParamFromUrl( window.location.href, "&currencyid=")
const priceGraphStartDaysAgo = 365       // Default for inital page load

const metadataForPage = {
    graph: {
        coinId:  coinId,
        currencyId: currencyId,        
        startDaysAgo: priceGraphStartDaysAgo
    },
    coin: {
        coinId:  coinId,
        currencyId: currencyId
    },
    searchSuggestions: {
          rowsPerPage: 10,    
          currentPageNumber: 1
    }
}
// Save meta data (in html elements as properties)
$("#"+idElementStoringCoinData).prop("coinMetadata",metadataForPage.coin)
$("#"+idElementStoringCoinPriceGraphData).prop("graphMetadata",metadataForPage.graph)

// Initialise the currency formatter functions (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater(metadataForPage.coin.currencyId, 2)
let currency0DP = newCurrencyFormater(metadataForPage.coin.currencyId, 0)

 try {
    // Fetch the live data
    getContentForCoinDetailsPage( metadataForPage )
    .then (
        (data) => {
            // Set graph's additional characteristics
            data.graph.style = getGraphStyle()
            data.graph.title = `Price of ${data.coin.name} (in ${data.graph.currency_id.toUpperCase()})`
            data.graph.currency_symbol =  getCurrencySymbol(data.graph.currency_id)
          
            // Save page's coin and price graph data
            $("#"+idElementStoringCoinData).prop("coinData",data.coin)
            $("#"+idElementStoringCoinPriceGraphData).prop("graphData",data.graph)
            
            // Display the data on the page        
            displayHeader( data.coin )
            displayGraph( data.graph )
            displayPriceStats( data.coin )
            displayMarketStats( data.coin )
            displayDescription( data.coin )
            displayFooter( data.coin )

            // Add the currency selector component onto the page
            const selectorCriteria =  { id: "currencySelectorComponent",
                                        currencies: data.coin.market_data.all_currencies_supported,
                                        selectedCurrency: data.coin.currency_id,
                                        currencyUpdateFunc: changeCurrencyOnCoinPage
                                      }
            const currencySelector = new CurrencySelectorComponent(selectorCriteria)

            // Save currency selector object (in the html div of currency selector)
            $("#currencySelectorComponent").prop("currencySelectorObject", currencySelector)


            // Add a Coin Search Component onto the page
            const coinSearchComponentData = { idSC: "coinSearchComponent",
                                              idSCForm: "coinSearchForm",
                                              idSCInput: "coinSearchInput",
                                              idSCList: "coinSearchList",
                                              textSC: { input_title: "Type in a coin (or token) name or id",
                                                         input_placeholder: "Search for a coin...",
                                                         suggestions_list_title: "Trending searches:",
                                                         searchPool_list_title: "Top matching coins:"
                                                      },
                                              searchPool: data.all_the_coins,
                                              suggestions: data.trending_coin_searches,
                                              maxItemsInSearchList: 8                                           
                                             }
            const coinSearchComponent = new CoinSearchComponent( coinSearchComponentData )
        }  
    )
} catch (errMsg) {
    console.log("Something went wrong in CoinLogic.js: " + errMsg)
}

// Initialise date picker (for coin price graph's start date)
$(function () {
  try {
    $("#myDatepicker").datepicker({
        dateFormat: "yy-mm-dd", defaultDate: `-${metadataForPage.graph.startDaysAgo}d`,
        maxDate: "-5d", minDate: new Date(2010, 1 - 1, 1),
        yearRange: "2010:c"
    })
    $("#myDatepicker").datepicker("setDate", `-${metadataForPage.graph.startDaysAgo}d`)
  }
  catch (errMsg) {
    throw("In Initialise date picker: " + errMsg)
  }
})

function displayHeader(coin) {
  try {
    // Display the basic coin data
    const coinNameLine = `<img src="${coin.image.large}" border=3 height=50 width=50>
                            <big><strong> &nbsp ${coin.name}</strong></big> (${coin.symbol.toUpperCase()})`
    const coinPriceLine = `<strong>${currency2DP.format(coin.market_data.current_price[coin.currency_id])} </strong>
                            (${coin.currency_id.toUpperCase()})`
    const coinBtcPriceLine = `<span>&#x20bf</span>${coin.market_data.current_price.btc.toFixed(8)} (BTC)`

    $("#coinIconNameSymbol").html(coinNameLine)
    $("#mcRank").html(coin.market_cap_rank)
    $("#priceLine").html(coinPriceLine)
    $("#priceInBtcLine").html(coinBtcPriceLine)
  }
  catch (errMsg){
    throw ("In displayHeader(coin): " + errMsg)
  }
}

function displayPriceStats(coin) {
  try {
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
  catch (errMsg){
    throw ("In displayPriceStats(coin): " + errMsg)
  }
}

function getPriceChangeHtml(coin, baseAttribute)
{
  try {
    const percentageChangeInCurrency = eval(`${baseAttribute}.${coin.currency_id}`)
    const percentageChangeInBtc = eval(`${baseAttribute}.btc`)

    const cssStyleChangeVsCurrency = cssColorForNumber(percentageChangeInCurrency)
    const cssStyleChangeVsBtc = cssColorForNumber(percentageChangeInBtc)

    const priceChangeHtml =
        `<span style="${cssStyleChangeVsCurrency}">${percentageChangeInCurrency.toFixed(2)}% </span>
        [<span style="${cssStyleChangeVsBtc}">${percentageChangeInBtc.toFixed(2)}% </span>BTC]`

    // Set display character for missing numbers (set as NaNs in data)                  
    const priceChangeHtmlwithNaNsReplaced = priceChangeHtml.replace(/NaN/g, "-")
    
    return priceChangeHtmlwithNaNsReplaced
  }
  catch (errMsg){
    throw ("In getPriceChangeHtml(coin, baseAttribute): " + errMsg)
  }    
}

function getPrice24hrLowHighHtml(coin)
{
  try {
    const price24hrLowInCurrency = coin.market_data.low_24h[ coin.currency_id ]
    const price24hrHighInCurrency = coin.market_data.high_24h[ coin.currency_id ]
    const price24hrLowHighHtml = `24hr High: <span style="color:green">
                                    ${currency2DP.format(price24hrHighInCurrency)}</span><br>
                                  24hr Low : <span style="color:red">
                                    ${currency2DP.format(price24hrLowInCurrency)}</span>`
    return price24hrLowHighHtml
  }
  catch (errMsg){
    throw ("In getPrice24hrLowHighHtml(coin): " + errMsg)
  }
}

function getPriceAllTimeHtml(coin, highOrLow)
{
  try {
    const priceATInCurrency = eval(`coin.market_data.${highOrLow}.${coin.currency_id}`)
    const priceATInBtc = eval(`coin.market_data.${highOrLow}.btc`)

    const priceATChangePercentageInCurrency = eval(`coin.market_data.${highOrLow}_change_percentage.${coin.currency_id}`)
    const cssStyleChangeVsCurrency = cssColorForNumber(priceATChangePercentageInCurrency)

    const priceATChangePercentageInBtc = eval(`coin.market_data.${highOrLow}_change_percentage.btc`)
    const cssStyleChangeVsBtc = cssColorForNumber(priceATChangePercentageInBtc)

    const priceATDateForCurrency = eval(`coin.market_data.${highOrLow}_date.${coin.currency_id}`)
    const priceATDateForBtc = eval(`coin.market_data.${highOrLow}_date.btc`)

    const priceAllTimeHtml = `${highOrLow.toUpperCase()}: ${currency2DP.format(priceATInCurrency)} 
        [<span style="${cssStyleChangeVsCurrency}">${priceATChangePercentageInCurrency.toFixed(0)}%</span>]
            <small> ${priceATDateForCurrency.slice(0, 10)}</small><br>
        &nbsp &nbsp <span>&#x20bf</span>${priceATInBtc}
        [<span style="${cssStyleChangeVsBtc}">${priceATChangePercentageInBtc.toFixed(0)}%</span>]
            <small> ${priceATDateForBtc.slice(0, 10)}</small>`

    return priceAllTimeHtml
  }
  catch (errMsg){
    throw ("In getPriceAllTimeHtml(coin, highOrLow): " + errMsg)
  }
}

function getPriceSentimentHtml(coin)
{
  try {
    const votesDownPercentage = coin.sentiment_votes_down_percentage
    const votesUpPercentage = coin.sentiment_votes_up_percentage

    const priceSentimentHtml = `<span class="badge badge-success">Sentiment:</span>&nbsp 
            <span style="color:red">
              <i class="fas fa-thumbs-down"></i> ${votesDownPercentage.toFixed(1)}% </span>&nbsp 
            <span style="color:green">
              <i class="fas fa-thumbs-up"></i> ${votesUpPercentage.toFixed(1)}% </span>`

    // Set display character if missing vote numbers                  
    const priceSentimentHtmlwithNaNsReplaced = priceSentimentHtml.replace(/NaN/g, "-")

    return priceSentimentHtmlwithNaNsReplaced
  }
  catch (errMsg){
    throw ("In getPriceSentimentHtml(coin): " + errMsg)
  }
}

function displayMarketStats(coin) {
  try {
    const marketCapInCurrency = coin.market_data.market_cap[coin.currency_id]
    const marketCapLine = `${currency0DP.format(marketCapInCurrency)} ${coin.currency_id.toUpperCase()}`
    const marketCapInBtcLine = `<span>&#x20bf</span>${coin.market_data.market_cap.btc.toLocaleString()} BTC`

    const totalVolumeInCurrency = coin.market_data.total_volume[coin.currency_id]
    const totalVolumeLine = `${currency0DP.format(totalVolumeInCurrency)} ${coin.currency_id.toUpperCase()}`

    const totalVolumeInBtcLine = `<span>&#x20bf</span>${coin.market_data.total_volume.btc.toLocaleString()} BTC`
    const circulatingSupplyLine = `${coin.market_data.circulating_supply.toLocaleString()} ${coin.symbol.toUpperCase()}`
    const maxSupplyLine = Number.isNaN( coin.market_data.max_supply) ?
            `No limit` : `${coin.market_data.max_supply.toLocaleString()} ${coin.symbol.toUpperCase()}`

    $("#marketCap").html( marketCapLine )
    $("#totalVolume").html( totalVolumeLine )
    $("#circulatingSupply").html( circulatingSupplyLine )
    $("#maxSupply").html( maxSupplyLine )

    $("#marketCapInBtc").html( marketCapInBtcLine ) 
    $("#totalVolumeInBtc").html( totalVolumeInBtcLine ) 
  }
  catch (errMsg){
    throw ("In displayMarketStats(coin): " + errMsg)
  }
}

function displayDescription(coin) {
  try {
    const coinDescriptionLine = `<p>${coin.description.en}</p>`
    $("#coinDescription").html( coinDescriptionLine )
  }
  catch (errMsg){
    throw ("In displayDescription(coin): " + errMsg)
  }
}

function displayFooter(coin) {
  try {
    const footerHtml = `<p>Last updated: ${coin.last_updated}<p/>`
    $("#coinPageFooter").html( footerHtml )
  }
  catch (errMsg){
    throw ("In displayFooter(coin): " + errMsg)
  }
}

$("#myShowChartButton").click(async function () {
// Event handler to update the coin price graph
  try {
    // Get and save the new start date
    const startDate = $("#myDatepicker").datepicker("getDate")
    const daysAgo = Math.ceil( getDaysAgo(startDate) )
    const graphMetadata =  $("#"+idElementStoringCoinPriceGraphData).prop("graphMetadata")
    graphMetadata.startDaysAgo = daysAgo
    $("#"+idElementStoringCoinPriceGraphData).prop("graphMetadata", graphMetadata)
      
    // Get new graph's coin price coordinates
    const newCoinPriceHistory = await getCoinPriceHistory(graphMetadata)
    const graph = $("#"+idElementStoringCoinPriceGraphData).prop("graphData")
    graph.coordinates = newCoinPriceHistory.graph.coordinates
    $("#"+idElementStoringCoinPriceGraphData).prop("graphData", graph)

    // Display the graph
    displayGraph(graph)
  }
  catch (errMsg) {
    throw("In event handler: $('#myShowChartButton').click(async function ( ... ): " + errMsg)
  }
})

async function changeCurrencyOnCoinPage(currencyId) {
// Event Handler: Changes currency of both the price graph and all the coin statistics on page
  try {
    setCookie(currencyCookie, currencyId, cookieDurationInSeconds)
    currency2DP = newCurrencyFormater(currencyId, 2)
    currency0DP = newCurrencyFormater(currencyId, 0)

    // Update page metadata data to new currency
    const coinMetadata = $("#"+idElementStoringCoinData).prop("coinMetadata")
    const graphMetadata = $("#"+idElementStoringCoinPriceGraphData).prop("graphMetadata")
    const coin = $("#"+idElementStoringCoinData).prop("coinData")
    coinMetadata.currencyId = graphMetadata.currencyId = coin.currency_id = currencyId.toLowerCase()
    $("#"+idElementStoringCoinData).prop("coinMetadata", coinMetadata)
    $("#"+idElementStoringCoinPriceGraphData).prop("graphMetadata", graphMetadata)
    $("#"+idElementStoringCoinData).prop("coinData", coin)

    // Prepare graph data (in new currency)
    const data = await getCoinPriceHistory(graphMetadata)
    data.graph.style = getGraphStyle()
    data.graph.title = `Price of ${coin.name} (in ${data.graph.currency_id.toUpperCase()})`
    data.graph.currency_symbol = getCurrencySymbol(data.graph.currency_id)
    $("#"+idElementStoringCoinPriceGraphData).prop("graphData", data.graph)

    // Update the page
    displayGraph(data.graph)
    displayHeader(coin)
    displayPriceStats(coin)
    displayMarketStats(coin)
  }
  catch (errMsg) {
    throw("In EH changeCurrencyOnCoinPage(): " + errMsg)
  }
}