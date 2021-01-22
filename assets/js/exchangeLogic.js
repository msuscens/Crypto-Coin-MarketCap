/* Javascript logic for the exchange details page */

// Switch on enhanced error checking by:
// 1. Enabling Javascript 'strict mode'
"use strict"
// 2. Enabling VS Code's Error Checking [by adding comment '// @ts-check' ] 
// @ts-check

// Where to store and retrive the table data and graph data
const idElementStoringTradingPairsTableData = "exchangeTickersTable" 
const idElementStoringTradingVolumeGraphData = "exchangeTradingVolumeGraph" 

// Initial page parameters 
const exchangeId = getParamFromUrl( window.location.href, "?exchangeid=")
const graphStartDaysAgo = 365       // Default for inital page load

// Collate metadata (on page's trade volume graph and trading pairs table)
const metadataForPage = {
    graph: {
        exchangeId:  exchangeId,
        graphStartDaysAgo: graphStartDaysAgo, 
    },
    table: {
        exchangeId:  exchangeId,
        currentPageNumber: 1,
        rowsPerPage: 100,
        currentPageNumber: 1,
        loadTableDataFunction: reloadTradingPairsTable,
        populateTableFunction: populateTradingPairsTable
    },
    searchSuggestions: {      // Exchanges with highest 'trust score'
          rowsPerPage: 10,    
          currentPageNumber: 1
    }
}

// Save meta data (in html elements as properties)
 $("#"+idElementStoringTradingPairsTableData).prop("tableMetadata",metadataForPage.table)
 $("#"+idElementStoringTradingVolumeGraphData).prop("graphMetadata",metadataForPage.graph)


try {
    // Fetch the live data
    getTheExchangeDetailsPageData(metadataForPage)
    .then (
        (data) => {
            // Save page's graph and table data (into the html table body)
            $("#"+idElementStoringTradingVolumeGraphData).prop("graphData",data.graph)
            $("#"+idElementStoringTradingPairsTableData).prop("tableData",data.tickers)

            // Add data to the webpage
            displayExchangeHeader(data)
            populateTradingPairsTable(data.tickers)

            // Put the exchange search component onto the page
            const componentCriteria = { idSC: "exchangeSearchComponent",
                                        idSCForm: "exchangeSearchForm",
                                        idSCInput: "exchangeSearchInput",
                                        idSCList: "exchangeSearchList",
                                        textSC: { input_title: "Type in an Exchange name or id",
                                                  input_placeholder: "Search for an Exchange...",
                                                  suggestions_list_title: "Top Exchanges [trust score]:",
                                                  searchPool_list_title: "Exchange matches:"
                                                },
                                        searchPool: data.all_the_exchanges,
                                        suggestions: data.exchanges_with_highest_trustscore,
                                        maxItemsInSearchList : metadataForPage.searchSuggestions.rowsPerPage                                           
                                       }

            const exchangeSearch = new ExchangeSearchComponent(componentCriteria)
          }  
        )
} catch (errMsg) {
    console.log("ExchangesLogic.js Main code: Something went wrong: " + errMsg)
}

function displayExchangeHeader(exchange){
    try {
        // Display the basic exchange data
        const exchangeNameLine = `<img src="${exchange.image}" border=3 height=50 width=50>
                                <big><strong> &nbsp ${exchange.name}</strong></big> (${exchange.id})`
        const exchangeTradeVolumeLine = `Volume: <strong>
                    <span>&#x20bf</span>${Math.round(exchange.trade_volume_24h_btc).toLocaleString()} BTC</strong>`
        const exchangeTrustScore = `Trust Score: ${exchange.trust_score.toString().replace(/NaN/g, "-")} / 10`
        const yearEstablished = `Year Est. ${exchange.year_established.toString().replace(/NaN/g, "-")}`

        let exchangeNature = exchange.centralized  // May be true, false or 'unknown'
        if (exchange.centralized === false) exchangeNature = "Decentralized"
        if (exchange.centralized === true) exchangeNature = "Centralized"

        let tradingIncentive = ""                // May be true, false or 'Unknown'
        if (exchange.has_trading_incentive === true) tradingIncentive = "Trading Incentive"
    
        $("#trustRank").html(exchange.trust_score_rank)
        $("#exchangeIconNameId").html(exchangeNameLine)
        $("#tradeVolumnLine").html(exchangeTradeVolumeLine)
        $("#trustScoreLine").html(exchangeTrustScore)

        $("#country").html(exchange.country)
        $("#yearEstablished").html(yearEstablished)
        $("#exchangeNature").html(exchangeNature)
        $("#tradingIncentive").html(tradingIncentive)       
    }
    catch (errMsg){
        throw ("In displayExchangeHeader(exchange: " + errMsg)
    }
}

function populateTradingPairsTable(tickers) {
// Fill the table with the exchange's trading-pairs data
  try {
      const htmlTradingPairsTableID = $("#myExchangeTradingPairsTableBody")
      htmlTradingPairsTableID.html("")
      $.each(tickers, function (index, ticker) {
        const tableRowHtml = constructTradingPairTableRowHtml(ticker)

        // Replace 'NaN' numbers, with display character ('-')              
        const tableRowHtmlwithNaNsReplaced = tableRowHtml.replace(/NaN/g, "-")

        htmlTradingPairsTableID.append(tableRowHtmlwithNaNsReplaced)
      })
  }
  catch (errMsg) {
      throw("In populateTradingPairsTable(tickers): " + errMsg)
  }
}

function constructTradingPairTableRowHtml(ticker) {
// Create and return the HTML string for a row of the Trading-pairs table
  try {
    const baseNameLine = `${ticker.base} (${ticker.coin_id})`
    const targetNameLine = `${ticker.target} (${ticker.target_coin_id})`

    const rowStateColor = (ticker.trust_score === "green") ? "" : ticker.trust_score
    const rowTitleOnState = `Trust Level:'${ticker.trust_score}'\n` +
                            `Stale:'${ticker.is_stale}'\n` +
                            `Anomaly:'${ticker.is_anomaly}'`

    const tickerRowHtml = `<tr name="tickerTableRow" style="background-color:${rowStateColor}"
                            title="${rowTitleOnState}"> 
                              <td>${ticker.import_order}</td>
                              <td title="${baseNameLine}">${ticker.base}</td>
                              <td title="${targetNameLine}">${ticker.target}</td>
                              <td>${ticker.last.toLocaleString()}</td>
                              <td>${ticker.bid_ask_spread_percentage.toFixed(4)}%</td>
                              <td>${Math.round(ticker.volume).toLocaleString()}</td>
                              <td title="From data fetch at: ${ticker.last_fetch_at}">${ticker.last_traded_at.toLocaleString()}</td>
                            </tr>`
    return tickerRowHtml
  }
  catch (errMsg) {
    throw("In constructTradingPairTableRowHtml(ticker): " + errMsg)
  }
}

function reloadTradingPairsTable() {
// Event Handler to "Refresh" the Trading Pair's table
  try {
    // Retreive the table's metadata
    const tableMetadata = $("#"+idElementStoringTradingPairsTableData).prop("tableMetadata")

    // Obtain the coin data
    getExchangeData(tableMetadata)
    .then (
      (data) => {
        $("#"+idElementStoringTradingPairsTableData).prop("tableData", data.tickers)

        // Display the tickers data in the table
        populateTradingPairsTable(data.tickers)
      }) 
  }
  catch (errMsg) {
    throw("In reloadTradingPairsTable() event handler: " + errMsg)
  }
}
  
