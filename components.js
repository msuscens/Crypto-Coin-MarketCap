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


// Coin Search Component object

const COIN_SEARCH_COMPONENT = {
  _availableCoins: getAvailableCoins(),
  _popularSearches: getMostPopularCoinSearches(),
  _maxInSearchList: 8,
  _searchListItemClicked: false,

  _createPopularSearchesListOptionsHtml: function(){
    let coinListOptionsHtml = ""
    const currencyId = $("#currencyLabelCS").text()
    for (let i = 0; i < this._popularSearches.length; i++){
      const popularCoin = `${this._popularSearches[i].item.nameLine}`
      const coinId = this._popularSearches[i].item.id
      coinListOptionsHtml += `\n<li><a href="coin.html?coinid=${coinId}&currencyid=${currencyId}"> ${popularCoin} </a></li>`
    }
    return coinListOptionsHtml
  },

  
  createComponentHtml: function(){

    const htmlCoinListOptions  = this._createPopularSearchesListOptionsHtml()

    const htmlSearchBar = `<div>
                              <form onsubmit="return COIN_SEARCH_COMPONENT.selectFirstItemInSearchList()">
                                <input id="coinSearchInput" class="rounded-pill"
                                  type="text" placeholder="Search for a coin..."
                                  title="Type in a coin name or id"
                                  onclick="COIN_SEARCH_COMPONENT.showSearchList()"
                                  onkeyup="COIN_SEARCH_COMPONENT.searchEngine()">
                                <ul id="coinSearchList" class="searchList shadow d-none"
                                    aria-label="Trending searches:"> 
                                  ${htmlCoinListOptions}
                                </ul>
                            </form>
                          </div>`

    return htmlSearchBar
  },

  showSearchList: function(){
    console.log("In showSearchList()")
    const searchList = $('#coinSearchList')
    searchList.removeClass("d-none")
    searchList.addClass("d-block")
  },

  searchEngine: function(){
    setTimeout(() => {
      const inputText = document.getElementById("coinSearchInput").value                 
      const searchList = $('#coinSearchList')
      let numListItemsToAdd = (this._maxInSearchList < this._availableCoins.length) ?
                              this._maxInSearchList : this._availableCoins.length             
      searchList.attr("disabled",false) 
      searchList.html("")
      const currencyId = $("#currencyLabelCS").text().toLowerCase() 
      for (let i = 0; (i < this._availableCoins.length) && (numListItemsToAdd > 0); i++){
        if (this._availableCoins[i].nameLine.indexOf(inputText) != -1) {
              const coinId = this._availableCoins[i].id
              const listItemHtml = `<li><a href="coin.html?coinid=${coinId}&currencyid=${currencyId}">${this._availableCoins[i].nameLine}</a></li>`
              searchList.append( listItemHtml )
              numListItemsToAdd--
        }
      }
    },300)
  },

  selectFirstItemInSearchList: function(){  //  renamed from loadCoinPage()
    try {
      console.log("In selectFirstItemInSearchList()")

      // get the href of first list item, and go to that url
      const url = getFirstListItemsHrefUrl()
      window.location.href = url
      return false
    }
    catch (errMsg){
      console.log( "Error caught in eh selectFirstItemInSearchList(): " + errMsg )
    }
  },

}

// SEARCH COMPONENT HELPER FUNCTIONS

function getFirstListItemsHrefUrl(){
  try {
    const listHtml = $('#coinSearchList').html()
    const preceddingHtmlForHref = '<li><a href="'
    const startIndexOfFirstListItem = listHtml.indexOf(preceddingHtmlForHref)
    if ( startIndexOfFirstListItem > -1){  
      // Extract the href url (of first list item)
      const startIndexOfHrefUrl = startIndexOfFirstListItem + preceddingHtmlForHref.length
      const endIndexOfHrefUrl = listHtml.indexOf('"', startIndexOfHrefUrl+1)
      if (endIndexOfHrefUrl > -1){
        const hrefUrlFromHtml = listHtml.slice( startIndexOfHrefUrl, endIndexOfHrefUrl)
        const url = decodeHtml( hrefUrlFromHtml )
        console.log(`hrefUrlFromHtml=${hrefUrlFromHtml}`)
        console.log(`url=${url}`)
        return url
      }
      else {
        throw "href url was not found (for the first list item)."
      }
    }
    else {
      throw "Html for start of first list item was not found."
    }
  }
  catch (errMsg){
    throw("Error: href url not found by getFirstListItemsHrefUrl(): " + errMsg)
  }
}


function decodeHtml(html) {
  const textElement = document.createElement("textarea")
  textElement.innerHTML = html
  return textElement.value
}



