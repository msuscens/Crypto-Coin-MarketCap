Crypto-Coin-MarketCap

My Coinmarketcap.com inspired project:  The home (index) page show coin price and exchange data, and the coin details page displays a price graph for the selected coin
(plus other coin statistics).
Users may sort the tables by column (coins, exchanges and trading-pairs table).
Clicking on a row in the coin table (or exchanges table), invokes coin details page
(or exchange details page).  Alternatively use the 'coin search' to go to the coin 
details page (or use the 'exchange search' on exchange details page). There's a
currency selector for the coins table and the coin details page.
Live coin and exchange data is obtained via CoinGeko API calls.

This personal project is being developed by Mark Suscens as a learning project
(employing HTML, CSS, Bootstrap, JQuery and JavaScript).

Project Status:  The project is under development but is functional, using live API data.

Next Steps:
  i) Refine styling of the index, coin details, and exchange details pages.

The code is organised as follows:
- interfaceAPI.js   : Obtains the application data (via API calls), handling missing data and
                      collating into structure expected by the index, coin, and exchange pages
- index.html        : Home page that present coin price and exchanges.
- indexLogic.js     : Home page javascript code (including adding dynamically created components, 
                      eg. coin search component)
- coin.html         : Coin details page; displays a coin price graph and coin statistics 
- coinLogic.js      : Coin details page dynamic code (javascript)
- exchange.html     : Exchange details page; displays a trading volume graph and trading pairs table 
- exchange.js       : Exchange details page's dynamic code (javascript)

- styles.css        : The css styles for the project, i.e the index and coin pages

- tableFunctions.js : Generic Event handling functions used for all tables in application
                      for table column sorting, paging and table data reload (refresh)
                      - see below for dcumentaion on use

- componentClassess.js      : Custom dynamic components. Includes the 'coin search',
                              'exchange search', and 'currency selector' components
                              (used on the index, coin, and exchange pages)
- searchComponentClass.js   : Search Component Super Class for the 'coin search'
                              and 'exchange search' component classes
- searchComponentStyles.css : The css styles for the Serach Component super class


- helperFunctions.js        : Functions supporting page logic implementaion
                              (but are not application specific).


Note: Requires local server to be running, eg. in terminal window:
  cd to code directory, and then
  python3 -m http.server
  (Or run from VS Code using LiveServer)


___________________________________________________________________________

DEVELOPER DOCUMENTATION FOR RE-USABLE CODE:

Generic Table Sorting, Paging and Reload event handlers [tableFunctions.js]

Purpose: Allows a single event handler to be employed (one for each of these operations) 
        across all the applications tables.

Implementation:  To use in other applications, requires that:
1. Each table's data and metadata is held by a HTML element in two properties 
   created on the element (called 'tableData' and 'tableMetadata'):
      'tableData' holds an object with data attributes for each table columns
      'tableMetaData' object for each table must include attributes of:
          rowsPerPage:            set to number of rows in table 
          currentPageNumber:      typically initially set to 1
          loadTableDataFunction:  name of function to be called to reload data
                                  (based upon 'tableMetaData') and to then
                                  store it in 'tableData' property
          populateTableFunction:  name of function to be called to put the
                                  'tableData' into the table
          
 2. The HTML element (that holds the table data) must be a parent of both
    the table and the tables paging/ reload buttons.  And this HTML element
     must be given an id (which we'll refer to below as idHtmlElementWithTableData)

 3. The each sort column table header (<th>), and each paging/refresh button has:
    a) their html "onclick" event handler as the relevant one of:
         i)   sortTableRows(event, idHtmlElementWithTableData)
         ii)  loadNextPageIntoTable(idHtmlElementWithTableData)
         iii) loadPreviousPageIntoTable(idHtmlElementWithTableData)
         iv)  loadFirstPageIntoTable(idHtmlElementWithTableData)
    b) each of the html tables column headers <th> must be given an attribute 
      'dataObjectAttribute' that must be set to the table data object attribute's
      name that will populate this table column (ie. it maps the table column to
      the table data).


TODO : *** Add similar documention for the data layer (InterfaceAPI) here ***

TODO : *** Add similar documention for the Search Component Super Class   ***
       *** and derived search components here (rework draft below)        ***

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

