//
// TABLE SORTING EVENT HANDLERS
//
function sortTableRows(event, idHtmlElementWithTableData) {
  try {
    // Retreive table data and table's metadata
    const tableData = $(`#${idHtmlElementWithTableData}`).prop("tableData")
    const tableMetadata = $(`#${idHtmlElementWithTableData}`).prop("tableMetadata")
    if (!tableData || !tableMetadata) throw ("Asked to sort with unknown table data/metadata")

    const currentSortOrder = $(event.currentTarget).prop("order")
    let newSortOrder

    if ((currentSortOrder == "descending") || (currentSortOrder == "ascending")) {
        // Previously sorted on this column, so simply reverse data order
        tableData.reverse()
        newSortOrder = (currentSortOrder === "ascending") ? "descending" : "ascending"
    }
    else {  // Not previously sorted
        newSortOrder = "descending"  // default for sort

        // Prepare a compare function (specific to sort column's data type, and the sort order)
        const dataAttribute = $(`#${event.currentTarget.id}`).attr("dataObjectAttribute")
        const functionBody = createCompareFunctionBody(tableData[0], dataAttribute, newSortOrder)
        const compareFunction = Function("a, b", functionBody)

        // Sort the table data
        tableData.sort(compareFunction)
    }
    // Store the sorted table data
    $(`#${idHtmlElementWithTableData}`).prop("tableData", tableData)

    // Update the table (with sorted data)
    setColumnHeadersSortOrder(event.currentTarget, newSortOrder)

    tableMetadata.populateTableFunction(tableData)
  }
  catch (errMsg) {
    throw("In sortTableRows(event, idHtmlElementWithTableData): " + errMsg)
  }
}
  
function setColumnHeadersSortOrder(currentTargetColumn, newSortOrder) {
  try {
    const unsortedIcon = '<i class="fas fa-sort"></i>'
    const sortedAscendingIcon = '<i class="fas fa-sort-up"></i>'
    const sortedDescendingIcon = '<i class="fas fa-sort-down"></i>'

    // Set sort icons in table column headers
    const sortOrderIcon = (newSortOrder === "ascending") ? sortedAscendingIcon : sortedDescendingIcon
    $("[name='sortColumn']").find("span").html( unsortedIcon )
    $("#" + currentTargetColumn.id).find("span").html( sortOrderIcon )

    // Set 'order' property on table column headings
    $(currentTargetColumn).prop("order", newSortOrder)
    $(currentTargetColumn).siblings().removeProp("order")
    
  }
  catch (errMsg) {
    throw("In setColumnHeadersSortOrder(currentTargetColumn, newSortOrder): " + errMsg)
  }
}

/*  This function refactored above- so that it takes currentTarget rather than an event
    Refactored as part of anlysis into reusing this function to reset the comlmn sort icons,
    with idea of calling this function with tables first <th> element
    KEEP BOTH VERSIONS FOR NOW UNTIL THIS ISSUE IS RESOLVED
function setColumnHeadersSortOrder(event, newSortOrder) {
  try {
    const unsortedIcon = '<i class="fas fa-sort"></i>'
    const sortedAscendingIcon = '<i class="fas fa-sort-up"></i>'
    const sortedDescendingIcon = '<i class="fas fa-sort-down"></i>'

    // Set sort icons in table column headers
    const sortOrderIcon = (newSortOrder === "ascending") ? sortedAscendingIcon : sortedDescendingIcon
    $("[name='sortColumn']").find("span").html( unsortedIcon )
    $("#" + event.currentTarget.id).find("span").html( sortOrderIcon )

    // Set 'order' property on table column headings
    $(event.currentTarget).prop("order", newSortOrder)
    $(event.currentTarget).siblings().removeProp("order")
  }
  catch (errMsg) {
    throw("In setColumnHeadersSortOrder(event, newSortOrder): " + errMsg)
  }
}
*/

//  
// TABLE PAGING - EVENT HANDLERS
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
    
    // Reset the column sort icons
    // *** TODO  ***
    // **** Issue:  How to call from here: setColumnHeadersSortOrder(currentTargetColumn, "ascending")
    // ****         where currentTargetColumn is the first column <th> target
    // *** Posibilities to solve:
    // **** 1. Pass in event to this EH function and then  naviagte DOM to table's first column <th>
    // ****    But how and is this a good method? Needs to be generic/reusable on all tables!!
    // **** 2. Save the table column headers id into the table metaData (that this function retreives)
    // ****    But this adds size/complexity to the metadata that is needed for each table.
    // **** 3. Some other solution that is elegant, generic ! ???  

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

    // Reset the column sort icons
    // *** TODO  ***

  }
  catch (errMsg) {
    throw("In loadPreviousPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}

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

    // Reset the column sort icons
    // *** TODO  ***

  }
  catch (errMsg) {
    throw("In loadFirstPageIntoTable(idHtmlElementWithTableData): " + errMsg)
  }
}


