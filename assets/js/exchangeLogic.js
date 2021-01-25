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
    // Fetch the page data
    getContentForExchangeDetailsPage(metadataForPage)
    .then (
        (data) => {
            // Set graph's additional characteristics
            data.graph.style = getGraphStyle()
            data.graph.title = `Total Trading Volume across all trading pairs (in BTC)`
            data.graph.currency_symbol =  getCurrencySymbol("BTC")

            // Save page's graph and table content
            $("#"+idElementStoringTradingVolumeGraphData).prop("graphData",data.graph)
            $("#"+idElementStoringTradingPairsTableData).prop("tableData",data.tickers)

            // Add content to the webpage
            displayExchangeHeader(data)
            displayGraph(data.graph)
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


// Initialise date picker (for graph start date)
$(function () {
  try {
    $("#myDatepicker").datepicker({
        dateFormat: "yy-mm-dd", defaultDate: `-${graphStartDaysAgo}d`,
        maxDate: "-5d", minDate: new Date(2010, 1 - 1, 1),
        yearRange: "2010:c"
    })
    $("#myDatepicker").datepicker("setDate", `-${graphStartDaysAgo}d`)
  }
  catch (errMsg) {
    throw("In Initialise date picker: " + errMsg)
  }
})


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


//
// TRADING VOLUME GRAPH RELATED FUNCTIONS
//

$("#myShowChartButton").click(async function () {
// Event handler for clicking 'Update' button:  Display trading volume graph (from the start date)
  try {
      // Get new start date (saving into the graph metadata)
      const startDate = $("#myDatepicker").datepicker("getDate")
      const daysAgo = Math.ceil( getDaysAgo(startDate) )
      const graphMetadata =  $("#"+idElementStoringTradingVolumeGraphData).prop("graphMetadata")
      graphMetadata.graphStartDaysAgo = daysAgo
      $("#"+idElementStoringTradingVolumeGraphData).prop("graphMetadata", graphMetadata)
      
      // Update the trading volume coordinates (required for the graph)
      const newTradeHistory = await getTradingVolumeHistory(graphMetadata)
      const graph = $("#"+idElementStoringTradingVolumeGraphData).prop("graphData")
      graph.coordinates = newTradeHistory.graph.coordinates
      $("#"+idElementStoringTradingVolumeGraphData).prop("graphData", graph)

      // Display the graph
      displayGraph(graph)
  }
  catch (errMsg) {
      throw("In event handler: $('#myShowChartButton').click(async function ( ... ): " + errMsg)
  }
})
  

function getGraphStyle() {
  try {
    return  { type: "line",
              fill: false,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
  }
  catch (errMsg) {
    throw("In getGraphStyle(): " + errMsg)
  } 
}
  

function displayGraph(graph) {
  try {
    // Create and display the coin price chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
            type: graph.style.type,
            data: {
                labels: graph.coordinates.xs,
                datasets: [{
                    label: graph.title,
                    data: graph.coordinates.ys,
                    fill: graph.style.fill,
                    backgroundColor: graph.style.backgroundColor,
                    borderColor: graph.style.borderColor,
                    borderWidth: graph.style.borderWidth
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return graph.currency_symbol + value
                            }
                        }
                    }]
                }
            }
        });
  }
  catch (errMsg) {
    throw("In displayGraph(graph): " + errMsg)
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
  