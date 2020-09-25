/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Obtain the Coin Data
let coinObjects = dummyGetCoins()
console.log("coinObjects = ", coinObjects)

// Above is currently using dummy coin data for now.
// TODO: Replace dummyGetCoins() with function that obtains data via coinGeko API calls:
//              const defaultCurrency = "USD"
//              let coinObjectList = getCoins( defaultCurrency )

// Initialise the currency formatters (for 0 & 2 decimail places)
const currency2DP = newCurrencyFormater("USD", 2)
const currency0DP = newCurrencyFormater("USD", 0)


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

    const coinRowHtml = `<tr> 
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


function sumMarketCap(myCoins) {
    let sum = 0;
    for (let coin of myCoins) {
        sum += (coin.market_cap ? coin.market_cap : 0)
    }
    return sum
}

function cssColorForNumber(number) {
    // Create attribute string: green for positive number, red for a negative, and black if zero.

    let color = "black"
    if (number > 0) color = "green"
    else if (number < 0) color = "red"

    return "color:" + color
}

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

function getCoinObjectAttribute(IdElement) {

    let coinObjectAttribute = ""

    switch (IdElement) {
        case "rankColumn":
            coinObjectAttribute = "market_cap_rank"
            break
        case "nameColumn":
            coinObjectAttribute = "name"
            break
        case "priceColumn":
            coinObjectAttribute = "current_price"
            break
        case "change1hrColumn":
            coinObjectAttribute = "price_change_percentage_1h_in_currency"
            break
        case "change24hrColumn":
            coinObjectAttribute = "price_change_percentage_24h_in_currency"
            break
        case "change7dColumn":
            coinObjectAttribute = "price_change_percentage_7d_in_currency"
            break
        case "change30dColumn":
            coinObjectAttribute = "price_change_percentage_30d_in_currency"
            break
        case "change200dColumn":
            coinObjectAttribute = "price_change_percentage_200d_in_currency"
            break
        case "change1yrColumn":
            coinObjectAttribute = "price_change_percentage_1y_in_currency"
            break
        case "marketCapColumn":
            coinObjectAttribute = "market_cap"
            break
        default:
            throw ("Error: Unknown table column: " + IdElement)

    }
    return coinObjectAttribute;
}


function createCompareFunctionBody(object, attribute, sortOrder) {

    const getTypeofCoinAttributeValue = Function("object", `return typeof object.${attribute}`)
    const coinAttributeValueType = getTypeofCoinAttributeValue(object)

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

