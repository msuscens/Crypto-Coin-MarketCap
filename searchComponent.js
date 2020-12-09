
/* DOCUMENTATION - *** TODO - Move to README??? 
                              And/Or create seperate GitHub project for this component! ??? ****
  Overview of the SearchComponent:
    This component provides a search control consisting of a text input search box, and dropdown
    suggestions/search list of relevant items.  SearchComponent is a superclass from which subclass
    should be created by the developer specific to his own application needs.

    User experience: Upon the user clicking on the search input box a drop down list appears,
    immediately below the search input box, containg recommended options.  Should the user
    type into the search input box this suggested items list is updated with options matching part
    of the search text input.  Should the user click on any item in the suggestions/search list
    (or press enter in the search input box - which automatically selects the first item in the list)
    an application specific action (eg takes the user to another webpage) 
    
  Component Implementation by Developer:
    1. The developer must provide the requiste object upon instantiating the
    Search Component.  This data object provides the 'suggestion' and 'search' datasets,
    and various component elements such as ids and titles to be applied in the search object's
    construction (see Constructor details below for specification of data object to be used).

    2. The developer must create a subclass (that inherits from the searchCoin superclass
        (eg. coinSearchComponent extends SearchComponent) and write the following methods within it.
        These methods should be specific to the application of the search component and overide the
        methods of the same name in the searchComponent super class. 
        i.  _createHtmlForListItem( suggestionOrSearchData, dataIndex )
        ii. _listItemClickEvent( searchComponent, event)

    3. The developer may then create new search components at run time as required,
        eg.  new coinSearchComponent( searchComponentData )
  
  Component Configuration (via superclass constructor method):
    This performed via cthe class constructor method from the data in its' parameter object
    (searchComponentData).

    searchComponentData must an object containing: 
    {
      idSC: <string> Id of existing HTML div into which search component is to be created 
            (e.g. if HTML div is: <div id="mySearchComponent'"> then idSC: "mySearchComponent")
      idSCForm: <string> Id that search component's form will be given (eg "coinSearchForm"),
      idSCInput: <string> Id that search component's text Input element will be given (eg "coinSearchInput")
      idSCList: <string> Id to assign to search results/suggestions List (eg"coinSearchList")
      textSC: { input_title: <string> Title text for the input box (eg. "Type in a coin name or id"),
                input_placeholder: <string> Placeholder text for the input box (eg. "Search for a coin...")
                suggestions_list_title: <string> Title text for the suggestions list (eg. "Trending searches:")
                searchPool_list_title: <string> Title text for the search results list (eg. "Top matching coins:")
              }
      searchPool: An array of objects.  The main data pool for the search.
              Each object in the SearchPool array must have the following content:
              { 
                  nameLine: <string> Used as search text and displayed in search results list (MANDATORY)
                            (eg. nameLine:"Bitcoin (btc)")

                << Other fields may be optionally included by developer to support implementation
                of the applications Search Component actions. For example, for a
                coin Search Component we may have the following: Eg. >>
                  id : <string> The coin id (eg. "bitcoin").
                      (Which could be required by developer to construct url for each list item's href)
                  name: <string> The name of the coin (eg. "Bitcoin")
                  symbol: <string> The ticker symbol for the coin (eg. "btc")
                  etc ...:  Basically any data that developer requires to perform event actions upon the
                        user selecting an item on the components suggestion/search list.
                },
                {
                  nameLine: "Ethereum (eth)",
                  id : "eth",
                  name": "ethereum",
                  symbol": "eth",
                }, ... etc

      suggestions : An array of objects.  Used to provide an initial suggestion list to the user before
                    they type any search criteria (to produce a filtered search list of options).
                    Each object in the suggestions array must have the following content:
                    (Note: Same object structure as searchPool object - see above.)
              {
                {
                  nameLine: <string>  Used to displaye suggestions list (MANDATORY)
                            (eg. nameLine:"Tether (usdt)")
                  << Following fields all optional and defined/provided as required by developer.
                   For example, for a coin Search Component we may have the following: Eg. >>>>
                  id : "usdt"
                  name": "Tether"
                  symbol": "usdt",
                },
                {
                  nameLine: "Aave (aave)""

                }, ... etc
              }
      maxItemsInSearchList : <integer> Maximum number of list items to be put into
                                      the search match list from a search (eg. 8)                                           
    }
*/

/*  *** Development thoughts - Possible future TODOs

1. This class is too big, refactor to break out a number of smaller interacting classes.
    Eg. Classes for SearchComponent, SearchComponentInput, SearchComponentList ...

2. Question should I replace all jquery in this component? - ie. to make it generally
    usable without jquery!?  Or ensure jQuery is used where-ever for x-browser compatibiity??
    Or do nothing ie. keep mix of methods??
    *** TODO : Consider which approach to adopt!  ***

**** */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

//
// Search Component Super Class
//
class SearchComponent {

    constructor(searchComponentData) {
      try {
        this._data = searchComponentData
        this._searchListItemClicked = false
  
        // Create component' HTML and display
        const htmlForListOptions  = this._createListItemHtmlForSearchSuggestions()
        const searchComponentHtml = `<div>
                                        <form id="${this._data.idSCForm}">
                                          <input id="${this._data.idSCInput}" class="searchInputSC rounded-pill"
                                            type="text" placeholder="${this._data.textSC.input_placeholder}"
                                            title="${this._data.textSC.input_title}">
                                          <ul id="${this._data.idSCList}" class="searchListSC shadow d-none"
                                              aria-label="${this._data.textSC.suggestions_list_title}"> 
                                            ${htmlForListOptions}
                                          </ul>
                                      </form>
                                    </div>`
/*  *** TODO : Add search icon into input text box                                 
        Use method 3 from: https://stackoverflow.com/questions/35821279/positioning-an-image-inside-a-text-input-box/35821416
        <a href="#"><image src="" <i class="fas fa-search"></i> alt=img style="width:50px; height:50px;"></a>
*/
        $(`#${this._data.idSC}`).html(searchComponentHtml)
  
        // Add event lisenters to the search component:
        this._addSearchComponentEventListeners()

      }
      catch (errMsg) {
        throw ("Error in SearchComponent: constructor(searchComponentData): " + errMsg)
      }
    }
  
    _createListItemHtmlForSearchSuggestions(){
      try {
        let listItemsHtml = ""
        for (let i = 0; i < this._data.suggestions.length; i++){
          listItemsHtml += "\n" + this._createHtmlForListItem( this._data.suggestions, i)
        }
        return listItemsHtml
      }
      catch (errMsg){
        throw ("In _createListItemHtmlForSearchSuggestions(): " + errMsg)
      }
    }
  
    _createHtmlForListItem( suggestionOrSearchData, dataIndex ){
    // ********   Developer should overide this method by creating SearchComponent subclass.   ********
    // The developer to create an inheriting subclass for the application's specific implementation,
    // overidding this superclass method (to return HTML for the application's list item).
    // ************************************************************************************************
      try {
        throw("Method not overriden in subclass, so unable to create application specific list item html.") 
      }
      catch (errMsg){
        throw ("In _createHtmlForListItem(suggestionOrSearchData, dataIndex): " + errMsg)
      }
    }
  
    _addSearchComponentEventListeners(){
      try{
        // To the Form element
        const searchForm = document.getElementById( this._data.idSC ) 
        searchForm.addEventListener("submit", this )
    
        // To the search text Input 
        const searchInput = document.getElementById( this._data.idSCInput )
        searchInput.addEventListener("click",this)
        searchInput.addEventListener('keyup', this)
        searchInput.addEventListener('focusout', this)
    
        // To the (search/suggestions) List
        const searchList = document.getElementById( this._data.idSCList )
        searchList.addEventListener("mousedown", this)
        searchList.addEventListener("mouseup", this)
    
        // To all the (search/suggestions) list items
        this._addClickEventListenerToAllListItems()
      }
      catch (errMsg){
        throw ("In _addSearchComponentEventListeners(): " + errMsg)
      }
    }
    
// *** SearchComponent's Event Listener  *** //
//
    handleEvent(event) {
      try {    
        switch(event.type) {
          case "click": // in search input box
              if (event.target.id == this._data.idSCInput){
                this._showSearchList()             
              }
              else { // was 'click' on list item
                event.preventDefault()
                this._listItemClickEvent( this, event )
              }
          break
          case "keyup": // in search input box
              const inputText = document.getElementById(`${this._data.idSCInput}`).value
              if ( inputText == "" ) this._createSuggestionsList()
              else this._updateSearchListResults()
          break
          case "focusout": // of search input box
              this._closeSearchList()
          break
          case "mousedown": // of search list
              this._searchListItemClicked = true
          break
          case "mouseup": // of search list
              this._searchListItemClicked = false
          break
          case "submit": // search form
              // Trigger a 'click' on first list item
              event.preventDefault()
              const searchList = document.getElementById( this._data.idSCList )
              const firstListElement = searchList.querySelector(`li a`)
              firstListElement.click()
          break
          default:
              throw `Unexpected event type encountered, with event.type = ${event.type}`
        }
      }
      catch (errMsg){
        throw ("SearchComponent Error: In handleEvent(event): " + errMsg)
      }
    }
    
  // *** SearchComponent's Event Processing Methods  *** //
  //
    _showSearchList(){
      try {
        const searchListId = $(`#${this._data.idSCList}`)
        searchListId.removeClass("d-none")
        searchListId.addClass("d-block")
      }
      catch (errMsg){
        throw ("In _showSearchList(): " + errMsg)
      }
    }
  
    _listItemClickEvent(searchComponent, event) {
    // ********  This method is should be overridedn by a SearchComponent subclass method.  **********
    // ***********************************************************************************************
      try{
        // *** Implement application specific code to be written in a subclass method, ie.                       ***
        // *** Overide this method in a Search Component subclass (with a method of same name).    ***
        // *** Implementation may, for example, construct new page url and then after reseting     ***
        // *** input & search lists (by calling this superclass method) may load the new page.     ***               ***

        // Reset input and search list (in case user goes 'back' in browser). [ Note: To be called
        // from overiding sub-class method by: super._listItemClickEvent(searchComponent, event) ]
        searchComponent._closeSearchList()
        searchComponent._createSuggestionsList()
        document.getElementById( searchComponent._data.idSCInput ).value = ""
        document.getElementById( searchComponent._data.idSCInput ).blur()
    
        // *** Implementation specic code required (via overiding subclass method).  ***
        // *** (Eg. window.location.href = newPageUrl )                              ***
      }
      catch (errMsg){
        throw ("In _listItemClickEvent(searchComponent, event): " + errMsg)
      }
    }
  
    _updateSearchListResults(){
      try {
        setTimeout(() => {
          const inputText = document.getElementById(`${this._data.idSCInput}`).value
          const searchList = $(`#${this._data.idSCList}`)
          let numListItemsToAdd = (this._data.maxItemsInSearchList < this._data.searchPool.length) ?
                                  this._data.maxItemsInSearchList : this._data.searchPool.length 

          searchList.attr("disabled",false) 
          searchList.html("")  
          
          // Ensure 'search list' title is set 
          if (inputText.length == 1) { // List previosuly may have been a 'suggestions list'
              searchList.attr("aria-label", this._data.textSC.searchPool_list_title)
          }
  
          // Check each data element to be searched and add matches to list (until full)
          for (let i = 0; (i < this._data.searchPool.length) && (numListItemsToAdd > 0); i++){
            if (this._data.searchPool[i].nameLine.indexOf(inputText) != -1) {
                  // There's a match, so create a list item
                  const listItemHtml = this._createHtmlForListItem( this._data.searchPool, i )              
                  searchList.append( listItemHtml )
  
                  // Add event handler for list item
                  const listItemNumber = this._data.maxItemsInSearchList - numListItemsToAdd
                  const lastListItem = document.querySelectorAll(`#${this._data.idSCList} li a`)[listItemNumber]
                  lastListItem.addEventListener("click",this)
  
                  numListItemsToAdd--
            }
          }
        },300)
      }
      catch (errMsg){
        throw ("SearchComponent error in _updateSearchListResults(): " + errMsg)
      }
    }
  
    _createSuggestionsList(){
      try {  
        // Set suggestions list title
        const searchList = $(`#${this._data.idSCList}`)
        searchList.attr("aria-label", this._data.textSC.suggestions_list_title)
  
        // Set suggestions list items, and event listener
        const htmlForListItems  = this._createListItemHtmlForSearchSuggestions()
        searchList.html(htmlForListItems)
        this._addClickEventListenerToAllListItems()
      }
      catch (errMsg){
        throw ("SearchComponent error in _createSuggestionsList(): " + errMsg)
      }
    }
  
    _addClickEventListenerToAllListItems(){
      try {  
        // Add to each search list item a 'click' event listner
        const searchList = document.getElementById( this._data.idSCList )
        const listElements = searchList.querySelectorAll("li a") 

        for (const listItemElement of listElements.values()){
          listItemElement.addEventListener("click", this)
        }
      }
      catch (errMsg){
        throw ("In _addClickEventListenerToAllListItems(): " + errMsg)
      }
    }
  
    _closeSearchList(){
      try {
        if (this._searchListItemClicked == true) {
          // Need to process list item click, so don't close search list yet 
          return
        }
        else {  // Clicked elsewhere, so close the search list
            $(`#${this._data.idSCList}`).removeClass("d-block")
            $(`#${this._data.idSCList}`).addClass("d-none")
        }
      }
      catch (errMsg){
        throw ("In _closeSearchList(): " + errMsg)
      }
    }
  }  // Endof class SearchComponent
  
  
  