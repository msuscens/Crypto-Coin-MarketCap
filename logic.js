/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Obtain the Coin Data
// Using dummy hardcoded coin data for now (albeit in the format that CoinGeko API would return).
// TODO: Replace dummyGetCoins() with function that obtains data via coinGeko API calls:
//              const defaultCurrency = "USD"
//              let coinObjectList = getCoins( defaultCurrency )
let coinObjects = dummyGetCoins()
console.log("coinObjects = ", coinObjects)

// Initialise the currency formatters (for 0 & 2 decimail places)
let currency2DP = newCurrencyFormater("USD", 2)
let currency0DP = newCurrencyFormater("USD", 0)


$("document").ready(function () {

    // Populate the page with the coin data
    updateCoinTable(coinObjects)
    updatePageFooter(coinObjects)

})



// FUNCTIONS

function updateCoinTable(myCoins) {
    // Fill the table with coin data (with one row for each coin)
    let htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(myCoins, function (index, coin) {
        let coinTableRowHTML = constructTableRowHtml(coin)
        console.log(index + " coinTableRowHTML: ", coinTableRowHTML)
        htmlCoinTableID.append(coinTableRowHTML)
    })
}


function constructTableRowHtml(coin) {
    // Create and return the HTML string for a coin's table row (using the given coin data).

    let coinNameLine = '<img src="' + coin.image + '"border=3 height=25 width=25>'
        + ' ' + coin.name + ' (' + coin.symbol + ')'

    let coinRowHtml=`<tr>
                        <td>` + coin.market_cap_rank + `</td>
                        <td>` + coinNameLine + `</td>
                        <td>` + currency2DP.format(coin.current_price) + `</td>
                        <td><span style="` + cssColorForNumber(
                                        coin.price_change_percentage_24h_in_currency) + `">` +
                            coin.price_change_percentage_24h_in_currency.toFixed(2) + `%</span></td>
                        <td>` + "Unknown" + `</td>
                        <td>` + "Unknown" + `</td>
                        <td>` + currency0DP.format(coin.market_cap) + `</td>
                        <td>` + "Price-Graph-Here..." + `</td>
                    </tr>`

    return coinRowHtml
}



function updatePageFooter(myCoins) {
    // Update the HTML string of the table footer with latest coin data provided.

    let htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    let totalMarketCap = sumMarketCap(myCoins)
    let lastUpdated = myCoins[0].last_updated   

    let footerHtml = `<p><strong>Total Market Cap: ` + currency0DP.format(totalMarketCap) +
        `</strong></p>
                        <p>Last updated: ` + lastUpdated + `</p>`

    htmlFooterID.append(footerHtml)
}


function sumMarketCap(myCoins) {
    let sum = 0;
    for (let coin of myCoins) {
        sum += coin.market_cap
    }
    return sum
}

function cssColorForNumber(number) {
    // Return css color attribute for a given number:
    // Green for a positive number, red for a negative number, and black if zero.

    let color = "black"
    if (number > 0) color = "green"
    else if (number < 0) color = "red"

    return "color:" + color
}
