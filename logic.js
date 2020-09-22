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
const currency2DP = newCurrencyFormater("USD", 2)
const currency0DP = newCurrencyFormater("USD", 0)


$("document").ready(function () {

    // Populate the page with the coin data
    updateCoinTable(coinObjects)
    updatePageFooter(coinObjects)

})



// FUNCTIONS

function updateCoinTable(myCoins) {
    // Fill the table with coin data (with one row for each coin)
    const htmlCoinTableID = $("#myCoinTableBody")
    htmlCoinTableID.html("")

    $.each(myCoins, function (index, coin) {
        const coinTableRowHTML = constructTableRowHtml(coin)
        htmlCoinTableID.append(coinTableRowHTML)
    })
}


function constructTableRowHtml(coin) {
    // Create and return the HTML string for a coin's table row (using the given coin data).

    const coinNameLine = `<img src="${coin.image}"border=3 height=25 width=25> ${coin.name} (${coin.symbol})`

    const coinRowHtml = `<tr> 
                            <td>${coin.market_cap_rank}</td>
                            <td>${coinNameLine}</td>
                            <td>${currency2DP.format(coin.current_price)}</td>
                            <td><span style="${cssColorForNumber(coin.price_change_percentage_24h_in_currency)}">
                                    ${coin.price_change_percentage_24h_in_currency.toFixed(2)}%</span></td>
                            <td>"Unknown"</td>
                            <td>"Unknown" </td>
                            <td>${currency0DP.format(coin.market_cap)}</td>
                            <td>"Price-Graph-Here..."</td>
                        </tr>`
    return coinRowHtml
}



function updatePageFooter(myCoins) {
    // Update the HTML string of the table footer with latest coin data provided.

    const htmlFooterID = $("#myPageFooter")
    htmlFooterID.html("")

    const totalMarketCap = sumMarketCap(myCoins)
    const lastUpdated = myCoins[0].last_updated

    const footerHtml = `<p><strong>Total Market Cap: ${currency0DP.format(totalMarketCap)}</strong></p>
                        <p>Last updated: ${lastUpdated}</p>`

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

function sortTableRows(event) {

    let newSortOrder = undefined 
    const currentSortOrder = $(event.target).prop("order")
    /* But this version below (using this) doesn't work - Why not ???
        let currentSortOrder = $(this).prop("order")  
    */
    console.log("Previous: currentSortOrder = ", currentSortOrder)

    // Check if table previously sorted on this attribute and if so reverse order
    // to get data into the new sort order required
    if ( (currentSortOrder == "descending") || (currentSortOrder == "ascending") ) {
        coinObjects.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function for the attribute (that will be used in sorting)
        const coinAttribute = getCoinObjectAttribute(event.target.id)
        const functionBody = createCompareFunctionBody(coinObjects[0], coinAttribute, newSortOrder)
        console.log("functionBody = ", functionBody)
        const compareFunction = Function("a, b", functionBody)

        // Sort the data (array of objects)
        coinObjects.sort(compareFunction)
    }
    
    // Display the sorted data in the table
    updateCoinTable(coinObjects)

    // Update 'order' property to relect new sort order, and remove 'order' property from
    // all other table column headings (since it is no longer valid if set on another column)
    $(event.target).prop("order", newSortOrder)
    $(event.target).siblings().removeProp("order")

    /* As above this version using this don't work - Why not?
        $(this).prop("order", newSortOrder )
        console.log("$(this).prop('order') = ", $(this).prop("order") )
    */
}


function getCoinObjectAttribute(IdElement) {

    let coinObjectItem = ""

    switch (IdElement) {
        case "rankColumn":
            coinObjectItem = "market_cap_rank"
            break
        case "nameColumn":
            coinObjectItem = "name"
            break
        case "priceColumn":
            coinObjectItem = "current_price"
            break
        case "change24hrColumn":
            coinObjectItem = "price_change_percentage_24h"
            break
        case "marketCapColumn":
            coinObjectItem = "market_cap"
            break
        default:
            throw ("Error: Unknown table column: " + IdElement)
            break
    }
    return coinObjectItem;
}



function createCompareFunctionBody(object, attribute, sortOrder) {

    const getTypeofCoinAttributeValue = Function("object", `return typeof object.${attribute}`)
    const coinAttributeValueType = getTypeofCoinAttributeValue(object)
    //    console.log("coinAttributeValueType = ", coinAttributeValueType)

    let functionBody = ""
    if (coinAttributeValueType === "number") {

        functionBody = (sortOrder === "ascending") ?
            `return a.${attribute} - b.${attribute}` :
            `return b.${attribute} - a.${attribute}`
    }
    else if (coinAttributeValueType === "string") {

        const startOfBody = `const x = a.${attribute}.toLowerCase()
                             const y = b.${attribute}.toLowerCase()
                            `
        const endofBody = (sortOrder === "ascending") ?
            `if (x < y) {return -1}
             if (x > y) {return 1}
             return 0` :
            `if (x > y) {return -1}
             if (x < y) {return 1}
             return 0`
        functionBody = startOfBody + endofBody
    }
    else throw ("Error: Unexpected coinAttributeValueType of :" + coinAttributeValueType)

    return functionBody
}

