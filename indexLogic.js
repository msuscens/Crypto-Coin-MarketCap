/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Global - data for the page
const fallbackCurrency = "usd"
let theIndexPage = {}    // Will store data obtained for Index page

// Use cookie for default currency
let defaultCurrency = null
if ( checkCookie(currencyCookie) == true ) defaultCurrency = getCookie(currencyCookie)
else defaultCurrency = fallbackCurrency
setCookie(currencyCookie, defaultCurrency, cookieDurationInSeconds) // set or refresh cookie

// Coin table meta data
const coinCriteria = {
  currencyId: defaultCurrency.toLowerCase(),
  numberCoinsPerPage: 100,
  currentPageNumber: 1
}

// Initialise the currency formatter functions (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater(defaultCurrency, 2)
let currency0DP = newCurrencyFormater(defaultCurrency, 0)

try {
    // Obtain the coin data
    getTheIndexPageData(coinCriteria)
    .then (
        (data) => {
            theIndexPage = data

            // Display the coin data on the webpage
            populateCoinTable( theIndexPage.coins )
            populatePageFooter( theIndexPage.coins )

            // Add the currency selector component onto the page
            const selectorCriteria =  { id: "currencySelectorComponent",
                                        currencies: theIndexPage.currencies_supported,
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
                                        searchPool: theIndexPage.all_the_coins,
                                        suggestions: theIndexPage.trending_coin_searches,
                                        maxItemsInSearchList : 8                                           
                                       }
            const coinSearch = new CoinSearchComponent(componentCriteria)
        }  
    )
} catch (errMsg) {
    console.log("IndexLogic.js Main code: Something went wrong: " + errMsg)
}


// FUNCTIONS

function populateCoinTable(coins) { 
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
    throw("In populateCoinTable(coins): " + errMsg)
  }
}

function constructTableRowHtml(coin) {
// Create and return the HTML string for a coin's table row (using the given coin data)
  try{
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
                                    
                            <td><span style="${cssColorForNumber(coin.price_change_percentage_200d_in_currency)}">
                                    ${coin.price_change_percentage_200d_in_currency.toFixed(2)}%</span></td>

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


function populatePageFooter(coins) {
// Update the HTML string of the table footer with latest coin data provided.
  try {
    const htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    const totalMarketCap = sumMarketCap(coins)
    const lastUpdated = coins[0].last_updated   // take from first coin in the list

    const footerHtml = `<p><strong>Total Market Cap: ${currency0DP.format(totalMarketCap)}</strong></p>
                        <p>Last updated: ${lastUpdated}</p>`

    htmlFooterID.append(footerHtml)
  }
  catch (errMsg) {
    throw("In populatePageFooter(coins): " + errMsg)
  }
}


// Event Handlers

function pagePreviousCoins() {
  try {
    coinCriteria.currentPageNumber--

    //  If moving back to first page of table, de-activate 'previous' paging control
    if ( coinCriteria.currentPageNumber <= 1 ) {
      $('li[name="previousPageTableControl"]').addClass("disabled")
      $('li[name="previousPageTableControl"]').attr("tabindex", "-1")
    }

    // If moving back from last possible page of table, re-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display previous page of coins in table
    reloadCoinData()
  }
  catch (errMsg) {
    throw("In pagePreviousCoins(): " + errMsg)
  }
}

function pageNextCoins() {
  try {
    coinCriteria.currentPageNumber++

    //  If moving on to second page of table, re-activate 'Previous' paging control
    if (coinCriteria.currentPageNumber == 2) {
      $('li[name="previousPageTableControl"]').removeClass("disabled")
      $('li[name="previousPageTableControl"]').attr("tabindex", "0")
    }

    // If moving on to last possible page of table, de-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display next page of coins in table
    reloadCoinData()
  }
  catch (errMsg) {
    throw("In pageNextCoins(): " + errMsg)
  }
}

function sortTableRows(event) {
  try {
    const currentSortOrder = $(event.currentTarget).prop("order")
    let newSortOrder

    if ((currentSortOrder == "descending") || (currentSortOrder == "ascending")) {
        // Previously sorted on this column, so simply reverse data order
        theIndexPage.coins.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function for the coin attribute
        const coinAttribute = getCoinObjectAttribute(event.currentTarget.id)
        const functionBody = createCompareFunctionBody(theIndexPage.coins[0], coinAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the coin data (array of coin objects)
        theIndexPage.coins.sort(compareFunction)
    }

    // Update the table with newly sorted coin data
    setColumnHeadersSortOrder(event, newSortOrder)
    populateCoinTable(theIndexPage.coins)
  }
  catch (errMsg) {
    throw("In sortTableRows(event): " + errMsg)
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

function reloadCoinData() {
// Event Handler to "Refresh" the coin table
  try {
    // Obtain the coin data
    getCoinTableData(coinCriteria)
    .then (
      (data) => {
        theIndexPage.coins = data.coins

        // Display the coin data on the webpage
        populateCoinTable(theIndexPage.coins)
        populatePageFooter(theIndexPage.coins)
    }) 
  }
  catch (errMsg) {
    throw("In reloadCoinData() event handler: " + errMsg)
  }
}

function displayCoinPage(event){
// Event Handler for when user clicks a row of the coin table
  try {
    const coinID = event.target.parentNode.attributes.coinid.nodeValue
    const currencyID = coinCriteria.currencyId.toLowerCase()

    window.location.href = `coin.html?coinid=${coinID}&currencyid=${currencyID}`
  }
  catch (errMsg) {
    throw("In displayCoinPage(event) event handler: " + errMsg)
  }
}

// Event Handler to update coin table when currency is changed
//function changeCoinTableCurrency(event){
function changeCoinTableCurrency(currencyId){
  try {
    setCookie(currencyCookie, currencyId, cookieDurationInSeconds)

    // Update the currency formatters to new currency
    currency2DP = newCurrencyFormater(currencyId, 2)
    currency0DP = newCurrencyFormater(currencyId, 0)
    
    // Obtain the coin data in new currency
    coinCriteria.currencyId = currencyId
    getCoinTableData(coinCriteria)
    .then (
      (data) => {
        theIndexPage.coins = data.coins

        // Display the coin data on the webpage
        populateCoinTable( theIndexPage.coins )
        populatePageFooter( theIndexPage.coins )
    })
  }
  catch (errMsg) {
    throw("In changeCoinTableCurrency(currencyId) event handler: " + errMsg)
  }
}
