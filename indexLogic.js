/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Obtain the Coin Data
const coinObjects = dummyGetCoins()
console.log("coinObjects = ", coinObjects)

// Above is currently using dummy coin data.
// TODO: Replace dummyGetCoins() with function that obtains data via coinGeko API calls:
//              const defaultCurrency = "USD"
//              let coinObjectList = getCoins( defaultCurrency )



$("document").ready(function () {

    // Display the coin data on the webpage
    populateCoinTable(coinObjects)
    populatePageFooter(coinObjects)

})


// FUNCTIONS

function populateCoinTable(myCoins) {  // Fill the table with coin data
    
    const htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(myCoins, function (index, coin) {
        const coinTableRowHTML = constructTableRowHtml(coin)

        // Replace any 'NaN' numbers (so that instead '-' character will be displayed)                  
        const coinRowHtmlwithNaNsReplaced = coinTableRowHTML.replace(/NaN/g, "-")

        htmlCoinTableID.append(coinRowHtmlwithNaNsReplaced)
    })
}


function constructTableRowHtml(coin) {
    // Create and return the HTML string for a coin's table row (using the given coin data)

    const coinNameLine = `<img src="${coin.image}"border=3 height=25 width=25> ${coin.name} (${coin.symbol})`

    const coinRowHtml = `<tr onclick="displayCoinPage(event)"> 
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


function populatePageFooter(myCoins) {
    // Update the HTML string of the table footer with latest coin data provided.

    const htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    const totalMarketCap = sumMarketCap(myCoins)
    const lastUpdated = myCoins[0].last_updated

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
        coinObjects.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function for the coin attribute
        const coinAttribute = getCoinObjectAttribute(event.target.id)
        const functionBody = createCompareFunctionBody(coinObjects[0], coinAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the coin data (array of coin objects)
        coinObjects.sort(compareFunction)
    }

    // Update the table with newly sorted coin data
    setColumnHeadersSortOrder(event, newSortOrder)
    populateCoinTable(coinObjects)
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


function displayCoinPage(event){

 //   console.log("$(event.target).val() = ", $(event.target).val() )
 //   console.log("$(event.target.id) = ",  $(event.target.id) )

 // *** TODO - Use ?param on the url to pass coinid and currencyid to the coin window
 // *** Alternatively use local storage: 
 //        https://stackoverflow.com/questions/12226564/jquery-passing-data-between-pages

    window.location.href = "coin.html"

}
