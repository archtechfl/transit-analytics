function StationRidershipWidget(pageSize) {
    // Creating the Station ridership widget
    this.pageSize = pageSize; // Page size set during init
};

StationRidershipWidget.prototype.begin = function () {
    this.storage = [];
    this.makeDataRequest();
    // Place to store the original unaltered list
    this.originalData;
};

StationRidershipWidget.prototype.makeDataRequest = function () {
    var offset,
        limit,
        baseAPI,
        finalAPI,
        self;
    self = this;
    offset = 0;
    limit = 5000;
    baseAPI = "https://data.cityofchicago.org/resource/5neh-572f.json?$";
    self.retrieveLoop(baseAPI, limit, offset);
}

StationRidershipWidget.prototype.retrieveLoop = function(baseAPI, limit, offset) {
    var dateRange = "&$where=date > '2014/01/01' AND date < '2014/12/31'";
    var finalAPI = baseAPI + "limit=" + limit + "&$offset=" + offset + dateRange;
    var self = this;
    var localOffset = offset;
    //if (localOffset < 20000){
        $.get( finalAPI, function( data ) {
            $.each(data, function( index, value ) {
                self.storage.push(value);
            });
            // Execute if the data length returned has maxed out at limit
            if (data.length === 5000){
                localOffset += 5000;
                self.retrieveLoop(baseAPI, limit, localOffset);
            } else {
                self.dataOrganizer(self.storage);
            }
        });
    //}
};

StationRidershipWidget.prototype.dataOrganizer = function(aggregateData) {
    var ridershipByStation = {};
    var ridershipByStationArray = [];
    var stationMetaId = [];
    $.each(aggregateData, function( index, value ) {
        var stationPresenceCheck = stationMetaId.indexOf(value["station_id"]);
        if (stationPresenceCheck === -1){
            ridershipByStation[value["station_id"]] = {};
            stationMetaId.push(value["station_id"]);
            ridershipByStation[value["station_id"]]["name"] = value["stationname"];
            var numRides = parseInt(value["rides"]);
            ridershipByStation[value["station_id"]]["rides"] = numRides
        } else {
            var numRides = parseInt(value["rides"]);
            var currentTotal = parseInt(ridershipByStation[value["station_id"]]["rides"])
            ridershipByStation[value["station_id"]]["rides"] = numRides + currentTotal;
        }
    });
    $.each(ridershipByStation, function (index,value){
        ridershipByStationArray.push(value);
    });
    this.organizeTable(ridershipByStationArray);
};

StationRidershipWidget.prototype.organizeTable = function(ridershipByStation) {
    var paginated,
        startPage,
        totalPages,
        ridershipSorted;

    // Store the original data
    this.originalData = ridershipByStation;

    // Sort the ridership list
    ridershipSorted = this.sortingRidership(ridershipByStation, "rides", "descending");

    // Get an object which contains arrays corresponding to pages
    var StationAnalysisPaginator = new PaginationWidget();
    StationAnalysisPaginator.begin(10);
    // Paginated object retrived
    paginated = StationAnalysisPaginator.paginator(ridershipSorted);

    // Store paginated sets as global variable
    this.paginatedStorage = paginated;

    // Set start page as 1 on load
    startPage = 1;

    // Total number of pages
    totalPages = paginated['pages'].length;

    // Render the table and navigation
    this.renderNavigator(paginated['pages'], startPage);
    this.renderTable(paginated[startPage], startPage, totalPages, 1);
    this.onSort();
    this.getPage(totalPages);

};

StationRidershipWidget.prototype.sortingRidership = function(data, category, direction){
    // Sorts the ridership list by category and direction
    var ridershipToSort,
        sortedData;

    ridershipToSort = data;
    sortedData = ridershipToSort.sort(function(a, b) {
        if (category === "rides"){
            if (direction === "descending"){
                return b.rides - a.rides;
            } else {
                return a.rides - b.rides;
            }
        } else {
            if (direction === "descending"){
                return b.name - a.name;
            } else {
                return a.name - b.name;
            }
        }
    });
    return sortedData;
};

StationRidershipWidget.prototype.renderNavigator = function(pagesToRender, page){
    // This method renders the page navigator for the Station Ridership Plugin
    var data,
        template,
        rendered;

    data = {
        pages: pagesToRender
    }

    template = $('#stationRidershipNavTemplate').html();
    rendered = Mustache.render(template, data);
    $('.ridershipNavigation').html(rendered);

};

StationRidershipWidget.prototype.renderTable = function(dataToRender, page, totalPages, counterStart) {

    var counter,
        data,
        template,
        rendered,
        pageNavigatorSelector,
        previousNavSelector,
        nextNavSelector;

    counter = counterStart;
    data = {
        ridershipTable: dataToRender,
        count : function () {
            return function (text, render) {
                // note that counter is in the enclosing scope
                return counter++;
            }
        },
        ridesWithSeparator: function () {
            var numberOfRides = this.rides;
            numberOfRides = numeral(numberOfRides).format('0,0');
            return numberOfRides;
        }
    };

    template = $('#ridershipTemplate').html();
    rendered = Mustache.render(template, data);
    $('.ridershipTableContainer').html(rendered);

    // Set page navigator to reflect current navigation state
    pageNavigatorSelector = ".ridershipNavigation .page-" + page;
    $(pageNavigatorSelector).addClass("active");

    previousNavSelector = ".ridershipNavigation" + " .previous-nav";
    nextNavSelector = ".ridershipNavigation" + " .next-nav";

    // Toggle previous/next buttons based on current page
    if (page === 1){
        $(previousNavSelector).addClass("disabled");
        $(nextNavSelector).removeClass("disabled");
    } else if (page === totalPages) {
        $(previousNavSelector).removeClass("disabled");
        $(nextNavSelector).addClass("disabled");
    } else {
        $(previousNavSelector).removeClass("disabled");
        $(nextNavSelector).removeClass("disabled");
    }

};

StationRidershipWidget.prototype.paginate = function(ridershipByStation) {
    // Get the sorted list of stations
    var sortedList,
        numberPages,
        pageCollection,
        start,
        end,
        currentPage,
        pageNumber,
        pageCountArray;

    sortedList = ridershipByStation;
    numberPages = ridershipByStation.length / this.pageSize;
    pageCollection = {};
    pageCountArray = [];
    // Start and end determined by number of records per page
    start = 0;
    end = this.pageSize;
    // Loop for number of pages, slicing required number of records per iteration
    for (var pager = 0; pager <= numberPages; pager++){
        currentPage = ridershipByStation.slice(start, end);
        start += this.pageSize;
        end += this.pageSize;
        pageNumber = pager + 1;
        pageCollection[pageNumber] = currentPage;
        pageCountArray.push(pageNumber);
    }
    pageCollection["pages"] = pageCountArray;
    return pageCollection;
};

StationRidershipWidget.prototype.onSort = function() {

    $(".station_listing_header").on("click", ".sorting_header", function (event){
        console.log(event);
    });

};

StationRidershipWidget.prototype.getPage = function(totalPages) {
    // Keep track of which page is required
    var total,
        self,
        allPageNumberSelector,
        currentPageSelector,
        activeSelector;

    total = totalPages;
    self = this;
    allPageNumberSelector = ".ridershipNavigation .pagination-page-button";
    activeSelector = allPageNumberSelector + ".active";
    currentPageSelector = activeSelector + " .page-number";
    // Listeners for navigation bar
    $(".ridershipNavigation").on("click", ".pagination-nav-button", function (event){
        event.preventDefault();
        // Check for prev/next or page
        var isButton,
            isActive,
            pageSelected,
            prevCheck,
            currentPage,
            upcomingPage,
            counterStart,
            isEnabled;
        // Check if end button or number
        isButton = $(event.currentTarget).hasClass("pagination-end-button");
        isActive = $(event.currentTarget).hasClass("active");
        if (!isButton && !isActive){
            /* 
            Remove active class from active page number and transfer it to the page
            number that was just clicked 
            */
            $(allPageNumberSelector + ".active").removeClass("active");
            pageSelected = Number($(event.currentTarget).find(".page-number").text());
            // restart counter for ranking to reflect current page
            counterStart = ((pageSelected - 1) * self.pageSize) + 1;
            // re-render table with next page
            self.renderTable(self.paginatedStorage[pageSelected], pageSelected, total, counterStart);
            self.onSort();
            // End Page Button condition
        } else {
            // Don't execute the pagination code if the next/previous button is disabled
            isDisabled = $(event.currentTarget).hasClass("disabled");
            if (!isDisabled){
                // Code is executed if the navigation button pressed is the prev or next button
                prevCheck = $(event.currentTarget).hasClass("previous-nav");
                currentPage = Number($(currentPageSelector).text());
                // Remove active class from current page selector once identified
                $(activeSelector).removeClass("active");
                if (prevCheck){
                    // If the previous button is pressed, run this
                    upcomingPage = currentPage - 1;
                } else {
                    // If the previous button was not pressed, then next button is assumed
                    upcomingPage = currentPage + 1;
                }
                // Render the upcoming page once it has been identified
                counterStart = ((upcomingPage - 1) * self.pageSize) + 1;
                // re-render table with next page
                self.renderTable(self.paginatedStorage[upcomingPage], upcomingPage, total, counterStart);
            } // End enabled condition
        } // Next/Prev page end
    });
};