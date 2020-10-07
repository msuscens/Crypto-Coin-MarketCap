// HELPER FUNCTIONS

// Initialise the currency formatter functions (for 0 & 2 decimail places)
const currency2DP = newCurrencyFormater("USD", 2)
const currency0DP = newCurrencyFormater("USD", 0)

function newCurrencyFormater(currencyType, decimalPlaces) {
    const formatter = new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: currencyType,
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        })
    return formatter
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


function getPreviousDate( numDaysAgo ){

    const currentDateTime = new Date()
    const previousDate = new Date()
    previousDate.setDate(currentDateTime.getDate() - numDaysAgo)

    return previousDate

}


