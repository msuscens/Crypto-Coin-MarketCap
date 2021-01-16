
// Globals to assist in use of currency Cookie
const currencyCookie = "CoinPriceCurrencyCookie"
const cookieDurationInSeconds = 1209600   // 2 weeks

// HELPER FUNCTIONS

// Use to initialise a currency formatter function,
// E.g. const currency2DP = newCurrencyFormater("USD", 2)
function newCurrencyFormater(currencyType, decimalPlaces) {
  try {
    const formatter = new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: currencyType,
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        })
    return formatter
  }
  catch(errMsg){
    throw("In newCurrencyFormater(currencyType, decimalPlaces): " + errMsg)
  }
}

function sumMarketCap(myCoins) {
  try {
    let sum = 0;
    for (let coin of myCoins) {
        sum += (coin.market_cap ? coin.market_cap : 0)
    }
    return sum
  }
  catch(errMsg){
    throw("In sumMarketCap(myCoins): " + errMsg)
  }
}

function cssColorForNumber(number) {
  try {
    // Create attribute string: green for positive number, red for a negative, and black if zero.

    let color = "black"
    if (number > 0) color = "green"
    else if (number < 0) color = "red"

    return "color:" + color
  }
  catch(errMsg){
    throw("In cssColorForNumber(number): " + errMsg)
  }
}


function createCompareFunctionBody(object, attribute, sortOrder) {
  try {
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
  catch(errMsg){
    throw("In createCompareFunctionBody(object, attribute, sortOrder): " + errMsg)
  }
}


function getPreviousDate(numDaysAgo) {
  try {
    const currentDateTime = new Date()
    const previousDate = new Date()
    previousDate.setDate(currentDateTime.getDate() - numDaysAgo)

    return previousDate
  }
  catch(errMsg){
    throw("In getPreviousDate(numDaysAgo): " + errMsg)
  }
}

function getDaysAgo(prevoiusDate) {
  try {
    const currentDateTime = new Date()
    const diffInMilliseconds = currentDateTime.getTime() - prevoiusDate.getTime()
    const numDaysAgo = diffInMilliseconds / (1000 * 3600 * 24) 

    return numDaysAgo
  }
  catch(errMsg){
    throw("In getDaysAgo(prevoiusDate): " + errMsg)
  }
}


function getParamFromUrl(url, paramId) {
  try {
    const startParamIdPos = url.lastIndexOf(paramId)
    if (startParamIdPos == -1) {
        throw new Error(`Parameter: "${paramId}" not present in url: "${url}"`)
    }
    const startParamValPos = startParamIdPos + paramId.length

    const endDelimPos = url.indexOf("&", startParamValPos)
    const endParamValPos = (endDelimPos > -1)? endDelimPos: url.length 

    const param = url.substring( startParamValPos, endParamValPos )
    
    return param
  }
  catch(errMsg){
    throw("In getParamFromUrl(url, paramId): " + errMsg)
  }
}

function getCurrencySymbol(currencyId){
  try {
    let num = 0
    const symbol = num.toLocaleString("en",
                            {style: "currency",
                            currency: currencyId.toUpperCase()}).replace(/\d+([,.]\d+)?/g, "")
    return symbol
  }
  catch(errMsg){
    throw("In getCurrencySymbol(currencyId): " + errMsg)
  }
}


// Cookie Helper functions - courtesy of Kenneth

function setCookie(cname, cvalue, seconds) {
    var d = new Date();
    d.setTime(d.getTime() + (seconds * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    var user = getCookie(cname);
    if (user != "") {
        return true;
    } else {
        if (user == "" && user == null) {
            return false;
        }
    }
}

/*
  _decodeHtml(html) {
    try {
      const textElement = document.createElement("textarea")
      textElement.innerHTML = html
      return textElement.value
    }
    catch (errMsg){
      throw("In decodeHtml(html): Failed to return decoded html: " + errMsg)
    }
  }
*/

