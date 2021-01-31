Crypto-Coin-MarketCap

This personal project is being developed by Mark Suscens as a learning project
(employing HTML, CSS, Bootstrap, JQuery and JavaScript).  In it I've develped a number of
reusable components notably : the generic table sorting and paging functions, and the 
search component super class (used to develop the coin search and exchange search components).

My Coinmarketcap.com inspired project:  Website Overview
The home (index) page presents tables of coin prices and exchanges. The coin details page displays 
a price graph for the selected coin (plus other coin statistics), whilst the exchange details page
presents a trading volume graph and table of the exchange's trading pairs.  Both he graph's start
date can be set by the user (with the graph being redrawn).
Clicking on a row in the coin table (or exchanges table), takes the user to the coin details page
(or exchange details page).  Using the 'coin search' (or 'exchange search') also takes the user
to the coin (or exchange) details page. 
On the coin price table and the coin details page there's a currency selector.
The coin and exchange tables include table sorting controls, next and previous paging, and a
refresh (data resync) button.
Live coin and exchange data is obtained via CoinGeko API calls.

Status:  The project is under development but is fully functional as it stands.

Next Steps:
  i) Refine styling of the index, coin details, and exchange details pages.
 ii) Add loading giff while page loads and upon refresh/reload of graphs and tables
iii) Refactor backend InterfaceAPI code and split into several files under assets/backend directory
  v) Refactor to add an app.js initiation file (to replace current initatiaion via index.html)
 vi) Change thrown errors from developer relevant to user messages / error handling
vii) Update/complete documentation on reuseable search components developed during this project.

Code Files are organised as follows:
/
- index.html        : Home page that presents a table of coin prices and a table of exchanges.
                      NB. To initiate application invoke index.html (there's no app.js yet).

- coin.html         : Coin details page; displays a coin price graph and coin statistics.

- exchange.html     : Exchange details page; displays a trading volume graph and trading pairs table. 

/assets/css/
- styles.css        : The css styles for the application.
- searchComponentStyles.css : The css styles for the Serach Component super class

/assets/js/backend/
- interfaceAPI.js   : Backend data layer for the application.  Obtains the application data (via API 
                      calls), adds fallback values for missing data and collates into object format required by the index, coin details, and exchange details pages.

/assets/js/frontend/
- helperFunctions.js  : Functions supporting frontend page logic implementaion (application independent).

/assets/js/frontend/pageLogic/
- indexLogic.js     : Home page javascript code; adds dynamically created html components to page,
                     and contains page's event handlers.

- coinLogic.js      : Coin details page javascript code; adds dynamically created html components
                    to page, and contains page's event handlers.

- exchange.js       : Exchange details page's javascript code; adds dynamically created html 
                    components to page and contain's page's event handlers.

/assets/js/frontend/components/
- tableFunctions.js : Generic Event handling functions used for all tables in the application
                      for table column sorting, paging and table data reload (refresh)
                      - see below for documentaion on their use/re-use.

- graphFunctions.js : Functions used to create graphs in the application
                      (i.e. for graphs on coin details and exchange details pages). 

- componentClassess.js  : Custom dynamic components. Includes the 'coin search',
                          'exchange search', and 'currency selector' components
                          (used on the index, coin, and exchange pages).

- searchComponentClass.js  : Search Component Super Class for the 'coin search' and
                            'exchange search' component classes.

In additioan there are:
/
- README                  : This file!
- CoinCap.code-workspace  : The Visual Studio Code's workspace file for this application.

/.vscode
- launch.json             : Configuration file for launching the VS Code debugger with this application.


Note: Application requires local server to be running, eg. in terminal window:
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

