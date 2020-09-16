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

$("document").ready(function () {

    // Populate the page with the coin data
    updateCoinTable(coinObjects)
    updatePageFooter(coinObjects)

})



// FUNCTIONS

function updateCoinTable(myCoins) {
    // Fill the table with coin data, one row for each coin

    let htmlCoinTableID = $("#myCoinTableBody")

    htmlCoinTableID.html("")
    $.each(myCoins, function (index, coin) {
        let coinTableRowHTML = constructTableRowHtml(coin)
        console.log(index + " coinTableRowHTML: ", coinTableRowHTML)
        // add row of coin data to the table
        htmlCoinTableID.append(coinTableRowHTML)
    })
}


function constructTableRowHtml(coin) {
    // Create the HTML string for a coin's table row, using the given coin data.
    // TODO: Add currency & percentage symbols, and round/format figures

    let coinRowHtml = `<tr>
                             <td>` + coin.market_cap_rank + `</td>
                             <td>` + coin.name + `</td>
                             <td>` + coin.current_price + `</td>
                             <td>` + coin.price_change_percentage_24h_in_currency + `</td>
                             <td>` + "Unknown" + `</td>
                             <td>` + "Unknown" + `</td>
                             <td>` + coin.market_cap + `</td>
                             <td>` + "Price-Graph-Here..." + `</td>
                            </tr>`

    return coinRowHtml
}



function updatePageFooter(myCoins) {
    // Update the HTML string of the table footer (with lastest coin data obtained).
    // TODO: Add currency and formating of marketcap figure and last update day/time.
    //        Eg. Total Market Cap: $325,118,468,342
    //            Last updated: Tue, 08 Sep 2020 14:25:18 UTC

    let htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    let totalMarketCap = sumMarketCap(myCoins)

    // We'll use the first coin returned last updated time as the
    // last updated time for all coins
    // TODO: Consider if there's a better approach for overall last updated time!?
    let lastUpdated = myCoins[0].last_updated

    let footerHtml = `<p><strong>Total Market Cap: ` + totalMarketCap +
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
