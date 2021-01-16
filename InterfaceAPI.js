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
            "&order=market_cap_desc&per_page=" + criteria.rowsPerPage +
            "&page=" + criteria.currentPageNumber + "&sparkline=false" +
            "&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
        return (this._BASE_URL + COINS_MARKET_ENDPOINT)
    },
    getCoinUrl: function(criteria) {
        const COIN_ENDPOINT = "/coins/" + criteria.coinId +
                "?localization=false&tickers=false&market_data=true" +
                "&community_data=true&developer_data=true&sparkline=false"
        return (this._BASE_URL + COIN_ENDPOINT)
    },
    getMarketChartUrl: function(criteria) {
        const startDate = getPreviousDate(criteria.graphStartDaysAgo)
        const startUnixTimestamp =  Math.floor(startDate.getTime() / 1000)
        const endUnixTimestamp = Math.floor(Date.now() / 1000)
        const MARKET_CHART_ENDPOINT = "/coins/" + criteria.coinId + 
                                    "/market_chart/range?vs_currency=" +
                                    criteria.currencyId.toLowerCase() +
                                    "&from=" + startUnixTimestamp +
                                    "&to=" + endUnixTimestamp        
        return (this._BASE_URL + MARKET_CHART_ENDPOINT)
    },
    getListAllExchangesUrl: function() {
      const EXCHANGE_LIST_ENDPOINT = "/exchanges/list"
      return (this._BASE_URL + EXCHANGE_LIST_ENDPOINT)
    },
    getExchangesUrl: function(criteria) {
      const EXCHANGES_ENDPOINT = "/exchanges" + 
          "?per_page=" + criteria.rowsPerPage +
          "&page=" + criteria.currentPageNumber
      return (this._BASE_URL + EXCHANGES_ENDPOINT)
  }
}

// FUNCTIONS FOR OBTAINING THE INDEX (HOME) PAGE DATA

async function getTheIndexPageData(criteria) {
  try {
    // Get the external data for the Index page
    const indexPage = await getExternalDataForIndexPage(criteria)

    // Set any other data required by page (ie. add to indexPage object) 
    // *** None required at present ***

    return indexPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheIndexPageData(criteria): " + errMsg)
  }
}

async function getExternalDataForIndexPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko),
    // For Coins:
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(criteria.coins)     
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl() 
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    // For Exchanges:
    const urlListAllExchangesApi = API_ENDPOINTS.getListAllExchangesUrl()
    const urlExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.exchanges)     

    let indexPageData = {}

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([ fetch(urlCoinsMarketApi), fetch(urlSupportedCurrenciesApi),
                        fetch(urlListAllCoinsApi), fetch(urlTrendingSearchesApi),
                        fetch(urlExchangesApi), fetch(urlListAllExchangesApi) ]
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
        throw("Error in getExternalDataForIndexPage(criteria): " + errMsg)
    })

    return indexPageData
  }
  catch (errMsg){
    throw ("In getExternalDataForIndexPage(criteria): " + errMsg)
  }
}

function collateIndexPage(rawCoinGekoData){
  try {
    // Prepare and collate data required by index page
    const indexPageData = { ... prepareCoins(rawCoinGekoData[0]),
                            ... prepareSupportedCurrencies(rawCoinGekoData[1]),
                            ... prepareListOfAllCoins(rawCoinGekoData[2]),
                            ... prepareListOfTrendingCoinSearches(rawCoinGekoData[3]),
                            ...prepareExchanges(rawCoinGekoData[4]),
//                            ...prepareListOfAllExchanges(rawCoinGekoData[5])
                          }
    return indexPageData
  }
  catch (errMsg){
    throw ("In collateIndexPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoins(rawCoinData) {
  try {
    // Select relevant coin data, adding fallback values for missing data
    let myCoinData = []
    for (let coin of rawCoinData) {
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
    throw ("In prepareCoins(rawCoinData): " + errMsg)
  }
}

function prepareSupportedCurrencies(rawCurrencyData) {
  try {
    // No preprocessing of list at present, so return all currencies
    return {"currencies_supported": rawCurrencyData}
  }
  catch (errMsg){
    throw ("In prepareSupportedCurrencies(rawCurrencyData): " + errMsg)
  }
}

function prepareListOfAllCoins(rawCoinList) {
  try {
    const coinList = { all_the_coins : [] }

    $.each(rawCoinList, function (index, coin) {
      // Add a nameline (to support future display and coin search)
      coin.nameLine = `${coin.name} (${coin.symbol})`
      coinList.all_the_coins[index] = coin
    })

    return coinList
  }
  catch (errMsg){
    throw ("In prepareListOfAllCoins(rawCoinList): " + errMsg)
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

function prepareExchanges(rawExchangeData) {
  try {
    // Select relevant exchange data, adding fallback values for missing data
    let myExchanges = []
    for (let exchange of rawExchangeData) {
        let relevantExchange = {
            "id": exchange.id ? exchange.id : "???",
            "name": exchange.name ? exchange.name : "???",
            "year_established": Number.isFinite(exchange.year_established) ?
                                                exchange.year_established : NaN,
            "country": exchange.country ? exchange.country : "Unknown",
            "description": exchange.description ? exchange.description : "Unavailable",
            "url": exchange.url ? exchange.url : "Unknown",
            "image": exchange.image ? exchange.image : "",  // Use "//:0" instead of ""?
            "has_trading_incentive": exchange.has_trading_incentive ?
                                     exchange.has_trading_incentive : "Unknown",
            "trust_score": Number.isFinite(exchange.trust_score) ? exchange.trust_score : NaN,
            "trust_score_rank": Number.isFinite(exchange.trust_score_rank) ?
                                                exchange.trust_score_rank : NaN,
            "trade_volume_24h_btc": Number.isFinite(exchange.trade_volume_24h_btc) ?
                                                                exchange.trade_volume_24h_btc : NaN,
            "trade_volume_24h_btc_normalized": Number.isFinite(exchange.trade_volume_24h_btc_normalized) ? 
                                                                exchange.trade_volume_24h_btc_normalized : NaN 
        }
        myExchanges.push(relevantExchange)
    }
    return {"exchanges": myExchanges}
  }
  catch (errMsg){
    throw ("In prepareExchanges(rawExchangeData): " + errMsg)
  }
}


async function getCoinTableData(coinsCriteria) {
  try {
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(coinsCriteria)

    // Fetch the coin data
    const callUrl = await fetch(urlCoinsMarketApi)
    const response = await callUrl.json()
    const data = await response

    return prepareCoins(data)
  }
  catch (errMsg){
    throw ("In getCoinTableData(coinsCriteria): " + errMsg)
  }
}

async function getExchangeTableData(criteria) {
  try {
    const urlExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria)

    // Fetch the exchanges data
    const callUrl = await fetch(urlExchangesApi)
    const response = await callUrl.json()
    const data = await response

    return prepareExchanges(data)
  }
  catch (errMsg){
    throw ("In getExchangeTableData(criteria): " + errMsg)
  }
}


// FUNCTIONS FOR OBTAINING THE COIN PAGE DATA

async function getTheCoinPageData(coinCriteria) {
  try {
    // Get the external data for the Coin page
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