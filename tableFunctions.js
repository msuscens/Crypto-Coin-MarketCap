//
// Generic Table sorting, paging and refresh event handlers.
//
// Allows a single event handler to be employed (one for each of these operations) 
// across all the applications tables.  See README for details.
//

//
// GENERIC TABLE SORTING - COLUMN SORT EVENT HANDLER
//
function sortTableRows(event, idHtmlElementWithTableData) {
  try {
    console.log("In sortTableRows():")
    // Retreive table data and table's metadata
    const tableData = $(`#${idHtmlElementWithTableData}`).prop("tableData")
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    if (!tableData || !tableMetadata) throw ("Asked to sort with unknown table data/metadata")

    // Sort table data
    const currentSortOrder = $(event.currentTarget).prop("order")
    let newSortOrder
    if ((currentSortOrder == "descending") || (currentSortOrder == "ascending")) {
        // Previously sorted on this column, so simply reverse data order
        tableData.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Make a compare function (specific to sort column's data type, and sort order)
        const dataAttribute = $(`#${event.currentTarget.id}`).attr("dataObjectAttribute")
        const functionBody = createCompareFunctionBody(tableData[0], dataAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the table data
        tableData.sort(compareFunction)
    }

    // Store sorted table data
    $(`#${idHtmlElementWithTableData}`).prop("tableData", tableData)

    // Update the table (with sorted data)
    tableMetadata.populateTableFunction(tableData)
    setColumnHeadersSortOrder(event.currentTarget.id, newSortOrder)
  }
  catch (errMsg) {
    throw("In sortTableRows(event, idHtmlElementWithTableData): " + errMsg)
  }
}
 
function setColumnHeadersSortOrder(idSortedColumn, newSortOrder) {
// Update table column header's sort icons and 'order' attribute
// (according to columns newSortOrder: "ascending", "descending")
  try {
    const unsortedIcon = '<i class="fas fa-sort"></i>'
    const sortedAscendingIcon = '<i class="fas fa-sort-up"></i>'
    const sortedDescendingIcon = '<i class="fas fa-sort-down"></i>'

    // Set sort icons in table column headers
    const sortOrderIcon = (newSortOrder === "ascending") ? sortedAscendingIcon :
                        ((newSortOrder === "descending") ? sortedDescendingIcon :
                                                          unsortedIcon)
    $("#"+idSortedColumn).find("span").html( sortOrderIcon )
    $("#"+idSortedColumn).siblings("th[name='sortColumn']").find("span").html(unsortedIcon)

    // Set 'order' property on table column headings
    if ((newSortOrder === "ascending") || (newSortOrder === "descending")) {
      $("#"+idSortedColumn).prop("order", newSortOrder)
    }
    else {
      $("#"+idSortedColumn).removeProp("order")
    }
    $("#"+idSortedColumn).siblings("th[name='sortColumn']").removeProp("order")
  }
  catch (errMsg) {
    throw("In setColumnHeadersSortOrder(idSortedColumn, newSortOrder): " + errMsg)
  }
}


//  
// GENERIC TABLE PAGING - NEXT ANDF PREVIOUS EVENT HANDLERS
//
function loadNextPageIntoTable(idHtmlElementWithTableData) {
  try {
    // Determine new page number
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    tableMetadata.currentPageNumber++
    $(`#${idHtmlElementWithTableData}`).prop("tableMetadata", tableMetadata)

    //  If moving on to second page of table, activate 'Previous' paging controls
    if (tableMetadata.currentPageNumber == 2) {
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).removeClass("disabled")
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).attr("tabindex", "0")
    }

    // If moving on to last possible page of table, de-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display next page of data in table
    tableMetadata.loadTableDataFunction()
    
    // Reset the column sort order and icons 
    const idFirstSortColumn = $(`#${idHtmlElementWithTableData} th[name='sortColumn']:first`)[0].id
    setColumnHeadersSortOrder(idFirstSortColumn, "unsorted")
  }
  catch (errMsg) {
    throw("In loadNextPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}
  
function loadPreviousPageIntoTable(idHtmlElementWithTableData) {
  try {
    // Determine new page number
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    tableMetadata.currentPageNumber--
    $(`#${idHtmlElementWithTableData}`).prop("tableMetadata", tableMetadata)

    //  If moving back to first page, de-activate 'previous' paging controls
    if ( tableMetadata.currentPageNumber <= 1 ) {
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).addClass("disabled")
      $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).attr("tabindex", "-1")
    }

    // If moving back from last possible page of table, re-activate 'Next' paging control
    // *** TODO - Only a 'nice to have' as page still functions without it  ***

    // Display previous page of coins in table
    tableMetadata.loadTableDataFunction()

    // Reset the column sort order and icons 
    const idFirstSortColumn = $(`#${idHtmlElementWithTableData} th[name='sortColumn']:first`)[0].id
    setColumnHeadersSortOrder(idFirstSortColumn, "unsorted")
  }
  catch (errMsg) {
    throw("In loadPreviousPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}

//  
// GENERIC TABLE DATA RELOAD / REFRESH - EVENT HANDLER
//
function loadFirstPageIntoTable(idHtmlElementWithTableData) {
  try {
    // Reset page number to first page
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    tableMetadata.currentPageNumber = 1
    $(`#${idHtmlElementWithTableData}`).prop("tableMetadata", tableMetadata)

    //  De-activate 'previous' paging controls
    $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).addClass("disabled")
    $(`#${idHtmlElementWithTableData} li[name="previousPageTableControl"]`).attr("tabindex", "-1")

    tableMetadata.loadTableDataFunction()

    // Reset the column sort order and icons 
    const idFirstSortColumn = $(`#${idHtmlElementWithTableData} th[name='sortColumn']:first`)[0].id
    setColumnHeadersSortOrder(idFirstSortColumn, "unsorted")
  }
  catch (errMsg) {
    throw("In loadFirstPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}