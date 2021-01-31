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
class CurrencySelectorComponent {

  constructor(component) {
  // component parameter object consists of:
  //  { id:                 <string> - The HTML id of the div into which component will be created,
  //    currencies:         <array>  - List of currency identifiers <strings> for the selection dropdown,
  //    selectedCurrency:   <string> - The currency initially shown as selected,
  //    currencyUpdateFunc: <function> - The applications own event handler function name 
  //                                     (without functions currencyId paramter) that will be
  //                                      called by the component when user selects a currency.
  //  }
  //
    try {
      // Set component's attributes
      this._idComponent = component.id
      this._idButton = component.id + "Button"
      this._idDropdown = component.id + "Dropdown"
      this._idInputbox = component.id + "Inputbox"
      this._currencyUpdateAppEventHandler = component.currencyUpdateFunc

      // Construct the html for the component
      let htmlCurrencySelector = `<div class="dropdown">
                                    <button id="${this._idButton}" class="btn-light dropbtn dropdown-toggle">
                                      ${component.selectedCurrency.toUpperCase()}
                                    </button>
                                    <div id="${this._idDropdown}" class="dropdown-content">
                                      <input type="text" placeholder="Search..." id="${this._idInputbox}">`

      $.each(component.currencies, function (index, currencyId) {
        const currencyDropDownItemHTML = `<a href="#">${currencyId.toUpperCase()}</a>`
        htmlCurrencySelector += currencyDropDownItemHTML
      })
      htmlCurrencySelector += `</div></div>`

      // Put currency selector onto  page
      $(`#${this._idComponent}`).html(htmlCurrencySelector)

      // Add component operation event handlers
      const button = document.getElementById(this._idButton)
      button.addEventListener("click", this)

      const input = document.getElementById(this._idInputbox)
      input.addEventListener("keyup", this)

      const dropdown = document.getElementById(this._idDropdown)
      const currencyElements = dropdown.querySelectorAll("a") 
      for (const currency of currencyElements.values()){
        currency.addEventListener("click", this)
      }
    }
    catch (errMsg) {
      throw ("Error in CurrencySelectorComponent: constructor(component): " + errMsg)
    }
  }

  getCurrencyId(){
    try {
      const currencyId = $(`#${this._idButton}`).text().trim()
      return currencyId
    }
    catch (errMsg) {
      throw ("Error in CurrencySelectorComponent:getCurrencyId(): " + errMsg)
    }
  }

  handleEvent(event) {
  // Handles component's operation events
    try {    
      switch(event.type) {
        case "click": // button or currency item?
          if (event.target.id == this._idButton){
            this._toggleShowHideDropDown()
          }
          else { // currency item selected
            // Set button text to new currency
            const currencyId = $(event.target).text()
            $(`#${this._idButton}`).text( currencyId )

            // Perform application specific actions
            this._currencyUpdateAppEventHandler(currencyId)

            // Close the dropdown
            this._toggleShowHideDropDown()
          }
        break
        case "keyup": // input box
            this._filterCurrencyList()
        break
        default:
            throw `Unexpected event type encountered, with event.type = ${event.type}`
      }
    }
    catch (errMsg){
      throw ("CurrencySelectorComponent Error: In handleEvent(event): " + errMsg)
    }
  }

  _toggleShowHideDropDown() {
    document.getElementById(this._idDropdown).classList.toggle("show")

    // Return input and list to original state
    document.getElementById(this._idInputbox).value = ""
    this._filterCurrencyList()
  }

  _filterCurrencyList() {
    const input = document.getElementById(this._idInputbox)
    const filter = input.value.toUpperCase()
    const dropdown = document.getElementById(this._idDropdown)
    const aElements = dropdown.getElementsByTagName("a")
    let text = ""
    for (let i = 0; i < aElements.length; i++) {
      text = aElements[i].textContent || aElements[i].innerText
      if (text.toUpperCase().indexOf(filter) > -1) {
        aElements[i].style.display = ""
      } else {
        aElements[i].style.display = "none"
      }
    }
  }
}

//
// Coin Search Component
//
class CoinSearchComponent extends SearchComponent {
  
  _createHtmlForListItem(suggestionOrSearchData, dataIndex) {
    // Implementation for to create Coin list item HTML (ie. a single list item). 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try {
      const coinId = suggestionOrSearchData[dataIndex].id
      const listItemText = suggestionOrSearchData[dataIndex].nameLine
      const listItemHtml = `<li><a href="coin.html?coinid=${coinId}"> ${listItemText} </a></li>`
      return listItemHtml
    }
    catch (errMsg){
      throw ("CoinSearchComponent error in _createHtmlForListItem(suggestionOrSearchData, dataIndex): " + errMsg)
    }
  }
  
  _listItemClickEvent(searchComponent, event) {
    // Implementation for a click event on a Coin Search List Item. 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try{    
      // Construct full url for the Coin page (ie. add currency )
      const currencySelector = $("#currencySelectorComponent").prop("currencySelectorObject")
      const currencyId = currencySelector.getCurrencyId().toLowerCase()
      const coinPageUrl = `${event.target.href}&currencyid=${currencyId}` 

      // Reset input and search list (in case user goes 'back' in browser)
      super._listItemClickEvent( searchComponent, event)
  
      // Goto Coin Page
      window.location.href = coinPageUrl
    }
    catch (errMsg){
      throw ("CoinSearchComponent error in _listItemClickEvent(searchComponent, event) " + errMsg)
    }
  }
}

//
// Exchange Search Component
//
class ExchangeSearchComponent extends SearchComponent {
  
  _createHtmlForListItem(suggestionOrSearchData, dataIndex) {
    // Implementation for to create Exchange list item HTML (ie. a single list item). 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try {
      const exchangeId = suggestionOrSearchData[dataIndex].id
      const listItemText = suggestionOrSearchData[dataIndex].nameLine
      const listItemHtml = `<li><a href="exchange.html?exchangeid=${exchangeId}"> ${listItemText} </a></li>`
      return listItemHtml
    }
    catch (errMsg){
      throw ("ExchangeSearchComponent error in _createHtmlForListItem(suggestionOrSearchData, dataIndex): " + errMsg)
    }
  }
  
  _listItemClickEvent(searchComponent, event) {
    // Implementation for a click event on a Exchange Search List Item. 
    // This method overides the superclass method of the same name (ie. in the SearchComponent class).
    try{    
      const exchangeDetailsPageUrl = event.target.href 

      // Reset input and search list (in case user goes 'back' in browser)
      super._listItemClickEvent( searchComponent, event)
  
      // Goto Coin Page
      window.location.href = exchangeDetailsPageUrl
    }
    catch (errMsg){
      throw ("ExchangeSearchComponent error in _listItemClickEvent(searchComponent, event) " + errMsg)
    }
  }
}