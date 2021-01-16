/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Global - data for the page
const fallbackCurrency = "usd"

// Use cookie for default currency
let defaultCurrency = null
if ( checkCookie(currencyCookie) == true ) defaultCurrency = getCookie(currencyCookie)
else defaultCurrency = fallbackCurrency
setCookie(currencyCookie, defaultCurrency, cookieDurationInSeconds) // set or refresh cookie

// Metadata on the Coins and Exchanges tables 
const metadataOnTable = {
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
  }
}
// Save tables meta data (in html nav tab that cointains each table)
$("#coinsNavTabArea").prop("tableMetadata", metadataOnTable.coins)
$("#exchangesNavTabArea").prop("tableMetadata", metadataOnTable.exchanges)


// Initialise the currency formatter functions (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater(defaultCurrency, 2)
let currency0DP = newCurrencyFormater(defaultCurrency, 0)

try {
    // Fetch the live data
    getTheIndexPageData(metadataOnTable)
    .then (
        (data) => {
            // Save coins and exchanges data (into the html nav tab that contains each table)
            $("#coinsNavTabArea").prop("tableData", data.coins)
            $("#exchangesNavTabArea").prop("tableData", data.exchanges)

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
            const componentCriteria = { idSC: "coinSearchComponent",
                                        idSCForm: "coinSearchForm",
                                        idSCInput: "coinSearchInput",
                                        idSCList: "coinSearchList",
                                        textSC: { input_title: "Type in a coin name or id",
                                                  input_placeholder: "Search for a coin...",
                                                  suggestions_list_title: "Trending searches:",
                                                  searchPool_list_title: "Top matching coins:"
                                                },
                                        searchPool: data.all_the_coins,
                                        suggestions: data.trending_coin_searches,
                                        maxItemsInSearchList : 8                                           
                                       }
            const coinSearch = new CoinSearchComponent(componentCriteria)

            // Display Exchanges table (in exchanges nav tab)
            populateExchangesTable(data.exchanges)
          }  
    )
} catch (errMsg) {
    console.log("IndexLogic.js Main code: Something went wrong: " + errMsg)
}


// FUNCTIONS

function populateCoinsTable(coins) { 
// Fill the table with coin data
  try {
    const htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(coins, function (index, coin) {
        const coinTableRowHTML = constructTableRowHtml(coin)

        // Replace any 'NaN' numbers, so that '-' character will be displayed instead)                  
        const coinRowHtmlwithNaNsReplaced = coinTableRowHTML.replace(/NaN/g, "-")

        htmlCoinTableID.append(coinRowHtmlwithNaNsReplaced)
    })
  }
  catch (errMsg) {
    throw("In populateCoinsTable(coins): " + errMsg)
  }
}

function constructTableRowHtml(coin) {
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
    throw("In constructTableRowHtml(coins): " + errMsg)
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


// Event Handlers

function loadNextPageIntoTable(idHtmlElementWithTableData) {
  try {
    // Determine new page number
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    tableMetadata.currentPageNumber++
    $(`#${idHtmlElementWithTableData}`).prop("tableMetadata", tableMetadata)

    //  If moving on to second page of table, activate 'Previous' paging controls
    if (tableMetadata.currentPageNumber == 2) {
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).removeClass("disabled")
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).attr("tabindex", "0")
    }

    // If moving on to last possible page of table, de-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display next page of data in table
    tableMetadata.loadTableDataFunction()
  }
  catch (errMsg) {
    throw("In loadNextPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}

function loadPreviousPageIntoTable(idHtmlElementWithTableData) {
  try {
    // Determine new page number
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    tableMetadata.currentPageNumber--
    $(`#${idHtmlElementWithTableData}`).prop("tableMetadata", tableMetadata)

    //  If moving back to first page, de-activate 'previous' paging controls
    if ( tableMetadata.currentPageNumber <= 1 ) {
     $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).addClass("disabled")
     $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).attr("tabindex", "-1")
    }

    // If moving back from last possible page of table, re-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display previous page of coins in table
    tableMetadata.loadTableDataFunction()

  }
  catch (errMsg) {
    throw("In loadPreviousPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }

}


function sortTableRows(event, idHtmlElementWithTableData) {
  try {
    // Retreive table data and table's metadata
    const tableData = $(`#${idHtmlElementWithTableData}`).prop("tableData")
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    if (!tableData || !tableMetadata) throw ("Asked to sort with unknown table data/metadata")

    const currentSortOrder = $(event.currentTarget).prop("order")
    let newSortOrder

    if ((currentSortOrder == "descending") || (currentSortOrder == "ascending")) {
        // Previously sorted on this column, so simply reverse data order
        tableData.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function (specific to sort column's data type, and the sort order)
        const dataAttribute = $(`#${event.currentTarget.id}`).attr("dataObjectAttribute")
        const functionBody = createCompareFunctionBody(tableData[0], dataAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the table data
        tableData.sort(compareFunction)
    }
    // Store the sorted table data
    $(`#${idHtmlElementWithTableData}`).prop("tableData", tableData)

    // Update the table (with sorted data)
    setColumnHeadersSortOrder(event, newSortOrder)
    tableMetadata.populateTableFunction(tableData)
  }
  catch (errMsg) {
    throw("In sortTableRows(event, idHtmlElementWithTableData): " + errMsg)
  }
}

function setColumnHeadersSortOrder(event, newSortOrder) {
  try {
    const unsortedIcon = '<i class="fas fa-sort"></i>'
    const sortedAscendingIcon = '<i class="fas fa-sort-up"></i>'
    const sortedDescendingIcon = '<i class="fas fa-sort-down"></i>'

    // Set sort icons in table column headers
    const sortOrderIcon = (newSortOrder === "ascending") ? sortedAscendingIcon : sortedDescendingIcon
    $("[name='sortColumn']").find("span").html( unsortedIcon )
    $("#" + event.currentTarget.id).find("span").html( sortOrderIcon )

    // Set 'order' property on table column headings
    $(event.currentTarget).prop("order", newSortOrder)
    $(event.currentTarget).siblings().removeProp("order")
  }
  catch (errMsg) {
    throw("In setColumnHeadersSortOrder(event, newSortOrder): " + errMsg)
  }
}

function reloadCoinsTable() {
// Event Handler to "Refresh" table data
  try {
    // Retreive the table's metadata
    const tableMetadata = $("#coinsNavTabArea").prop("tableMetadata")

    // Obtain the coin data
    getCoinTableData(tableMetadata)
    .then (
      (data) => {
        $("#coinsNavTabArea").prop("tableData", data.coins)

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
    const coinID = event.target.parentNode.attributes.coinid.nodeValue
    const currencyID = metadataOnTable.coins.currencyId.toLowerCase()

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
    
    // Obtain the coin data in new currency
    metadataOnTable.coins.currencyId = currencyId
    getCoinTableData(metadataOnTable.coins)
    .then (
      (data) => {
        $("#coinsNavTabArea").prop("tableData", data.coins)

        // Display the coin data on the webpage
        populateCoinsTable( data.coins )
        populateCoinsTableFooter( data.coins )
    })
  }
  catch (errMsg) {
    throw("In changeCoinTableCurrency(currencyId) event handler: " + errMsg)
  }
}


// EXCHANGES NAV TAB

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
  
      const exchnageRowHtml = `<tr name="exchangeTableRow" onclick="displayExchangePage(event)" exchangeid="${exchange.id}"> 
                              <td>${exchange.trust_score_rank}</td>
                              <td>${exchangeNameLine}</td>
                              <td>${exchange.trade_volume_24h_btc.toFixed(2)}</td>
                              <td>${exchange.country}</td>
                              <td>${exchange.year_established}</td>
                              <td>${exchange.trust_score}</td>
                          </tr>`
      return exchnageRowHtml
    }
    catch (errMsg) {
      throw("In constructExchangeTableRowHtml(exchange): " + errMsg)
    }
  }
  
  function reloadExchangesTable() {
  // Event Handler to "Refresh" the Exchanges table
    try {
    // Retreive the table's metadata
    const tableMetadata = $("#exchangesNavTabArea").prop("tableMetadata")

    // Obtain the exchange data
    getExchangeTableData(tableMetadata)
    .then (
      (data) => {
        $("#exchangesNavTabArea").prop("tableData", data.exchanges)

        // Display Exchanges table (in exchanges nav tab)
        populateExchangesTable(data.exchanges)    
      }) 
    }
    catch (errMsg) {
      throw("In reloadExchangesTable(): " + errMsg)
    }
  }

