function PaginationWidget() {
    // Creating the pagination widget
};

PaginationWidget.prototype.begin = function (pageSize) {
    // This is an init function for the utility widget that begins all processes
    this.pageSize = pageSize; // Sets the number of records per page
};

PaginationWidget.prototype.paginator = function (incomingDataset) {
    // Takes the incoming dataset and divides it into pages
    var sortedList,
        numberPages,
        pageCollection,
        start,
        end,
        currentPage,
        pageNumber,
        pageCountArray;

    sortedList = incomingDataset;
    numberPages = incomingDataset.length / this.pageSize;
    pageCollection = {};
    pageCountArray = [];
    // Start and end determined by number of records per page
    start = 0;
    end = this.pageSize;
    // Loop for number of pages, slicing required number of records per iteration
    for (var pager = 0; pager <= numberPages; pager++){
        currentPage = incomingDataset.slice(start, end);
        start += this.pageSize;
        end += this.pageSize;
        pageNumber = pager + 1;
        pageCollection[pageNumber] = currentPage;
        pageCountArray.push(pageNumber);
    }
    pageCollection["pages"] = pageCountArray;
    return pageCollection;
};

PaginationWidget.prototype.pageControls = function () {
    // Handles the UX for the pagination bar
};
