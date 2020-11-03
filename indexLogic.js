/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Global - data for the page
const fallbackCurrency = "usd"
let theCoins = []   // Array of coin data (yet to be obtained)

// Use cookie for default currency
let defaultCurrency
if ( checkCookie(currencyCookie) == true ) defaultCurrency = getCookie(currencyCookie)
else defaultCurrency = fallbackCurrency
setCookie(currencyCookie, defaultCurrency, cookieDurationInSeconds) // set or refresh cookie

// Initialise the currency formatter functions (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater(defaultCurrency, 2)
let currency0DP = newCurrencyFormater(defaultCurrency, 0)

try {
    // Obtain the coin data
    getTheIndexPageData( defaultCurrency )
    .then (
        (coinData) => {
            theCoins = coinData
            
            // Display the coin data on the webpage
            populateCoinTable( theCoins )
            populatePageFooter( theCoins )

            // Put the currency selector component onto the page
            const currencies = getSupportedCurrencies() //TODO: Replace by getting data via getTheIndexPageData()
            const componentHtml = createCurrencySelectorDropDownHtml(currencies, defaultCurrency,
                                                                    "changeCurrencyonIndexPage(event)")
            $("#currencySelectorComponent").html(componentHtml)
        }  
    )
} catch (error) {
    console.log("IndexLogic.js: Something went wrong: " + error)
}


// FUNCTIONS

function populateCoinTable(coins) { 
// Fill the table with coin data
    
    const htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(coins, function (index, coin) {
        const coinTableRowHTML = constructTableRowHtml(coin)

        // Replace any 'NaN' numbers, so that '-' character will be displayed instead)                  
        const coinRowHtmlwithNaNsReplaced = coinTableRowHTML.replace(/NaN/g, "-")

        htmlCoinTableID.append(coinRowHtmlwithNaNsReplaced)
    })
}


function constructTableRowHtml(coin) {
// Create and return the HTML string for a coin's table row (using the given coin data)

    const coinNameLine = `<img src="${coin.image}"border=3 height=25 width=25> ${coin.name} (${coin.symbol})`

    const coinRowHtml = `<tr onclick="displayCoinPage(event)" coinid="${coin.id}"> 
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


function populatePageFooter(coins) {
// Update the HTML string of the table footer with latest coin data provided.

    const htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    const totalMarketCap = sumMarketCap(coins)
    const lastUpdated = coins[0].last_updated   // take from first coin in the list

    const footerHtml = `<p><strong>Total Market Cap: ${currency0DP.format(totalMarketCap)}</strong></p>
                        <p>Last updated: ${lastUpdated}</p>`

    htmlFooterID.append(footerHtml)
}


// Event Handlers

function sortTableRows(event) {

    const currentSortOrder = $(event.target).prop("order")
    let newSortOrder

    if ((currentSortOrder == "descending") || (currentSortOrder == "ascending")) {
        // Previously sorted on this column, so simply reverse data order
        theCoins.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function for the coin attribute
        const coinAttribute = getCoinObjectAttribute(event.target.id)
        const functionBody = createCompareFunctionBody(theCoins[0], coinAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the coin data (array of coin objects)
        theCoins.sort(compareFunction)
    }

    // Update the table with newly sorted coin data
    setColumnHeadersSortOrder(event, newSortOrder)
    populateCoinTable(theCoins)
}


function setColumnHeadersSortOrder(event, newSortOrder) {

    const unsortedIcon = '<i class="fas fa-sort"></i>'
    const sortedAscendingIcon = '<i class="fas fa-sort-up"></i>'
    const sortedDescendingIcon = '<i class="fas fa-sort-down"></i>'

    // Set sort icons in table column headers
    const sortOrderIcon = (newSortOrder === "ascending") ? sortedAscendingIcon : sortedDescendingIcon
    $("[name='sortColumn']").find("span").html( unsortedIcon )
    $("#" + event.target.id).find("span").html( sortOrderIcon )

    // Set 'order' property on table column headings
    $(event.target).prop("order", newSortOrder)
    $(event.target).siblings().removeProp("order")

}

// Event Handler for when user clicks "Sync" button
function reloadCoinData() {
    try {
        const currencyId = $("#currencyLabelCS").text()

        // Obtain the coin data
        getTheIndexPageData(currencyId)
        .then (
            (coinData) => {
                theCoins = coinData
                
                // Display the coin data on the webpage
                populateCoinTable(theCoins)
                populatePageFooter(theCoins)
            }  
        )
    } catch (error) {
        console.log("In reloadCoinData() EH: Something went wrong: " + error)
    }
}


// Event Handler for when user clicks a row of the coin table
function displayCoinPage(event){
    try {
        const coinID = event.target.parentNode.attributes.coinid.nodeValue
        const currencyID = $("#currencyLabelCS").text().toLowerCase()  

        window.location.href = `coin.html?coinid=${coinID}&currencyid=${currencyID}`
 
    } catch (error) {
        console.log("Something went wrong in IndexLogic: DisplayCoinPage(event): " + error)
    }
}

// Event Handler for when user clicks on a currency (in currency selector)
function changeCurrencyonIndexPage(event){
    try {
      // Set the UI's currency selector and applications currency cookie
      const currencyId = $(event.target).text()
      $("#currencyLabelCS").text( currencyId )
      setCookie(currencyCookie, currencyId, cookieDurationInSeconds)

      // Update the currency formatters to new currency
      currency2DP = newCurrencyFormater(currencyId, 2)
      currency0DP = newCurrencyFormater(currencyId, 0)
    
      // Obtain the coin data
      getTheIndexPageData( currencyId )
      .then (
          (coinData) => {
              theCoins = coinData
              // Display the coin data on the webpage
              populateCoinTable( theCoins )
              populatePageFooter( theCoins )
            }  
      )
    } catch (error) {
          console.log("In EH changeCurrencyonIndexPage(): Something went wrong: " + error)
    }
  }

