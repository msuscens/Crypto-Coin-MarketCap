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

function coinSearchBarHtml(availableCoins, mostPopularCoinSearches) {
    
    let title = "Search"
    if (fieldText[0].length) title = `<h3>` + fieldText[0] + `</h3> <br>`

    let mySearchBarBox = title +
      `<label for="` + fieldText[2] + `">` + fieldText[1] + `</label>` + `
                <input class="form-control" type="text" id="`+ fieldText[2] + `">`

    return myInputBox
  }




// COMPONENT HELPER FUNCTIONS