/* Javascript data gathering functions for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

//
// CoinGeko API endpoint urls
//
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
    getCoinMarketChartUrl: function(criteria) {
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
    },
    getExchangeVolumeAndTickersUrl: function(criteria) {
      const EXCHANGE_ENDPOINT = "/exchanges/" + criteria.exchangeId
      return (this._BASE_URL + EXCHANGE_ENDPOINT)
    },
    getExchangeVolumeChartUrl: function(criteria) {
      const VOLUME_CHART_ENDPOINT = "/exchanges/" + criteria.exchangeId + 
                                  "/volume_chart?days=" + criteria.graphStartDaysAgo       
      return (this._BASE_URL + VOLUME_CHART_ENDPOINT)
  }
}

//
// FUNCTIONS FOR OBTAINING AND PREPARING DATA FOR THE INDEX (HOME) PAGE
//
async function getTheIndexPageData(criteria) {
  try {
    // Get the external data for the Index page
    const indexPage = await getApiDataForIndexPage(criteria)

    // Add supplementary data required by index page here ...
    // (None required at present)

    return indexPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheIndexPageData(criteria): " + errMsg)
  }
}

async function getApiDataForIndexPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko),
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(criteria.coins)     
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl() 
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    const urlListAllExchangesApi = API_ENDPOINTS.getListAllExchangesUrl()
    const urlExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.exchanges)     

    let indexPageData = {}

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([ fetch(urlCoinsMarketApi), fetch(urlSupportedCurrenciesApi),
                        fetch(urlListAllCoinsApi), fetch(urlTrendingSearchesApi),
                        fetch(urlExchangesApi)
                      ]
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
        throw("Error from async promise.all code: " + errMsg)
    })

    return indexPageData
  }
  catch (errMsg){
    throw ("In getApiDataForIndexPage(criteria): " + errMsg)
  }
}

function collateIndexPage(rawCoinGekoData){
// Collates data required by index page, processing raw data from api returns
  try {
    const indexPageData = { ... prepareCoins(rawCoinGekoData[0]),
                            ... prepareSupportedCurrencies(rawCoinGekoData[1]),
                            ... prepareListOfAllCoins(rawCoinGekoData[2]),
                            ... prepareListOfTrendingCoinSearches(rawCoinGekoData[3]),
                            ... prepareExchanges(rawCoinGekoData[4]),
                          }
    return indexPageData
  }
  catch (errMsg){
    throw ("In collateIndexPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoins(rawCoinData) {
// Select relevant coin data, adding fallback values for missing or invalid data
  try {
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
    // No preprocessing of raw currency data
    return {"currencies_supported": rawCurrencyData}
  }
  catch (errMsg){
    throw ("In prepareSupportedCurrencies(rawCurrencyData): " + errMsg)
  }
}

function prepareListOfAllCoins(rawCoinList) {
  try {
    const coinList = { all_the_coins : [] }

    // Add a nameline to each coin (to support future display and coin search)
    $.each(rawCoinList, function (index, coin) {
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
// Select relevant exchange data, adding fallback values for missing or invalid data
  try {
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
            "image": exchange.image ? exchange.image : "",  
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

async function getCoinTableData(criteria) {
  try {
    const url = API_ENDPOINTS.getCoinsMarketUrl(criteria)
    const coins = prepareCoins( await fetchApiData(url) )
    return coins
  }
  catch (errMsg){
    throw ("In getCoinTableData(criteria): " + errMsg)
  }
}

async function getExchangeTableData(criteria) {
  try {
    const url = API_ENDPOINTS.getExchangesUrl(criteria)
    const exchanges = prepareExchanges( await fetchApiData(url) )
    return exchanges
  }
  catch (errMsg){
    throw ("In getExchangeTableData(criteria): " + errMsg)
  }
}

//
// FUNCTIONS FOR OBTAINING AND PREPARING DATA FOR THE COIN DETAILS PAGE
//
async function getTheCoinDetailsPageData(criteria) {
  try {
    const coinDetailsPage = await getApiDataForCoinDetailsPage(criteria)
    
    // Add supplementary data required by coin details page
    coinDetailsPage.currency_id = criteria.currencyId.toLowerCase()

    return coinDetailsPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheCoinDetailsPageData(criteria): " + errMsg)
  }
}

async function getApiDataForCoinDetailsPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko)
    const urlCoinApi = API_ENDPOINTS.getCoinUrl( criteria )
    const urlMarketChartApi = API_ENDPOINTS.getCoinMarketChartUrl( criteria )
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl()
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    
    let coinDetailsPageData = {}

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
        coinDetailsPageData = collateCoinPage(data)
    })
    .catch(function (errMsg) {
        throw(errMsg)
    })

    return coinDetailsPageData
  }
  catch (errMsg){
    throw ("In getApiDataForCoinDetailsPage(criteria): " + errMsg)
  }
}

function collateCoinPage(rawCoinGekoData) {
// Prepare and collate data for the Coin page
  try {
    const coinPageData =  { ... prepareCoinInformation(rawCoinGekoData[0], rawCoinGekoData[2]),
                            ... prepareCoinPriceGraph(rawCoinGekoData[1]),
                            ... prepareListOfAllCoins(rawCoinGekoData[3]),
                            ... prepareListOfTrendingCoinSearches(rawCoinGekoData[4])
                          }
    return coinPageData
  }
  catch (errMsg){
    throw ("In collateCoinPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoinInformation(coinFromCoinGeko, currencies){
  try {
    let coin = coinFromCoinGeko   
    coin.market_data.currencies_supported = currencies

    // Remove unwanted data - only if not willing to keep in our data object
    // (ie. 'delete coin.unwanted_property')

    // Set fallback values (for any key properties that are missing or have invalid data values)
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

// FUNCTIONS FOR THE PRICE GRAPH DATA (ON COIN DETAILS PAGE)
//
function prepareCoinPriceGraph(marketChartDataFromCoinGeko) {
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
    throw ("In prepareCoinPriceGraph(marketChartDataFromCoinGeko): " + errMsg)
  }
}

async function getCoinGraphData(coinCriteria) {
  try {
    const url = API_ENDPOINTS.getCoinMarketChartUrl(coinCriteria)
    const graph = prepareCoinPriceGraph( await fetchApiData(url) )
    return graph
  }
  catch (errMsg){
    throw ("In getCoinGraphData(coinCriteria): " + errMsg)
  }
}

//
// FUNCTIONS FOR OBTAINING AND PREPARING DATA FOR THE EXCHANGE DETAILS PAGE
//
async function getTheExchangeDetailsPageData(criteria) {
  try {
    // Get the external data for the Index page
    const exchangeDetailsPage = await getApiDataForExchangeDetailsPage(criteria)

    // Add supplementary data required by exchange details page 
    exchangeDetailsPage.id = criteria.table.exchangeId

    return exchangeDetailsPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getTheExchangeDetailsPageData(criteria): " + errMsg)
  }
}

async function getApiDataForExchangeDetailsPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko)
    const urlExchangeVolumeAndTickersApi = API_ENDPOINTS.getExchangeVolumeAndTickersUrl(criteria.table)
    const urlExchangeVolumeChartApi = API_ENDPOINTS.getExchangeVolumeChartUrl(criteria.graph)
    const urlListAllExchangesApi = API_ENDPOINTS.getListAllExchangesUrl()
    const urlMostTrustedExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.searchSuggestions)     

    let exchangeDetailsPageData = {}

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([ fetch(urlExchangeVolumeAndTickersApi), fetch(urlExchangeVolumeChartApi),
                        fetch(urlListAllExchangesApi), fetch(urlMostTrustedExchangesApi) ]
    ).then(function (responses) {

        // Get a JSON object from all the responses (mapping each into an array)
        return Promise.all(responses.map(function (response) {
            return response.json()
        }))
    }).then(function (data) {

        // Preprocess and collate data
        exchangeDetailsPageData = collateExchangeDetailsPage(data)
    })
    .catch(function (errMsg) {
        throw(errMsg)
    })

    return exchangeDetailsPageData
  }
  catch (errMsg){
    throw ("In getApiDataForExchangeDetailsPage(criteria): " + errMsg)
  }
}

function collateExchangeDetailsPage(rawCoinGekoData){
  try {
    // Prepare and collate data required by page
    const exchangeDetailsPageData = { ... prepareExchangeInformation(rawCoinGekoData[0]),
                                      ... prepareGraphData(rawCoinGekoData[1]),
                                      ... prepareListOfAllExchanges(rawCoinGekoData[2]),
                                      ... prepareListExchangesWithHighestTrustScore(rawCoinGekoData[3])
                                    }
    return exchangeDetailsPageData
  }
  catch (errMsg){
    throw ("In collateExchangeDetailsPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareExchangeInformation(exchangeVolumeAndTickerCoingekoData) {
  try {
    // For now, take all the exchange data unproceessed
    let exchange = exchangeVolumeAndTickerCoingekoData   

    // Remove unwanted data here (if not willing to keep in our data object)
    // (ie. 'delete exchange.unwanted_property')

    // Set fallback values (for key properties missing appropriate values)
    if (!exchange.name) exchange.name = "???"
    if (!Number.isFinite(exchange.year_established)) exchange.year_established = NaN
    if (!exchange.country) exchange.country = "Country Unknown"
    if (!exchange.description) exchange.description = "Not available"
    if (!exchange.url) exchange.url = "Not available"
    if (!exchange.image) exchange.image = "" 
    if (typeof exchange.has_trading_incentive !== "boolean") exchange.has_trading_incentive = "Unknown"
    if (typeof exchange.centralized !== "boolean") exchange.centralized = "Unknown"
    if (!Number.isFinite(exchange.trust_score)) exchange.trust_score = NaN
    if (!Number.isFinite(exchange.trust_score_rank)) exchange.trust_score_rank = NaN
    if (!Number.isFinite(exchange.trade_volume_24h_btc)) exchange.trade_volume_24h_btc = NaN
    if (!Number.isFinite(exchange.trade_volume_24h_btc_normalized)) exchange.trade_volume_24h_btc_normalized = NaN

    // Set fallback values for trading pair data
    exchange.tickers = prepareTickers(exchangeVolumeAndTickerCoingekoData.tickers)

    return exchange
  }
  catch (errMsg){
    throw ("In prepareExchangeInformation(exchangeVolumeAndTickerCoingekoData): " + errMsg)
  }
}

function prepareTickers(tickerCoingekoData) {
// Set fallback value for each of the tickers (in the .tickers object)
  try {
    const tickers = tickerCoingekoData
    for (let i=0; i<tickers.length; i++)
    {
      tickers[i].import_order = i + 1  // new attribute for application

      if (!tickers[i].base) tickers[i].base = "???"
      if (!tickers[i].target) tickers[i].target = "???"

      // Set fallbacks for market object attributes:
      //  "market": {
      //    "name": "Coinbase Pro",
      //    "identifier": "gdax",
      //    "has_trading_incentive": false
      //  },

      if (!Number.isFinite(tickers[i].last)) tickers[i].last = NaN
      if (!Number.isFinite(tickers[i].volume)) tickers[i].volume = NaN

      // Set fallbacks for converted_last object attributes:
      //  "converted_last": {
      //    "btc": 0.99962016,
      //    "eth": 28.908702,
      //    "usd": 35383
      //  },

      // Set fallbacks for converted_volume object attributes:
      //  "converted_volume": {
      //    "btc": 19827,
      //    "eth": 573394,
      //    "usd": 701816809
      // },

      // Set fallbacks for following attributes:
      /*  
      "trust_score": "green",
      */
     if (!Number.isFinite(tickers[i].bid_ask_spread_percentage)) tickers[i].bid_ask_spread_percentage = NaN
      /*
      "timestamp": "2021-01-17T13:26:55+00:00",
      "last_traded_at": "2021-01-17T13:26:55+00:00",
      "last_fetch_at": "2021-01-17T13:26:55+00:00",
      "is_anomaly": false,
      "is_stale": false,
      "trade_url": "https://pro.coinbase.com/trade/BTC-USD",
      "token_info_url": null,
      "coin_id": "bitcoin"
      */
    }
    return tickers
  }
  catch (errMsg){
    throw ("In prepareTickers(tickerCoingekoData): " + errMsg)
  }
}

// FUNCTIONS FOR THE TRADING VOLUME GRAPH DATA (ON EXCAHNGE DETAILS PAGE)
//
// *** TODO: Refactor function below (and coin details page use of prepareCoinPriceGraph())
// *** so that it can be used for both Coin price graph and Exchange Volume graph
function prepareGraphData(rawChartCoingekoData) {
  try {
    const graphData = {
      graph: {
          xs: [],
          ys: [],
          chart_data_unprocessed : []
      }
    }
    graphData.graph.chart_data_unprocessed = rawChartCoingekoData

    // Obtain x & y data points (of dates & prices)
    const rawChartTable = [rawChartCoingekoData]

    rawChartTable[0].forEach(row => {
        const date = new Date(row[0])
        graphData.graph.xs.push(date.toLocaleDateString())
        const value = parseFloat(row[1])
        graphData.graph.ys.push(value)
    })

    return graphData
  }
  catch (errMsg){
    throw ("In prepareGraphData(rawChartCoingekoData): " + errMsg) 
  }
}

function prepareListOfAllExchanges(listOfAllExchangesCoingekoData) {
  try {
    const listAllExchanges = { all_the_exchanges : [] }

    // Add a nameline for each exchange (to support future display and exchange search)
    $.each(listOfAllExchangesCoingekoData, function (index, exchange) {
      exchange.nameLine = `${exchange.name} (${exchange.id})`
      listAllExchanges.all_the_exchanges[index] = exchange
    })

    return listAllExchanges
  }
  catch (errMsg){
    throw ("In prepareListOfAllExchanges(listOfAllExchangesCoingekoData): " + errMsg)
  }
}

function prepareListExchangesWithHighestTrustScore(highestTrustScoringExchangesCoingekoData) {
  try {
    const trustedExchangesList = { exchanges_with_highest_trustscore : [] } 

    $.each(highestTrustScoringExchangesCoingekoData, function (index, exchange) {
      let trustedExchange = {
        "id": exchange.id ? exchange.id : "???",
        "name": exchange.name ? exchange.name : "???",
        "image": exchange.image ? exchange.image : "",  
        "trust_score": Number.isFinite(exchange.trust_score) ? exchange.trust_score : NaN
      }
      // Add a nameline (to support future display)
      trustedExchange.nameLine = `${trustedExchange.name} (${trustedExchange.id}) [${trustedExchange.trust_score}/10]`

      trustedExchangesList.exchanges_with_highest_trustscore[index] = trustedExchange
    })

    return trustedExchangesList
  }
  catch (errMsg){
    throw ("In prepareListExchangesWithHighestTrustScore(highestTrustScoringExchangesCoingekoData): " + errMsg)
  }
}


async function getExchangeData(criteria) {
  try {
    const url = API_ENDPOINTS.getExchangeVolumeAndTickersUrl(criteria)
    const data = await fetchApiData(url)
    let exchange = prepareExchangeInformation(data)

    // Add supplementry data required by page
    exchange.id = criteria.exchangeId

    return exchange
  }
  catch (errMsg){
    throw ("In getExchangeData(criteria): " + errMsg)
  }
}
