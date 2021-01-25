/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check


// Where to store and retrive the table data and table meta data
const idElementStoringCoinsTableData = "coinsNavTabArea"
const idElementStoringExchangesTableData = "exchangesNavTabArea"

// Use cookie for default currency
const fallbackCurrency = "usd"
let defaultCurrency = null
if ( checkCookie(currencyCookie) == true ) defaultCurrency = getCookie(currencyCookie)
else defaultCurrency = fallbackCurrency
setCookie(currencyCookie, defaultCurrency, cookieDurationInSeconds) // set or refresh cookie

// Metadata on the Coins and Exchanges tables 
const metadataForPage = {
  coins: {
    currencyId: defaultCurrency.toLowerCase(),
    rowsPerPage: 100,
    currentPageNumber: 1,
    loadTableDataFunction: reloadCoinsTable,
    populateTableFunction: populateCoinsTable
  },
  exchanges: {
    rowsPerPage: 100,
    currentPageNumber: 1,
    loadTableDataFunction: reloadExchangesTable,
    populateTableFunction: populateExchangesTable
  },
  searchSuggestions: {
    rowsPerPage: 8,    
    currentPageNumber: 1
  }
}
// Save tables meta data (in html nav tab that cointains each table)
$("#"+idElementStoringCoinsTableData).prop("tableMetadata", metadataForPage.coins)
$("#"+idElementStoringExchangesTableData).prop("tableMetadata", metadataForPage.exchanges)


// Initialise the currency formatter functions (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater(defaultCurrency, 2)
let currency0DP = newCurrencyFormater(defaultCurrency, 0)

try {
    // Fetch the live data
    getContentForIndexPage(metadataForPage)
    .then (
        (data) => {
            // Save coins and exchanges data (into the html nav tab that contains each table)
            $("#"+idElementStoringCoinsTableData).prop("tableData", data.coins)
            $("#"+idElementStoringExchangesTableData).prop("tableData", data.exchanges)

            // Display Coin table (in coin nav tab)
            populateCoinsTable(data.coins)
            populateCoinsTableFooter(data.coins)

            // Add the currency selector component onto the page
            const selectorCriteria =  { id: "currencySelectorComponent",
                                        currencies: data.currencies_supported,
                                        selectedCurrency: defaultCurrency,
                                        currencyUpdateFunc: changeCoinTableCurrency
                                      }
            const currencySelector = new CurrencySelectorComponent(selectorCriteria)

            // Save currency selector object (in the html div of currency selector)
            $("#currencySelectorComponent").prop("currencySelectorObject", currencySelector)

            // Add a coin search component onto the page
            const criteriaCoinSearch = { idSC: "coinSearchComponent",
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
                                        maxItemsInSearchList : 8                                           
                                       }
            new CoinSearchComponent(criteriaCoinSearch)

            // Add a hidden exchange search component onto the page
            $("#exchangeSearchComponent").hide()
            const criteriaExchangeSearch = { idSC: "exchangeSearchComponent",
                                        idSCForm: "exchangeSearchForm",
                                        idSCInput: "exchangeSearchInput",
                                        idSCList: "exchangeSearchList",
                                        textSC: { input_title: "Type in an Exchange name or id",
                                                  input_placeholder: "Search for an exchange...",
                                                  suggestions_list_title: "Top Exchanges [trust score]:",
                                                  searchPool_list_title: "Exchange matches:"
                                                },
                                        searchPool: data.all_the_exchanges,
                                        suggestions: data.exchanges_with_highest_trustscore,
                                        maxItemsInSearchList : metadataForPage.searchSuggestions.rowsPerPage                                           
            }
            new ExchangeSearchComponent(criteriaExchangeSearch)

            // Display Exchanges table (in exchanges nav tab)
            populateExchangesTable(data.exchanges)
          }  
    )
} catch (errMsg) {
    console.log("IndexLogic.js Main code: Something went wrong: " + errMsg)
}

//
// FUNCTIONS FOR COIN TABLE
//
function populateCoinsTable(coins) { 
// Fill the table with coin data
  try {
    const htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(coins, function (index, coin) {
        const coinTableRowHTML = constructCoinTableRowHtml(coin)

        // Replace any 'NaN' numbers, so that '-' character will be displayed instead)                  
        const coinRowHtmlwithNaNsReplaced = coinTableRowHTML.replace(/NaN/g, "-")

        htmlCoinTableID.append(coinRowHtmlwithNaNsReplaced)
    })
  }
  catch (errMsg) {
    throw("In populateCoinsTable(coins): " + errMsg)
  }
}

function constructCoinTableRowHtml(coin) {
// Create and return the HTML string for a coin's table row (using the given coin data)
  try {
    const coinNameLine = `<img src="${coin.image}"border=3 height=25 width=25> ${coin.name} (${coin.symbol})`

    const coinRowHtml = `<tr name="coinTableRow" onclick="displayCoinPage(event)" coinid="${coin.id}"> 
                            <td>${coin.market_cap_rank}</td>
                            <td>${coinNameLine}</td>
                            <td>${currency2DP.format(coin.current_price)}</td>

                            <td><span style="${cssColorForNumber(coin.price_change_percentage_1h_in_currency)}">
                                    ${coin.price_change_percentage_1h_in_currency.toFixed(2)}%</span></td>

                            <td><span style="${cssColorForNumber(coin.price_change_percentage_24h_in_currency)}">
                                    ${coin.price_change_percentage_24h_in_currency.toFixed(2)}%</span></td>

                            <td><span style="${cssColorForNumber(coin.price_change_percentage_7d_in_currency)}">
                                    ${coin.price_change_percentage_7d_in_currency.toFixed(2)}%</span></td>

                            <td><span style="${cssColorForNumber(coin.price_change_percentage_30d_in_currency)}">
                                    ${coin.price_change_percentage_30d_in_currency.toFixed(2)}%</span></td>

                            <td><span style="${cssColorForNumber(coin.price_change_percentage_1y_in_currency)}">
                                    ${coin.price_change_percentage_1y_in_currency.toFixed(2)}%</span></td>

                            <td>${currency0DP.format(coin.market_cap)}</td>
                        </tr>`
    return coinRowHtml
  }
  catch (errMsg) {
    throw("In constructCoinTableRowHtml(coin): " + errMsg)
  }
}

function populateCoinsTableFooter(coins) {
// Update the HTML string of the table footer with latest coin data provided.
  try {
    const htmlFooterID = $("#myCoinTableFooter")
    htmlFooterID.html("")

    const totalMarketCap = sumMarketCap(coins)
    const lastUpdated = coins[0].last_updated   // take from first coin in the list

    const footerHtml = `<p><strong>Total Market Cap: ${currency0DP.format(totalMarketCap)}</strong></p>
                        <p>Last updated: ${lastUpdated}</p>`

    htmlFooterID.append(footerHtml)
  }
  catch (errMsg) {
    throw("In populateCoinsTableFooter(coins): " + errMsg)
  }
}

function reloadCoinsTable() {
// Event Handler to "Refresh" table data
  try {
    // Obtain the coin data
    const tableMetadata = $("#"+idElementStoringCoinsTableData).prop("tableMetadata")
    getCoinTableData(tableMetadata)
    .then (
      (data) => {
        $("#"+idElementStoringCoinsTableData).prop("tableData", data.coins)

        // Display the coin data on the webpage
        populateCoinsTable(data.coins)
        populateCoinsTableFooter(data.coins)
    }) 
  }
  catch (errMsg) {
    throw("In reloadCoinsTable() event handler: " + errMsg)
  }
}

function displayCoinPage(event){
// Event Handler for when user clicks a row of the coin table
  try {
    const coinID = event.currentTarget.attributes.coinid.nodeValue

    // Retreive the currency id 
    const tableMetadata = $("#"+idElementStoringCoinsTableData).prop("tableMetadata")
    const currencyID = tableMetadata.currencyId.toLowerCase()

    window.location.href = `coin.html?coinid=${coinID}&currencyid=${currencyID}`
  }
  catch (errMsg) {
    throw("In displayCoinPage(event) event handler: " + errMsg)
  }
}

function changeCoinTableCurrency(currencyId){
// Event Handler to update coin table when currency is changed
  try {
    setCookie(currencyCookie, currencyId, cookieDurationInSeconds)

    // Update the currency formatters to new currency
    currency2DP = newCurrencyFormater(currencyId, 2)
    currency0DP = newCurrencyFormater(currencyId, 0)
    
    // Set the the new currency id (in coin table's metadata)
    const coinTableMetadata = $("#"+idElementStoringCoinsTableData).prop("tableMetadata")
    coinTableMetadata.currencyId = currencyId
    $("#"+idElementStoringCoinsTableData).prop("tableMetadata", coinTableMetadata)

    // Obtain the coin data
    getCoinTableData(metadataForTable.coins)
    .then (
      (data) => {
        $("#"+idElementStoringCoinsTableData).prop("tableData", data.coins)

        // Display the coin data on the webpage
        populateCoinsTable( data.coins )
        populateCoinsTableFooter( data.coins )
    })
  }
  catch (errMsg) {
    throw("In changeCoinTableCurrency(currencyId) event handler: " + errMsg)
  }
}

//
// FUNCTIONS FOR EXCHANGES TABLE
//
function populateExchangesTable(exchanges) { 
// Fill the table with exchange data
  try {
    const htmlExchangeTableID = $("#myExchangeTableBody")
    htmlExchangeTableID.html("")

    $.each(exchanges, function (index, exchange) {
        const exchangeTableRowHTML = constructExchangeTableRowHtml(exchange)

        // Replace any 'NaN' numbers, so that '-' character will be displayed instead)                  
        const exchangeRowHtmlwithNaNsReplaced = exchangeTableRowHTML.replace(/NaN/g, "-")

        htmlExchangeTableID.append(exchangeRowHtmlwithNaNsReplaced)
    })
  }
  catch (errMsg) {
    throw("In populateExchangesTable(exchanges): " + errMsg)
  }
}
  
function constructExchangeTableRowHtml(exchange) {
  try{
    const exchangeNameLine = `<img src="${exchange.image}"border=3 height=25 width=25> ${exchange.name} (${exchange.id})`

    const exchangeRowHtml = `<tr name="exchangeTableRow" onclick="displayExchangePage(event)" exchangeid="${exchange.id}"> 
                            <td>${exchange.trust_score_rank}</td>
                            <td>${exchangeNameLine}</td>
                            <td>${exchange.trade_volume_24h_btc.toFixed(2)}</td>
                            <td>${exchange.country}</td>
                            <td>${exchange.year_established}</td>
                            <td>${exchange.trust_score}</td>
                        </tr>`
    return exchangeRowHtml
  }
  catch (errMsg) {
    throw("In constructExchangeTableRowHtml(exchange): " + errMsg)
  }
}
  
function reloadExchangesTable() {
// Event Handler to "Refresh" the Exchanges table
  try {
  // Retreive the table's metadata
  const tableMetadata = $("#"+idElementStoringExchangesTableData).prop("tableMetadata")

  // Obtain the exchange data
  getExchangeTableData(tableMetadata)
  .then (
    (data) => {
      $("#"+idElementStoringExchangesTableData).prop("tableData", data.exchanges)

      // Display Exchanges table (in exchanges nav tab)
      populateExchangesTable(data.exchanges)    
    }) 
  }
  catch (errMsg) {
    throw("In reloadExchangesTable(): " + errMsg)
  }
}

function displayExchangePage(event) {
// Event Handler to invoke the exchange details page (e.g when user clicks a row in the exhanges table)
  try {
    const exchangeID = event.currentTarget.attributes.exchangeid.nodeValue

    window.location.href = `exchange.html?exchangeid=${exchangeID}`
  }
  catch (errMsg) {
    throw("In EH displayExchangePage(event): " + errMsg)
  }
}

function toggleSearchComponent(showDivId, hideDivId)  {
// Event Handler to show either the coin search component or exchange search component and hide the other
  try {
    $("#"+showDivId).show()
    $("#"+hideDivId).hide()
  }
  catch (errMsg) {
    throw("In EH showSearchComponent(divId): " + errMsg)
  }
}
