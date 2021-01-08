/* Javascript data gathering functions for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check


// Global Object for getting CoinGeko API endpoint urls
const API_ENDPOINTS = {
    _BASE_URL: "https://api.coingecko.com/api/v3",

    getSupportedCurrenciesUrl: function() {
        const SUPPORTED_CURRENCIES_ENDPOINT = "/simple/supported_vs_currencies"
        return (this._BASE_URL + SUPPORTED_CURRENCIES_ENDPOINT)
    },

    getListAllCoinsUrl: function() {
      const COIN_LIST_ENDPOINT = "/coins/list"
      return (this._BASE_URL + COIN_LIST_ENDPOINT)
    },

    getTrendingSearchesUrl: function() {
      const TRENDING_SEARCHES_ENDPOINT = "/search/trending"
      return (this._BASE_URL + TRENDING_SEARCHES_ENDPOINT)
    },

    getCoinsMarketUrl: function(criteria) {
        const COINS_MARKET_ENDPOINT = "/coins/markets?vs_currency=" + criteria.currencyId +
            "&order=market_cap_desc&per_page=" + criteria.numberCoinsPerPage +
            "&page=" + criteria.currentPageNumber + "&sparkline=false" +
            "&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
        return (this._BASE_URL + COINS_MARKET_ENDPOINT)
    },

    getCoinUrl: function(coinCriteria) {
        const COIN_ENDPOINT = "/coins/" + coinCriteria.coinId +
                "?localization=false&tickers=false&market_data=true" +
                "&community_data=true&developer_data=true&sparkline=false"
        return (this._BASE_URL + COIN_ENDPOINT)
    },

    getMarketChartUrl: function(coinCriteria) {
        const startDate = getPreviousDate( coinCriteria.graphStartDaysAgo )
        const startUnixTimestamp =  Math.floor(startDate.getTime() / 1000)
        const endUnixTimestamp = Math.floor(Date.now() / 1000)
     
        const MARKET_CHART_ENDPOINT = "/coins/" + coinCriteria.coinId + 
                                    "/market_chart/range?vs_currency=" +
                                    coinCriteria.currencyId.toLowerCase() +
                                    "&from=" + startUnixTimestamp +
                                    "&to=" + endUnixTimestamp        
        return (this._BASE_URL + MARKET_CHART_ENDPOINT)
    }
}


// FUNCTIONS FOR OBTAINING THE INDEX (HOME) PAGE DATA

async function getTheIndexPageData(coinCriteria) {
  try {
    // Get the external datafor the Coin page
    const indexPage = await getExternalDataForIndexPage(coinCriteria)

    // Any other data required by page: Add to indexPage object 
    // *** None required at present ***

    return indexPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheIndexPageData(coinCriteria): " + errMsg)
  }
}

async function getExternalDataForIndexPage(coinCriteria) {
  try {
    // Get API URLs (for calls to CoinGeko), for ...
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(coinCriteria)     
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl() 
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    
    let indexPageData = {}

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([ fetch(urlCoinsMarketApi), fetch(urlSupportedCurrenciesApi),
                        fetch(urlListAllCoinsApi), fetch(urlTrendingSearchesApi) ]
    ).then(function (responses) {

        // Get a JSON object from all the responses (mapping each into an array)
        return Promise.all(responses.map(function (response) {
            return response.json()
        }))
    }).then(function (data) {
        // Preprocess and collate data
        indexPageData = collateIndexPage(data)
    })
    .catch(function (errMsg) {
        throw("Error in getExternalDataForIndexPage(coinCriteria): " + errMsg)
    })

    return indexPageData
  }
  catch (errMsg){
    throw ("In getExternalDataForIndexPage(coinCriteria): " + errMsg)
  }
}

function collateIndexPage(rawCoinGekoData){
  try {
    // Prepare and collate data required by index page
    const indexPageData = { ... prepareCoinTable(rawCoinGekoData[0]),
                            ... prepareListOfSupportedCurrencies(rawCoinGekoData[1]),
                            ... prepareListOfAllCoins(rawCoinGekoData[2]),
                            ... prepareListOfTrendingCoinSearches(rawCoinGekoData[3])
                          }
    return indexPageData
  }
  catch (errMsg){
    throw ("In collateIndexPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoinTable(coinDataFromCoingeko) {
  try {
    // Select relevant data, adding fallback values for missing data
    let myCoinData = []
    for (let coin of coinDataFromCoingeko) {
        let relevantCoinData = {
            "id": coin.id ? coin.id : "???",
            "symbol": coin.symbol ? coin.symbol : "?",
            "name": coin.name ? coin.name : "???",
            "image": coin.image ? coin.image : "",  // Use "//:0" instead of ""?
            "current_price": Number.isFinite(coin.current_price) ? coin.current_price : NaN,
            "market_cap": Number.isFinite(coin.market_cap) ? coin.market_cap : NaN,
            "market_cap_rank": Number.isFinite(coin.market_cap_rank) ? coin.market_cap_rank : NaN,
            "last_updated": coin.last_updated ? coin.last_updated : "Unknown",
            "price_change_percentage_1h_in_currency": Number.isFinite(coin.price_change_percentage_1h_in_currency) ?
                coin.price_change_percentage_1h_in_currency : NaN,
            "price_change_percentage_1y_in_currency": Number.isFinite(coin.price_change_percentage_1y_in_currency) ?
                coin.price_change_percentage_1y_in_currency : NaN,
            "price_change_percentage_200d_in_currency": Number.isFinite(coin.price_change_percentage_200d_in_currency) ?
                coin.price_change_percentage_200d_in_currency : NaN,
            "price_change_percentage_24h_in_currency": Number.isFinite(coin.price_change_percentage_24h_in_currency) ?
                coin.price_change_percentage_24h_in_currency : NaN,
            "price_change_percentage_30d_in_currency": Number.isFinite(coin.price_change_percentage_30d_in_currency) ?
                coin.price_change_percentage_30d_in_currency : NaN,
            "price_change_percentage_7d_in_currency": Number.isFinite(coin.price_change_percentage_7d_in_currency) ?
                coin.price_change_percentage_7d_in_currency : NaN               
        }
        myCoinData.push(relevantCoinData)
    }
    return {"coins": myCoinData}
  }
  catch (errMsg){
    throw ("In prepareCoinTable(coinDataFromCoingeko): " + errMsg)
  }
}

function prepareListOfSupportedCurrencies(currencies) {
  try {
    // No preprocessing of list at present, so return all currencies
    return {"currencies_supported": currencies}
  }
  catch (errMsg){
    throw ("In prepareListOfSupportedCurrencies(currencies): " + errMsg)
  }
}

function prepareListOfAllCoins(allCoinsFromCoinGeko) {
  try {
    const coinList = { all_the_coins : [] }

    $.each(allCoinsFromCoinGeko, function (index, coin) {
      // Add a nameline (to support future display and coin search)
      coin.nameLine = `${coin.name} (${coin.symbol})`
      coinList.all_the_coins[index] = coin
    })

    return coinList
  }
  catch (errMsg){
    throw ("In prepareListOfAllCoins(data): " + errMsg)
  }
}

function prepareListOfTrendingCoinSearches(trendingSearchesFromCoinGeko) {
  try {
    const trendingCoinList = { trending_coin_searches : [] } 

    $.each(trendingSearchesFromCoinGeko.coins, function (index, coin) {
      // Removing 'item' level object (that holds each data object with coin details)
      coin = coin.item

      // Add a nameline (to support future display)
      coin.nameLine = `${coin.name} (${coin.symbol})`

      trendingCoinList.trending_coin_searches[index] = coin
    })

    return trendingCoinList
  }
  catch (errMsg){
    throw ("In prepareListOfTrendingCoinSearches(trendingSearchesFromCoinGeko): " + errMsg)
  }
}


async function getCoinTableData(coinCriteria) {
  try {
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(coinCriteria)

    // Fetch the coin data
    const callUrl = await fetch(urlCoinsMarketApi)
    const response = await callUrl.json()
    const data = await response

    return prepareCoinTable( data )
  }
  catch (errMsg){
    throw ("In getCoinTableData(coinCriteria): " + errMsg)
  }
}


// FUNCTIONS FOR OBTAINING THE COIN PAGE DATA

async function getTheCoinPageData(coinCriteria) {
  try {
    // Get the external datafor the Coin page
    const coinPage = await getExternalDataForCoinPage(coinCriteria)
    
    // Add any other data required by the Coin Page
    coinPage.currency_id = coinCriteria.currencyId.toLowerCase()

    return coinPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheCoinPageData(coinCriteria): " + errMsg)
  }
}

async function getExternalDataForCoinPage(coinCriteria) {
  try {
    // Get API URLs (for calls to CoinGeko)
    const urlCoinApi = API_ENDPOINTS.getCoinUrl( coinCriteria )
    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl( coinCriteria )
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl()
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    
    let coinPageData = {}

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([ fetch(urlCoinApi), fetch(urlMarketChartApi), fetch(urlSupportedCurrenciesApi),
                        fetch(urlListAllCoinsApi), fetch(urlTrendingSearchesApi) ]
    ).then(function (responses) {

        // Get a JSON object from all responses (mapping each into an array)
        return Promise.all(responses.map(function (response) {
            return response.json()
        }))
    }).then(function (data) {
        // Preprocess and collate returned API data (so that its ready for use by Coin page)
        coinPageData = collateCoinPage(data)
    })
    .catch(function (errMsg) {
        throw("Error in getExternalDataForCoinPage(coinCriteria): " + errMsg)
    })

    return coinPageData
  }
  catch (errMsg){
    throw ("In getExternalDataForCoinPage(coinCriteria): " + errMsg)
  }
}


function collateCoinPage(rawCoinGekoData){
  try {
    // Prepare and collate data required by the Coin page
    const coinPageData =  { ... prepareCoinInformation(rawCoinGekoData[0], rawCoinGekoData[2]),
                            ... preparePriceGraph(rawCoinGekoData[1]),
                            ... prepareListOfAllCoins(rawCoinGekoData[3]),
                            ... prepareListOfTrendingCoinSearches(rawCoinGekoData[4])
                          }
    return coinPageData
  }
  catch (errMsg){
    throw ("In collateCoinPage(rawCoinGekoData): " + errMsg)
  }
}

// FUNCTIONS TO COLLATE & AUGMENT COINGEKO API RETURN DATA INTO APPLICATIONS DATASTRUCTURE FORMAT

function prepareCoinInformation(coinFromCoinGeko, currencies){
  try {
    // For now, take all the coin data unproceessed
    let coin = coinFromCoinGeko   
    coin.market_data.currencies_supported = currencies

    // Remove unwanted data - only if not willing to keep in our data object
    // (ie. 'delete coin.unwanted_property')

    // Set fallback values (for any key properties that are missing data values)
    if (!coin.id) coin.id = "???"
    if (!coin.symbol) coin.symbol = "?"
    if (!coin.name) coin.name = "???"
    if (!coin.description) coin.description = "Not available."
    if (!coin.image.large) coin.image.large = ""   //  Use "//:0" or add default image?

    if ( !Number.isFinite( coin.market_data.max_supply ) ) coin.market_data.max_supply = NaN

    // Set fallback value (to NaN) on each key property with missing currency values
    for (let currency of currencies){
        if ( !Number.isFinite( coin.market_data.price_change_percentage_1y_in_currency[currency] ) ){
            coin.market_data.price_change_percentage_1y_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_200d_in_currency[currency] ) ){
            coin.market_data.price_change_percentage_200d_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_60d_in_currency[currency]) ){
            coin.market_data.price_change_percentage_60d_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_30d_in_currency[currency] ) ){
            coin.market_data.price_change_percentage_30d_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_14d_in_currency[currency] ) ){
            coin.market_data.price_change_percentage_14d_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_7d_in_currency[currency] ) ){
            coin.market_data.price_change_percentage_7d_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_24h_in_currency[currency]) ){
            coin.market_data.price_change_percentage_24h_in_currency[currency] = NaN
        }
        if ( !Number.isFinite( coin.market_data.price_change_percentage_1h_in_currency[currency]) ){
            coin.market_data.price_change_percentage_1h_in_currency[currency] = NaN
        }

        // Add others here as necessary: EG.
          // current_price[currency], atl[currency], ath[currency], ath_change_percentage[currency],
          // atl_change_percentage[currency], market_cap[currency], fully_diluted_valuation[currency],
          // total_volume[currency], low_24hr[currency], high_24hr[currency],
          // market_cap_change_24h_in_currency[currency],
          // market_cap_change_percentage_24h_in_currency[currency]
    }
    
    // Set fallback value (to NaN) on other (non-currency dependent) statistics
    if ( !Number.isFinite( coin.sentiment_votes_down_percentage ) ){
      coin.sentiment_votes_down_percentage = NaN
    }
    if ( !Number.isFinite( coin.sentiment_votes_up_percentage ) ){
      coin.sentiment_votes_up_percentage = NaN
    }

    return coin
  }
  catch (errMsg){
    throw ("In prepareCoinInformation(coinFromCoinGeko): " + errMsg)
  }
}


// FUNCTIONS FOR THE PRICE CHART DATA

function preparePriceGraph(marketChartDataFromCoinGeko) {
  try {
    const graphData = {
        price_graph: {
            xs: [],
            ys: []
        }
    }
    // Obtain x & y data points (of dates & prices)
    const pricesTable = [marketChartDataFromCoinGeko.prices]

    pricesTable[0].forEach(row => {
        const date = new Date(row[0])
        graphData.price_graph.xs.push(date.toLocaleDateString())
        const price = row[1]
        graphData.price_graph.ys.push(price)
    })
    
    return graphData
  }
  catch (errMsg){
    throw ("In preparePriceGraph(marketChartDataFromCoinGeko): " + errMsg)
  }
}

async function getCoinGraphData(coinCriteria) {
  try {
    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl(coinCriteria)

    // Fetch the market data, decode into JSON format
    const callUrl = await fetch(urlMarketChartApi)
    const response = await callUrl.json()
    const data = await response

    // All data is now available:
    const graphData = preparePriceGraph( data )

    return graphData
  }
  catch (errMsg){
    throw ("In getCoinGraphData(coinCriteria): " + errMsg)
  }
}