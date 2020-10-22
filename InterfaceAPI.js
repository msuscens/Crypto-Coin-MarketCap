
/* Javascript data gathering functions for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check


// Global Object for getting CoinGeko API endpoint urls
const API_ENDPOINTS = {
    _BASE_URL: "https://api.coingecko.com/api/v3",

    getCoinsMarketUrl: function(currencyCode){
        const COINS_MARKET_ENDPOINT = "/coins/markets?vs_currency=" + currencyCode +
            "&order=market_cap_desc&per_page=100&page=1&sparkline=false" +
            "&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
        return (this._BASE_URL + COINS_MARKET_ENDPOINT)
    },

    getCoinUrl: function( coinCriteria ){
        const COIN_ENDPOINT = "/coins/" + coinCriteria.coinId +
                "?localization=false&tickers=false&market_data=true" +
                "&community_data=true&developer_data=true&sparkline=false"
        return (this._BASE_URL + COIN_ENDPOINT)
    },

    getMarketChartUrl: function( coinCriteria ){
        const startDate = getPreviousDate( coinCriteria.graphStartDaysAgo )
        const startUnixTimestamp =  Math.floor(startDate.getTime() / 1000)
        const endUnixTimestamp = Math.floor(Date.now() / 1000)
     
        const MARKET_CHART_ENDPOINT = "/coins/" + coinCriteria.coinId + 
                                    "/market_chart/range?vs_currency=" +
                                    coinCriteria.currencyId +
                                    "&from=" + startUnixTimestamp +
                                    "&to=" + endUnixTimestamp        
        return (this._BASE_URL + MARKET_CHART_ENDPOINT)
    },

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


// FUNCTIONS

function collateArrayCoins(coinDataFromCoingeko) {
    // Select relevant data and return this data subset in an object
    // TODO: Add data to object as required by application UI as it is developed (Work-In-Progress)

    let myCoinData = []
    for (let coin of coinDataFromCoingeko) {
        let relevantCoinData = {
            "id": coin.id ? coin.id : "???",
            "symbol": coin.symbol ? coin.symbol : "?",
            "name": coin.name ? coin.name : "???",
            "image": coin.image ? coin.image : "",
            "current_price": coin.current_price ? coin.current_price : NaN,
            "market_cap": coin.market_cap ? coin.market_cap : NaN,
            "market_cap_rank": coin.market_cap_rank ? coin.market_cap_rank : NaN,
            //            "fully_diluted_valuation": 223652560191,
            //            "total_volume": 23926356003,
            //            "high_24h": 10803.3,
            //            "low_24h": 10348.4,
            //            "price_change_24h": 281.32,
            //            "price_change_percentage_24h": coin.price_change_percentage_24h,
            //            "market_cap_change_24h": 4126861220,
            //            "market_cap_change_percentage_24h": 2.14057,
            //            "circulating_supply": 18489912,
            //            "total_supply": 21000000,
            //            "max_supply": 21000000,
            //            "ath": 19665.39,
            //            "ath_change_percentage": -45.49947,
            //            "ath_date": "2017-12-16T00:00:00.000Z",
            //            "atl": 67.81,
            //            "atl_change_percentage": 15705.78593,
            //            "atl_date": "2013-07-06T00:00:00.000Z",
            //            "roi": null,
            "last_updated": coin.last_updated ? coin.last_updated : "Unknown",
            "price_change_percentage_1h_in_currency": coin.price_change_percentage_1h_in_currency ?
                coin.price_change_percentage_1h_in_currency : NaN,
            "price_change_percentage_1y_in_currency": coin.price_change_percentage_1y_in_currency ?
                coin.price_change_percentage_1y_in_currency : NaN,
            "price_change_percentage_200d_in_currency": coin.price_change_percentage_200d_in_currency ?
                coin.price_change_percentage_200d_in_currency : NaN,
            "price_change_percentage_24h_in_currency": coin.price_change_percentage_24h_in_currency ?
                coin.price_change_percentage_24h_in_currency : NaN,
            "price_change_percentage_30d_in_currency": coin.price_change_percentage_30d_in_currency ?
                coin.price_change_percentage_30d_in_currency : NaN,
            "price_change_percentage_7d_in_currency": coin.price_change_percentage_7d_in_currency ?
                coin.price_change_percentage_7d_in_currency : NaN               
        }
        myCoinData.push(relevantCoinData)
    }

    return myCoinData
}


async function getTheIndexPageData( defaultCurrency )
{
    const coinsFromCoingeko = await getCoinsFromCoinGeko(defaultCurrency)

    return collateArrayCoins(coinsFromCoingeko)
}


async function getCoinsFromCoinGeko(defaultCurrency) {

    const urlCoinsMarketApi = API_ENDPOINTS.getCoinsMarketUrl(defaultCurrency)

    // Fetch the coins market data, decode into JSON format
    const callUrl = await fetch(urlCoinsMarketApi)
    const response = await callUrl.json()
    const data = await response

    // The coin data is now available:
    return data
}


// FUNCTIONS FOR OBTAINING THE COIN PAGE DATA

async function getTheCoinPageData(coinCriteria) {

    // Get the coin data from CoinGeko API
    const theCoin = await getCoinGekoData(coinCriteria)
        
        theCoin.currency_id = coinCriteria.currencyId

        console.log("In getTheCoin(): theCoin = ", theCoin)

        return theCoin
}

async function getCoinGekoData( coinCriteria ) {

    console.log("Inside getCoinGekoData()")

    // Get API URLs (ready for Coingeko API calls)
    const urlCoinApi = API_ENDPOINTS.getCoinUrl( coinCriteria )
    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl( coinCriteria )

    let coin = {}

    // Asynchronous multiple API calls to fetch all the data (for coin page).
    // Await all the data to be received and decoded, before the data is returned.
    await Promise.all([fetch(urlCoinApi), fetch(urlMarketChartApi)
    ]).then(function (responses) {

        // Get a JSON object from each of the two responses (mapping each into an array)
        return Promise.all(responses.map(function (response) {
            console.log("In getCoinGekoData(): About to returnresponse.json()")
            return response.json()

        }))
    }).then(function (data) {
        // Collate the relevant subset of required data
        console.log("In getCoinGekoData(): retreived data=", data )
        coin = collateCoinGeko(data)
        console.log("In getCoinGekoData(): coin = ", coin )
    })
    .catch(function (error) {
        console.log("Error in getCoinGekoData():", error)
    })

    return coin
}

function collateCoinGeko(data) {
    // Select relevant data and return this data subset in an object
    console.log("Inside collateCoinGeko(data): data =", data)

    // Collate all API returned datasets into single object
    const coinInfo =  { ... selectDataFromCoinApiReturn( data[0] ),
                        ... prepareGraphDataFromMarketChart( data[1] )
                      }

    console.log("Inside collateCoinGeko(data):About to return coinInfo object = ", coinInfo)

    return coinInfo
}



// FUNCTIONS FOR THE PRICE CHART DATA

function selectDataFromCoinApiReturn( data ){
// *** TODO: Select the actual object data fields that we want in our object
// *** And perform any error handling for missing data in any fields
// *** - e.g. if numeric field contains 'null' may want to replace value with NaN
    
    const selectedCoinData = data   // For now, take all the data unproceessed

    return selectedCoinData;
}



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
    //    const urlMarketChartApi = API_ENDPOINTS.getMarketChartUrl(chartParams)

    // Fetch the market data, decode into JSON format
    const callUrl = await fetch(urlMarketChartApi)
    const response = await callUrl.json()
    const data = await response;

    // All data is now available:
    const graphData = prepareGraphDataFromMarketChart( data )

    return graphData
}



/*  NO LONGER REQUIRED SINCE LIVE API DATA IS NOW FETCHED IN VIA : getTheIndexPageData()
function dummyGetCoins() {
    // Function to return hardcoded test data, as an array of coin data objects
    // The returned data is in the format that a Coingeko /coins/markets API call would return.
    // TODO: This function to be later replaced by async getCoins() function, that will use 
    //       a Coingeko API call to fetch current data for all coins.

    // Obtained from following CoinGeko manual API call:
    // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y
    
    const dummyCoinsFromCoingeko = [  
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
            "current_price": 10503.07,
            "market_cap": 194274079469,
            "market_cap_rank": 1,
            "fully_diluted_valuation": 220564519437,
            "total_volume": 22101415554,
            "high_24h": 10621.75,
            "low_24h": 10353.83,
            "price_change_24h": -73.53344731,
            "price_change_percentage_24h": -0.69525,
            "market_cap_change_24h": -1713465707.7485657,
            "market_cap_change_percentage_24h": -0.87427,
            "circulating_supply": 18496881,
            "total_supply": 21000000,
            "max_supply": 21000000,
            "ath": 19665.39,
            "ath_change_percentage": -46.59109,
            "ath_date": "2017-12-16T00:00:00.000Z",
            "atl": 67.81,
            "atl_change_percentage": 15389.20107,
            "atl_date": "2013-07-06T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-22T13:39:14.074Z",
            "price_change_percentage_1h_in_currency": 0.17655387593963567,
            "price_change_percentage_1y_in_currency": 5.060141559565952,
            "price_change_percentage_200d_in_currency": 16.198949410039436,
            "price_change_percentage_24h_in_currency": -0.6952461752609524,
            "price_change_percentage_30d_in_currency": -10.048597406575933,
            "price_change_percentage_7d_in_currency": -1.482247955801013
        },
        {
            "id": "ethereum",
            "symbol": "eth",
            "name": "Ethereum",
            "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
            "current_price": 343.19,
            "market_cap": 38718196975,
            "market_cap_rank": 2,
            "fully_diluted_valuation": null,
            "total_volume": 11144693841,
            "high_24h": 349.2,
            "low_24h": 333.64,
            "price_change_24h": -2.84049477,
            "price_change_percentage_24h": -0.82089,
            "market_cap_change_24h": -431270310.4556656,
            "market_cap_change_percentage_24h": -1.1016,
            "circulating_supply": 112707852.124,
            "total_supply": null,
            "max_supply": null,
            "ath": 1448.18,
            "ath_change_percentage": -76.31674,
            "ath_date": "2018-01-13T00:00:00.000Z",
            "atl": 0.432979,
            "atl_change_percentage": 79113.2205,
            "atl_date": "2015-10-20T00:00:00.000Z",
            "roi": {
            "times": 42.70632003682444,
            "currency": "btc",
            "percentage": 4270.632003682444
            },
            "last_updated": "2020-09-22T13:40:14.062Z",
            "price_change_percentage_1h_in_currency": 0.48996472852506384,
            "price_change_percentage_1y_in_currency": 59.36509535834315,
            "price_change_percentage_200d_in_currency": 50.46638873716337,
            "price_change_percentage_24h_in_currency": -0.8208914120823468,
            "price_change_percentage_30d_in_currency": -13.311913664067788,
            "price_change_percentage_7d_in_currency": -8.8230325565032
        },
        {
            "id": "tether",
            "symbol": "usdt",
            "name": "Tether",
            "image": "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707",
            "current_price": 1,
            "market_cap": 15240276539,
            "market_cap_rank": 3,
            "fully_diluted_valuation": null,
            "total_volume": 38600227529,
            "high_24h": 1,
            "low_24h": 0.998676,
            "price_change_24h": -0.00288852,
            "price_change_percentage_24h": -0.2876,
            "market_cap_change_24h": -26205179.82767868,
            "market_cap_change_percentage_24h": -0.17165,
            "circulating_supply": 15217973991.5316,
            "total_supply": 10166574840,
            "max_supply": null,
            "ath": 1.32,
            "ath_change_percentage": -24.30889,
            "ath_date": "2018-07-24T00:00:00.000Z",
            "atl": 0.572521,
            "atl_change_percentage": 74.92206,
            "atl_date": "2015-03-02T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-22T13:08:17.950Z",
            "price_change_percentage_1h_in_currency": 0.012501393943428673,
            "price_change_percentage_1y_in_currency": 0.2025667337939854,
            "price_change_percentage_200d_in_currency": 0.24237783337000526,
            "price_change_percentage_24h_in_currency": -0.2875994748662817,
            "price_change_percentage_30d_in_currency": 0.16409691812832597,
            "price_change_percentage_7d_in_currency": 0.0457882229834584
        },
        {
            "id": "ripple",
            "symbol": "xrp",
            "name": "XRP",
            "image": "https://assets.coingecko.com/coins/images/44/large/xrp.png?1564480400",
            "current_price": 0.232912,
            "market_cap": 10503735168,
            "market_cap_rank": 4,
            "fully_diluted_valuation": null,
            "total_volume": 1799191877,
            "high_24h": 0.238125,
            "low_24h": 0.229872,
            "price_change_24h": -0.00422082,
            "price_change_percentage_24h": -1.77993,
            "market_cap_change_24h": -194648000.17614937,
            "market_cap_change_percentage_24h": -1.81942,
            "circulating_supply": 45097364449,
            "total_supply": 100000000000,
            "max_supply": null,
            "ath": 3.4,
            "ath_change_percentage": -93.1753,
            "ath_date": "2018-01-07T00:00:00.000Z",
            "atl": 0.00268621,
            "atl_change_percentage": 8534.25496,
            "atl_date": "2014-05-22T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-22T13:39:58.660Z",
            "price_change_percentage_1h_in_currency": 0.3253267161713394,
            "price_change_percentage_1y_in_currency": -19.429020792951277,
            "price_change_percentage_200d_in_currency": -2.1371788616256637,
            "price_change_percentage_24h_in_currency": -1.7799349553799846,
            "price_change_percentage_30d_in_currency": -18.402023756762386,
            "price_change_percentage_7d_in_currency": -5.396017341706496
        },
        {
            "id": "bitcoin-cash",
            "symbol": "bch",
            "name": "Bitcoin Cash",
            "image": "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1594689492",
            "current_price": 215.12,
            "market_cap": 3986309059,
            "market_cap_rank": 5,
            "fully_diluted_valuation": null,
            "total_volume": 1957264926,
            "high_24h": 215.78,
            "low_24h": 209.88,
            "price_change_24h": -0.14989985,
            "price_change_percentage_24h": -0.06963,
            "market_cap_change_24h": -6204647.04031134,
            "market_cap_change_percentage_24h": -0.15541,
            "circulating_supply": 18524602.1467999,
            "total_supply": 21000000,
            "max_supply": null,
            "ath": 3785.82,
            "ath_change_percentage": -94.33234,
            "ath_date": "2017-12-20T00:00:00.000Z",
            "atl": 76.93,
            "atl_change_percentage": 178.89502,
            "atl_date": "2018-12-16T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-22T13:40:22.545Z",
            "price_change_percentage_1h_in_currency": 0.40626267308786795,
            "price_change_percentage_1y_in_currency": -30.967173302285417,
            "price_change_percentage_200d_in_currency": -35.447194849210526,
            "price_change_percentage_24h_in_currency": -0.06963200006342664,
            "price_change_percentage_30d_in_currency": -25.127564945180453,
            "price_change_percentage_7d_in_currency": -4.595919757957828
        },
       {
            "id": "polkadot",
            "symbol": "dot",
            "name": "Polkadot",
            "image": "https://assets.coingecko.com/coins/images/12171/large/aJGBjJFU_400x400.jpg?1597804776",
            "current_price": 4.13,
            "market_cap": 3794467024,
            "market_cap_rank": 6,
            "fully_diluted_valuation": 4218077323,
            "total_volume": 288441182,
            "high_24h": 4.21,
            "low_24h": 3.91,
            "price_change_24h": 0.01915725,
            "price_change_percentage_24h": 0.46577,
            "market_cap_change_24h": 2895277,
            "market_cap_change_percentage_24h": 0.07636,
            "circulating_supply": 916054056.117313,
            "total_supply": 997003189.017313,
            "max_supply": null,
            "ath": 6.8,
            "ath_change_percentage": -39.30094,
            "ath_date": "2020-09-01T07:49:43.390Z",
            "atl": 2.7,
            "atl_change_percentage": 53.0789,
            "atl_date": "2020-08-20T05:48:11.359Z",
            "roi": null,
            "last_updated": "2020-09-22T13:40:22.792Z",
            "price_change_percentage_1h_in_currency": 1.1171821772475605,
            "price_change_percentage_1y_in_currency": null,
            "price_change_percentage_200d_in_currency": null,
            "price_change_percentage_24h_in_currency": 0.4657724299431773,
            "price_change_percentage_30d_in_currency": -7.792804512974187,
            "price_change_percentage_7d_in_currency": -22.60706172881091
        },

        {
            "id": "binancecoin",
            "symbol": "bnb",
            "name": "Binance Coin",
            "image": "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png?1547034615",
            "current_price": 24.4,
            "market_cap": 3604177611,
            "market_cap_rank": 7,
            "fully_diluted_valuation": null,
            "total_volume": 462634389,
            "high_24h": 24.45,
            "low_24h": 22.42,
            "price_change_24h": 0.391408,
            "price_change_percentage_24h": 1.63003,
            "market_cap_change_24h": 34844686,
            "market_cap_change_percentage_24h": 0.97622,
            "circulating_supply": 147883948,
            "total_supply": 179883948,
            "max_supply": null,
            "ath": 39.68,
            "ath_change_percentage": -38.79697,
            "ath_date": "2019-06-22T12:20:21.894Z",
            "atl": 0.0398177,
            "atl_change_percentage": 60889.47953,
            "atl_date": "2017-10-19T00:00:00.000Z",
            "roi": null,
            "last_updated": "2020-09-22T13:39:49.708Z",
            "price_change_percentage_1h_in_currency": 0.3619026095433059,
            "price_change_percentage_1y_in_currency": 16.469612167172283,
            "price_change_percentage_200d_in_currency": 17.215324346441125,
            "price_change_percentage_24h_in_currency": 1.6300318444863342,
            "price_change_percentage_30d_in_currency": 10.046421433145122,
            "price_change_percentage_7d_in_currency": -21.816111752145627
        },
        {
            "id": "test",
            "symbol": null,
            "name": null,
            "image": null,
            "current_price": null,
            "market_cap": null,
            "market_cap_rank": null,
            "fully_diluted_valuation": null,
            "total_volume": null,
            "high_24h": null,
            "low_24h": null,
            "price_change_24h": null,
            "price_change_percentage_24h": null,
            "market_cap_change_24h": null,
            "market_cap_change_percentage_24h": null,
            "circulating_supply": null,
            "total_supply": null,
            "max_supply": null,
            "ath": null,
            "ath_change_percentage": null,
            "ath_date": null,
            "atl": null,
            "atl_change_percentage": null,
            "atl_date": null,
            "roi": null,
            "last_updated": null,
            "price_change_percentage_1h_in_currency": null,
            "price_change_percentage_1y_in_currency": null,
            "price_change_percentage_200d_in_currency": null,
            "price_change_percentage_24h_in_currency": null,
            "price_change_percentage_30d_in_currency": null,
            "price_change_percentage_7d_in_currency": null
        }
    ]

    return collateArrayCoins(dummyCoinsFromCoingeko)
}
*/