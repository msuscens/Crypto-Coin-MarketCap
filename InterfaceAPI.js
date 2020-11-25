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

    getCoinsMarketUrl: function(currencyId) {
        const COINS_MARKET_ENDPOINT = "/coins/markets?vs_currency=" + currencyId.toLowerCase() +
            "&order=market_cap_desc&per_page=100&page=1&sparkline=false" +
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

    // *** NOT CURRENTLEY USED  ***
 /*
    getMarketUrl: function(coinId, currencyCode){
        const MARKET_ENDPOINT = "/coins/markets?vs_currency=" + currencyCode + "&ids=" + coinId +
            "&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=7d"
        return (this._BASE_URL + MARKET_ENDPOINT)
    }, 

    getHistoryUrl: function( coinId, numDaysAgo ){
        const startDate = getPreviousDate( numDaysAgo )
        const HISTORY_DAYS_AGO_ENDPOINT = "/coins/" + coinId + "/history?date=" +
                                        startDate.getDate() + "-" +
                                        startDate.getMonth() + "-" +
                                        startDate.getFullYear() + "&localization=false"
        return (this._BASE_URL + HISTORY_DAYS_AGO_ENDPOINT)
    }
*/
}


// FUNCTIONS FOR OBTAINING THE INDEX (HOME) PAGE DATA

async function getTheIndexPageData(currencyId) {

    
  const coinsFromCoingeko = await getCoinsFromCoinGeko(currencyId)

    return collateCoinsListData(coinsFromCoingeko)
}


async function getCoinsFromCoinGeko(currencyId) {

    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(currencyId)

    // Fetch the coins market data, decode into JSON format
    const callUrl = await fetch(urlCoinsMarketApi)
    const response = await callUrl.json()
    const data = await response

    // The coin data is now available:
    return data
}


function collateCoinsListData(coinDataFromCoingeko) {
    // Select relevant data and return this data subset in an object
    // TODO: Add data to object as required by application UI as it is developed (Work-In-Progress)

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
    return myCoinData
}


function getSupportedCurrencies(){
  // List of supported currencies for the Index (home) page.
      const supportedCurrencies = [
          "btc",
          "eth",
          "usd",
          "chf",
          "eur",
          "gbp",
          "hkd",
          "jpy",
          "cny"
      ]
      return supportedCurrencies
  }

  
// FUNCTIONS FOR OBTAINING THE COIN PAGE DATA

async function getTheCoinPageData(coinCriteria) {

    // Get the coin data from CoinGeko API
    const theCoin = await getSpecificCoinData(coinCriteria)
        
        theCoin.currency_id = coinCriteria.currencyId.toLowerCase()

        console.log("In getTheCoinPageData(): theCoin = ", theCoin)

        return theCoin
}

async function getSpecificCoinData(coinCriteria) {

    console.log("Inside getSpecificCoinData()")

    // Get API URLs
    const urlCoinApi = API_ENDPOINTS.getCoinUrl( coinCriteria )
    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl( coinCriteria )
    const urlSupportedCurrenciesApi = API_ENDPOINTS.getSupportedCurrenciesUrl()

    let coin = {}

    // Fetch all the data for the coin (via multiple simulataneous api calls)
    // Await for receipt and decoding of all data (before returning data set)
    await Promise.all([fetch(urlCoinApi), fetch(urlMarketChartApi), fetch(urlSupportedCurrenciesApi)
    ]).then(function (responses) {

        // Get a JSON object from each of the two responses (mapping each into an array)
        return Promise.all(responses.map(function (response) {
            return response.json()
        }))
    }).then(function (data) {
        // Collate the relevant subset of required data
        console.log("In getSpecificCoinData(): retreived data=", data )
        coin = collateCoinDataFromCoinGeko(data)
        console.log("In getSpecificCoinData(): coin = ", coin )
    })
    .catch(function (error) {
        console.log("Error in getSpecificCoinData():", error)
    })

    return coin
}

function collateCoinDataFromCoinGeko( rawData ){
    // Select relevant data and return this data subset in an object
    console.log("Inside collateCoinDataFromCoinGeko(rawData): rawData =", rawData)

    // Collate all API returned datasets into single object
    const coinInfo =  { ... preprocessCoinApiReturn( rawData[0], rawData[2] ),
                        ... prepareGraphDataFromMarketChart( rawData[1] )
                      }

    console.log("Inside collateCoinGeko(rawData):About to return collated coinInfo object = ", coinInfo)

    return coinInfo
}


function preprocessCoinApiReturn( data, currencies ){

    // For now, take all the data unproceessed
    let coin = data   
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
    
    return coin
}


// FUNCTIONS FOR THE PRICE CHART DATA

function prepareGraphDataFromMarketChart ( data ){

    const graphData = {
        price_graph: {
            xs: [],
            ys: []
        }
    }
 
    // Obtain x & y data points (of dates & prices)
    const pricesTable = [data.prices]

    pricesTable[0].forEach(row => {
        const date = new Date(row[0])
        graphData.price_graph.xs.push(date.toLocaleDateString())
        const price = row[1]
        graphData.price_graph.ys.push(price)
    })
    
    return graphData
}


async function getCoinGraphData(coinCriteria) {

    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl(coinCriteria)

    // Fetch the market data, decode into JSON format
    const callUrl = await fetch(urlMarketChartApi)
    const response = await callUrl.json()
    const data = await response

    // All data is now available:
    const graphData = prepareGraphDataFromMarketChart( data )

    return graphData
}


// FUNCTIONS TO PROVIDE THE SEARCH COMPONENT DATA

function getAvailableCoins() {
// Hardcoded Test Data
// Extract from data return from: https://api.coingecko.com/api/v3/coins/list

    const allCoins = [
      {
        "id": "aave",
        "symbol": "aave",
        "name": "Aave"
      },
      {
        "id": "aave-dai",
        "symbol": "adai",
        "name": "Aave DAI"
      },
      {
        "id": "aave-eth",
        "symbol": "aeth",
        "name": "Aave ETH"
      },
      {
        "id": "abc-chain",
        "symbol": "abc",
        "name": "ABC Chain"
      },
      {
        "id": "beam",
        "symbol": "beam",
        "name": "BEAM"
      },
      {
        "id": "bean-cash",
        "symbol": "bitb",
        "name": "Bean Cash"
      },
      {
        "id": "beat",
        "symbol": "beat",
        "name": "BEAT"
      },
      {
        "id": "beaxy-exchange",
        "symbol": "bxy",
        "name": "Beaxy"
      },
      {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin"
      },
      {
        "id": "bitcoin-2",
        "symbol": "btc2",
        "name": "Bitcoin 2"
      },
      {
        "id": "bitcoin-5000",
        "symbol": "bvk",
        "name": "Bitcoin 5000"
      },
      {
        "id": "bitcoin-adult",
        "symbol": "btad",
        "name": "Bitcoin Adult"
      },
      {
        "id": "bitcoin-air",
        "symbol": "xba",
        "name": "Bitcoin Air"
      },
      {
        "id": "bitcoin-atom",
        "symbol": "bca",
        "name": "Bitcoin Atom"
      },
      {
        "id": "bitcoinbam",
        "symbol": "btcbam",
        "name": "BitcoinBam"
      },
      {
        "id": "bitcoin-cash",
        "symbol": "bch",
        "name": "Bitcoin Cash"
      },
      {
        "id": "bitcoin-cash-sv",
        "symbol": "bsv",
        "name": "Bitcoin SV"
      }
    ]

    $.each(allCoins, function (index, coin) {
      coin.nameLine = `${coin.name} (${coin.symbol})`
    })

    return allCoins
}

function getMostPopularCoinSearches() {
// Hardcoded Test Data 
// Data return from: https://api.coingecko.com/api/v3/search/trending


    const mostPopularSearches = [
        {
            "coins": [
              {
                "item": {
                  "id": "hegic",
                  "name": "Hegic",
                  "symbol": "HEGIC",
                  "market_cap_rank": 155,
                  "thumb": "https://assets.coingecko.com/coins/images/12454/thumb/Hegic.png?1599938210",
                  "large": "https://assets.coingecko.com/coins/images/12454/large/Hegic.png?1599938210",
                  "score": 0
                }
              },
              {
                "item": {
                  "id": "team-finance",
                  "name": "Team Finance",
                  "symbol": "TEAM",
                  "market_cap_rank": 664,
                  "thumb": "https://assets.coingecko.com/coins/images/12480/thumb/team_token_logo.jpg?1600158847",
                  "large": "https://assets.coingecko.com/coins/images/12480/large/team_token_logo.jpg?1600158847",
                  "score": 1
                }
              },
              {
                "item": {
                  "id": "wabi",
                  "name": "Wabi",
                  "symbol": "WABI",
                  "market_cap_rank": 544,
                  "thumb": "https://assets.coingecko.com/coins/images/1338/thumb/Tael.png?1547035364",
                  "large": "https://assets.coingecko.com/coins/images/1338/large/Tael.png?1547035364",
                  "score": 2
                }
              },
              {
                "item": {
                  "id": "axie-infinity",
                  "name": "Axie Infinity",
                  "symbol": "AXS",
                  "market_cap_rank": 313,
                  "thumb": "https://assets.coingecko.com/coins/images/13029/thumb/axie_infinity_logo.png?1604471082",
                  "large": "https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png?1604471082",
                  "score": 3
                }
              },
              {
                "item": {
                  "id": "aave",
                  "name": "Aave",
                  "symbol": "AAVE",
                  "market_cap_rank": 33,
                  "thumb": "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110",
                  "large": "https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1601374110",
                  "score": 4
                }
              },
              {
                "item": {
                  "id": "renbtc",
                  "name": "renBTC",
                  "symbol": "RENBTC",
                  "market_cap_rank": 55,
                  "thumb": "https://assets.coingecko.com/coins/images/11370/thumb/renBTC.png?1589985711",
                  "large": "https://assets.coingecko.com/coins/images/11370/large/renBTC.png?1589985711",
                  "score": 5
                }
              },
              {
                "item": {
                  "id": "keep3rv1",
                  "name": "Keep3rV1",
                  "symbol": "KP3R",
                  "market_cap_rank": 220,
                  "thumb": "https://assets.coingecko.com/coins/images/12966/thumb/keep3vr_logo.jpg?1603878182",
                  "large": "https://assets.coingecko.com/coins/images/12966/large/keep3vr_logo.jpg?1603878182",
                  "score": 6
                }
              }
            ],
            "exchanges": []
        }
    ]

    $.each(mostPopularSearches[0].coins, function (index, coin) {
      coin.item.nameLine = `${coin.item.name} (${coin.item.symbol}) #${coin.item.market_cap_rank}`
    })

    return mostPopularSearches[0].coins
}