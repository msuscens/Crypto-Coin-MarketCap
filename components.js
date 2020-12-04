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
//
// Currency Selector dropdown component
//
function createCurrencySelectorDropDownHtml( currencies, selectedCurrency, onclickFunctionCall ){

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

// TODO: Consider refactoring Currency Selector function into a CurrencySelectorComponent class
// with an object constructor and get method to obtain the currency id .... 
//   
//  function getCurrencyId(){
//    const currencyId = $("#currencyLabelCS").text()
//    return currencyId
//  }


//
// Coin Search Component
//
class CoinSearchComponent extends SearchComponent {
  
  _createHtmlForListItem( suggestionOrSearchData, dataIndex ){
    // Implementation for to create Coin list item HTML (ie. a single list item). 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try {
      const coinId = suggestionOrSearchData[dataIndex].id
      const listItemText = suggestionOrSearchData[dataIndex].nameLine
      const listItemHtml = `<li><a href="coin.html?coinid=${coinId}"> ${listItemText} </a></li>`
    
      return listItemHtml
    }
    catch (errMsg){
      throw ("CoinSearchComponent error in _createHtmlForListItem( suggestionOrSearchData, dataIndex ): " + errMsg)
    }
  }
  
  _listItemClickEvent( searchComponent, event) {
    // Implementation for a click event on a Coin Search List Item. 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try{
      console.log("In _listItemClickEvent( searchComponent, event)")
    
      // Construct full url for the Coin page (ie. add currency )
      const currencyId = $("#currencyLabelCS").text().toLowerCase() 
      const coinPageUrl = `${event.target.href}&currencyid=${currencyId}` 
      console.log(`coinPageurl = ${coinPageUrl}`)
    
      // Reset input and search list (in case user goes 'back' in browser)
      super._listItemClickEvent( searchComponent, event)
  
      // Goto Coin Page
      window.location.href = coinPageUrl
    }
    catch (errMsg){
      throw ("CoinSearchComponent error in _listItemClickEvent( searchComponent, event) " + errMsg)
    }
  }
}
