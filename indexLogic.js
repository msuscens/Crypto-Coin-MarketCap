/* Javascript logic for "Mark's Coin Cap" application */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Global
const defaultCurrency = "usd"
let theCoins = []   // Array of coin data (yet to be obtained)

try {
    ;(async () => {
        // Obtain the coin data
        console.log("In indexLogic.js: annonoymous async(): theCoins = ", theCoins)
        theCoins = await getTheIndexPageData( defaultCurrency )
    
        console.log("Returned from getTheIndexPageData: theCoins = ", theCoins)
    
        // Display the coin data on the webpage
        $("document").ready(function () {

            populateCoinTable( theCoins )
            populatePageFooter( theCoins )
            
        })
    })() 
} catch (error) {
    console.log("IndexLogic.js: Something went wrong: " + error)
}


// FUNCTIONS

function populateCoinTable(myCoins) { 
// Fill the table with coin data
    
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

// Event Handler for when user clicks a row of the coin table
function displayCoinPage(event){

    try {
        console.log("In eh displayCoinPage(event): event = ", event)

        // TODO - BETTER WAY TO GET coinID 

        // Works for console: event.target.parentNode.attributes.coinid.nodeValue
        //const coinID = $(event.target.parentNode).prop("coinid")
        // const coinID = $(event.target.parentNode.attributes).prop("coinid")
        // const coinID1 = $(event.target).parent().prop("coinid")
        // const coinID2 = $(event.target.parentNode).prop("coinid")
        //   const coinID3 = $(event.target.parentNode).getAttribute("coinid")
        const coinID = event.target.parentNode.attributes.coinid.nodeValue

        // TODO - Get currencyid from Currency button (dropdown) value
        const currencyID = "usd"  


        console.log("coinID = ", coinID)
        console.log("currencyID = ", currencyID) 

        window.location.href = `coin.html?coinid=${coinID}&currencyid=${currencyID}`
 
    } catch (error) {
        console.log("Something went wrong in IndexLogic: DisplayCoinPage(event): " + error)
    }

}
