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
// THE INDEX (HOME) PAGE - DATA FUNCTIONS
//
async function getContentForIndexPage(criteria) {
  try {
    // Get the external (api) data 
    const data = await getApiDataForIndexPage(criteria)
    const indexPage = collateIndexPage(data)

    // Add supplementary data
    // ... None required at present

    return indexPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getContentForIndexPage(criteria): " + errMsg)
  }
}

async function getApiDataForIndexPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko),
    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(criteria.coins)     
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl() 
    const urlListAllCoinsApi = API_ENDPOINTS.getListAllCoinsUrl()
    const urlTrendingSearchesApi = API_ENDPOINTS.getTrendingSearchesUrl()
    const urlExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.exchanges)
    const urlListAllExchangesApi = API_ENDPOINTS.getListAllExchangesUrl()
    const urlMostTrustedExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.searchSuggestions)     

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    const allPromises = await Promise.all([fetch(urlCoinsMarketApi), fetch(urlSupportedCurrenciesApi),
                                          fetch(urlListAllCoinsApi), fetch(urlTrendingSearchesApi),
                                          fetch(urlExchangesApi), fetch(urlListAllExchangesApi),
                                          fetch(urlMostTrustedExchangesApi)])
    const response = Promise.all(allPromises.map(function (response) {
      return response.json()
    }))
    return await response

  } catch(err){
    throw ("In getApiDataForIndexPage(criteria): " + errMsg)
  }
}

function collateIndexPage(rawCoinGekoData){
  try {
    const indexPage = { ... prepareCoins(rawCoinGekoData[0]),
                        ... prepareSupportedCurrencies(rawCoinGekoData[1]),
                        ... prepareListOfAllCoins(rawCoinGekoData[2]),
                        ... prepareListOfTrendingCoinSearches(rawCoinGekoData[3]),
                        ... prepareExchanges(rawCoinGekoData[4]),
                        ... prepareListOfAllExchanges(rawCoinGekoData[5]),
                        ... prepareListExchangesWithHighestTrustScore(rawCoinGekoData[6])
                      }
    return indexPage
  }
  catch (errMsg){
    throw ("In collateIndexPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoins(rawCoinData) {
  try {
    let myCoins = []
    for (let coin of rawCoinData) {
        // Set fallback values (for missing or bad data)
        let processedCoin = {
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
        myCoins.push(processedCoin)
    }
    return {"coins": myCoins}
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
      coin = coin.item                                // remove 'item' level object (not needed)
      coin.nameLine = `${coin.name} (${coin.symbol})` // To support future display
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
    let myExchanges = []
    for (let exchange of rawExchangeData) {
        // Set fallback values (for missing or bad data)
        let processedExchange = {
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
        myExchanges.push(processedExchange)
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
// THE COIN DETAILS PAGE - DATA FUNCTIONS
//
async function getContentForCoinDetailsPage(criteria) {
  try {
    // Get the external (api) data 
    const data = await getApiDataForCoinDetailsPage(criteria)
    const coinDetailsPage = collateCoinDetailsPage(data)
    
    // Add supplementary data
    coinDetailsPage.currency_id = criteria.currencyId.toLowerCase()

    return coinDetailsPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js: getContentForCoinDetailsPage(criteria): " + errMsg)
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
    
    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    const allPromises = await Promise.all([fetch(urlCoinApi), fetch(urlMarketChartApi),
                                fetch(urlSupportedCurrenciesApi), fetch(urlListAllCoinsApi),
                                fetch(urlTrendingSearchesApi)])
    const response = Promise.all(allPromises.map(function (response) {
      return response.json()
    }))
    return await response

  } catch(err){
      throw ("In getApiDataForCoinDetailsPage(criteria): " + errMsg)
  }
}

function collateCoinDetailsPage(rawCoinGekoData) {
  try {
    const coinDetailsPage = { ... prepareCoin(rawCoinGekoData[0], rawCoinGekoData[2]),
                              ... prepareCoinPriceGraph(rawCoinGekoData[1]),
                              ... prepareListOfAllCoins(rawCoinGekoData[3]),
                              ... prepareListOfTrendingCoinSearches(rawCoinGekoData[4])
                            }
    return coinDetailsPage
  }
  catch (errMsg){
    throw ("In collateCoinDetailsPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareCoin(coinFromCoinGeko, currencies){
  try {
    let coin = coinFromCoinGeko   
    coin.market_data.currencies_supported = currencies

    // Remove unwanted data - only if not willing to keep in our data object
    // (ie. 'delete coin.unwanted_property')

    // Set fallback values (for missing or bad data)
    if (!coin.id) coin.id = "???"
    if (!coin.symbol) coin.symbol = "?"
    if (!coin.name) coin.name = "???"
    if (!coin.description) coin.description = "Not available."
    if (!coin.image.large) coin.image.large = ""   //  Use "//:0" or add default image?

    if ( !Number.isFinite( coin.market_data.max_supply ) ) coin.market_data.max_supply = NaN

    // Set fallback values for missing currency values
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
    
    // Set fallback values for other statistics
    if ( !Number.isFinite( coin.sentiment_votes_down_percentage ) ){
      coin.sentiment_votes_down_percentage = NaN
    }
    if ( !Number.isFinite( coin.sentiment_votes_up_percentage ) ){
      coin.sentiment_votes_up_percentage = NaN
    }

    return coin
  }
  catch (errMsg){
    throw ("In prepareCoin(coinFromCoinGeko): " + errMsg)
  }
}

// PRICE GRAPH DATA (ON COIN DETAILS PAGE)
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
// THE EXCHANGE DETAILS PAGE - DATA FUNCTIONS
//
async function getContentForExchangeDetailsPage(criteria) {
  try {
    // Get the external (api) data 
    const data = await getApiDataForExchangeDetailsPage(criteria)
    const exchangeDetailsPage = collateExchangeDetailsPage(data)

    // Add supplementary data  
    exchangeDetailsPage.id = criteria.table.exchangeId
    exchangeDetailsPage.graph.currency_id = "BTC"  // Trading voulume data in Bitcoin (btc)

    return exchangeDetailsPage
  }
  catch (errMsg){
    throw ("Error from InterfaceAPI.js getContentForExchangeDetailsPage(criteria): " + errMsg)
  }
}

async function getApiDataForExchangeDetailsPage(criteria) {
  try {
    // Get API URLs (for calls to CoinGeko)
    const urlExchangeVolumeAndTickersApi = API_ENDPOINTS.getExchangeVolumeAndTickersUrl(criteria.table)
    const urlExchangeVolumeChartApi = API_ENDPOINTS.getExchangeVolumeChartUrl(criteria.graph)
    const urlListAllExchangesApi = API_ENDPOINTS.getListAllExchangesUrl()
    const urlMostTrustedExchangesApi = API_ENDPOINTS.getExchangesUrl(criteria.searchSuggestions)     

    // Fetch all the data (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    const allPromises = await Promise.all( [ fetch(urlExchangeVolumeAndTickersApi),
                                fetch(urlExchangeVolumeChartApi), fetch(urlListAllExchangesApi),
                                fetch(urlMostTrustedExchangesApi) ] )
    const response = Promise.all(allPromises.map(function (response) {
                      return response.json()
                     }))
    return await response

  } catch(err){
    throw ("In getApiDataForExchangeDetailsPage(criteria): " + errMsg)
  }
}

function collateExchangeDetailsPage(rawCoinGekoData){
  try {
    // Prepare and collate data required by page
    const exchangeDetailsPage = { ... prepareExchange(rawCoinGekoData[0]),
                                  ... prepareGraphCoordinates(rawCoinGekoData[1]),
                                  ... prepareListOfAllExchanges(rawCoinGekoData[2]),
                                  ... prepareListExchangesWithHighestTrustScore(rawCoinGekoData[3])
                                }
    return exchangeDetailsPage
  }
  catch (errMsg){
    throw ("In collateExchangeDetailsPage(rawCoinGekoData): " + errMsg)
  }
}

function prepareExchange(exchangeVolumeAndTickerCoingekoData) {
  try {
    // For now, take all the exchange data unproceessed
    let exchange = exchangeVolumeAndTickerCoingekoData   

    // Remove unwanted data here (if not willing to keep in our data object)
    // (ie. 'delete exchange.unwanted_property')

    // Set fallback values (for missing or bad data)
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

    exchange.tickers = prepareTickers(exchangeVolumeAndTickerCoingekoData.tickers)

    return exchange
  }
  catch (errMsg){
    throw ("In prepareExchange(exchangeVolumeAndTickerCoingekoData): " + errMsg)
  }
}

function prepareTickers(tickerCoingekoData) {
  try {
    const tickers = tickerCoingekoData
    for (let i=0; i<tickers.length; i++)
    {
      tickers[i].import_order = i + 1  // new attribute (put in for ui)

      // Set fallbacks values (for missing or bad data)
      if (!tickers[i].base) tickers[i].base = "???"
      if (!tickers[i].target) tickers[i].target = "???"
      if (!Number.isFinite(tickers[i].last)) tickers[i].last = NaN
      if (!Number.isFinite(tickers[i].volume)) tickers[i].volume = NaN
      if (!Number.isFinite(tickers[i].bid_ask_spread_percentage)) tickers[i].bid_ask_spread_percentage = NaN
    }
    return tickers
  }
  catch (errMsg){
    throw ("In prepareTickers(tickerCoingekoData): " + errMsg)
  }
}

async function getExchangeData(criteria) {
  try {
    const url = API_ENDPOINTS.getExchangeVolumeAndTickersUrl(criteria)
    const data = await fetchApiData(url)
    let exchange = prepareExchange(data)

    // Add supplementry data required by page
    exchange.id = criteria.exchangeId

    return exchange
  }
  catch (errMsg){
    throw ("In getExchangeData(criteria): " + errMsg)
  }
}

// TRADING VOLUME GRAPH DATA (ON EXCAHNGE DETAILS PAGE)
//
function prepareGraphCoordinates(rawChartCoingekoData) {
  try {
    const graph = { coordinates: {
                      xs: [],
                      ys: []
                    }
                  }
    // Determine x & y points for graph
    rawChartCoingekoData.forEach(row => {
        const date = new Date(row[0])
        graph.coordinates.xs.push(date.toLocaleDateString())
        const value = parseFloat(row[1])
        graph.coordinates.ys.push(value)
    })
    return {graph: graph}
  }
  catch (errMsg){
    throw ("In prepareGraphCoordinates(rawChartCoingekoData): " + errMsg) 
  }
}

async function getTradingVolumeHistory(criteria) {
  try {
    const url = API_ENDPOINTS.getExchangeVolumeChartUrl(criteria)
    const graph = prepareGraphCoordinates( await fetchApiData(url) )
    return graph
  }
  catch (errMsg){
    throw ("In getTradingVolumeHistory(criteria): " + errMsg)
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
      // Set fallback values (for missing or bad data)
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
