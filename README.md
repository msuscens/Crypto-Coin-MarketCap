Crypto-Coin-MarketCap

My Coinmarketcap.com inspired project:  The index page show coin data focusing on price, and the
coin page displays a price graph for the selected coin and other coin statistics.  On both pages there is a coin search control, currency selector etc.  Live coin data is obtained via CoinGeko API calls.

This project was developed by Mark Suscens as a learning project (to employ HTML, CSS, Bootstrap, JQuery and JavaScript).

The code is organised as follows:
- interfaceAPI.js : Obtains all external data (via API calls), handling missing data and collating into
                    data structure expected by the index and coin pages
- index.html      : Home page, that displays the table of coins with price data
- indexLogic.js   : Home page javascript code (including adding dynamically created components 
                    such as the coin search component)
- coin.html       : Coin page, that displays a graph of specific coins and various coin statistics 
- coinLogic.html  : Coin pages dynamic code (javascript)
- styles.css      : The css styles for the project, i.e the index and coin pages

- components.js   : Custom dynamic components used on the index and coin pages. Includes the coin search
                    object (which inherits from and overides the search component)
- searchComponent.js : Search Component Super Class, that is parent object for the coin search component
- searchComponentStyles.css : The css styles for the Serach Component super class

- helpers.js : Functions that support implementation of page logic (but are application specific).


Note: Requires local server to be running, eg. in terminal window:
  cd to code directory, and then
  python3 -m http.server
  (Or run from VS Code using LiveServer)


Project Status:  The project is still under-development but is functional, using live API data.

Next Steps:
  i)   Refine styling of the index and coin pages (including search component)
  ii)  Add the Exchange tab/page - currently not implemented (but tab selector appears on index page)
  iii) Refactor coin search object to break down into a set of smaller objects
  iv)  Create a new git/gitHub repository for the 'Search Component' superclass, together with    
        documentation for other developers on usage to create their own derived search components.
        (A rough draft of such documemtation is in APPENDIX below.)

___________________________________________________________________

APPENDIX
  Search Component Super Class and derived search components: 

    Overview:
    This component provides a search control consisting of a text input search box, and dropdown
    suggestions/search list of relevant items.  SearchComponent is a superclass from which subclass
    should be created by the developer specific to his own application needs.

    User experience: Upon the user clicking on the search input box a drop down list appears,
    immediately below the search input box, containg recommended options.  Should the user
    type into the search input box this suggested items list is updated with options matching part
    of the search text input.  Should the user click on any item in the suggestions/search list
    (or press enter in the search input box - which automatically selects the first item in the list)
    an application specific action (eg takes the user to another webpage) 
    
    Specific Search Component Implementation by Developer:
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
    This performed via the class constructor method from the data in its' parameter object
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

