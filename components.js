/* Javascript HTML components (functions) for "Mark's Coin Cap" application
    Specifically these components:
        1. coinSearchBar( availableCoins, mostPopularCoinSearches )
*/


// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check


// COMPONENTS

// Currency Selector dropdown component

function createCurrencySelectorDropDownHtml ( currencies, selectedCurrency, onclickFunctionCall ){

  let htmlCurrencySelector = `<div class="dropdown">
                                <button class="btn btn-light dropdown-toggle" data-toggle="dropdown">
                                  <span id="currencyLabelCS">${selectedCurrency.toUpperCase()}</span>
                                </button>
                                <div class="dropdown-menu">`

  $.each(currencies, function (index, currencyId) {
    const currencyDropDownItemHTML = `<a class="dropdown-item" href="#"
                                    onclick="${onclickFunctionCall}">${currencyId.toUpperCase()}</a>`
    htmlCurrencySelector += currencyDropDownItemHTML

  })
  htmlCurrencySelector += `</div></div>`

  return htmlCurrencySelector
}


// Coin search bar component

function coinSearchBarHtml(availableCoins, mostPopularCoinSearches) {
    
    let title = "Search"
    if (fieldText[0].length) title = `<h3>` + fieldText[0] + `</h3> <br>`

    let mySearchBarBox = title +
      `<label for="` + fieldText[2] + `">` + fieldText[1] + `</label>` + `
                <input class="form-control" type="text" id="`+ fieldText[2] + `">`

    return myInputBox
  }




// COMPONENT HELPER FUNCTIONS