function StationLocationWidget() {
    // Creating the Station ridership widget
};

StationLocationWidget.prototype.begin = function () {
    this.storage = [];
    this.makeDataRequest();
};

StationLocationWidget.prototype.makeDataRequest = function () {
    var offset,
        limit,
        baseAPI,
        self;
    self = this;
    baseAPI = "https://data.cityofchicago.org/resource/8pix-ypme.json";
    self.retrieveListing(baseAPI);
}

StationLocationWidget.prototype.retrieveListing = function(baseAPI) {
    var self = this;
    $.get( baseAPI, function( data ) {
        $.each(data, function( index, value ) {
            self.storage.push(value);
        });
        self.dataOrganizer(self.storage);
    });
};

StationLocationWidget.prototype.dataOrganizer = function(aggregateData) {
    var self = this;
    var stationListing = {};
    var stationListingArray = [];
    var stationListingMeta = [];
    $.each(aggregateData, function( index, value ) {
        // Filter out the duplicate stops so there is only one stop per station
        // First check to see if the station has been read in yet
        var map_id = value["map_id"];
        var updatedStationInfo = value;
        if (stationListingMeta.indexOf(map_id) == -1){
            stationListingMeta.push(map_id);
            // Create simpler line coding record (an array of all relevant lines instead
            // of boolean values for each line )
            var lineIndicators = self.lineRecorder(updatedStationInfo);
            for (var key in value){
                if (key !== "station_name"
                    && key !== "station_descriptive_name"
                    && key !== "map_id"
                    && key !== "location"){
                    delete value[key]
                }
            }
            if (!updatedStationInfo.lines){
                // If lines array has not been added to station info, then add it
                updatedStationInfo.lines = lineIndicators; 
            }
            stationListing[map_id] = updatedStationInfo;
        } else {
            // If Station is already present in the final station array,
            // then the only element that needs to be updated is the line listing
            var existingStationEntry = stationListing[map_id];
            var lineIndicators = self.lineRecorder(updatedStationInfo, existingStationEntry);
            stationListing[map_id]["lines"] = lineIndicators;
        }
    });
    $.each(stationListing, function (index,value){
        stationListingArray.push(value);
    });
    this.renderTable(stationListingArray);
};

StationLocationWidget.prototype.lineRecorder = function(entry, existingStationEntry) {
    // Check the station's line indicators to return an array just containing
    // the lines applicable to the station
    var lineArray = [];
    if (existingStationEntry){
        var lineArray = existingStationEntry.lines;
    }
    if (entry.red){
        // red line
        if (lineArray.indexOf("Red") == -1){
            lineArray.push("Red");
        }
    }
    if (entry.blue){
        // blue line
        if (lineArray.indexOf("Blue") == -1){ 
            lineArray.push("Blue");
        } 
    }
    if (entry.g){
        // green line
        if (lineArray.indexOf("Green") == -1){
            lineArray.push("Green");
        }
    }
    if (entry.brn){
        // brown line
        if (lineArray.indexOf("Brown") == -1){
            lineArray.push("Brown");
        }
    }
    if (entry.p){
        // purple line
        if (lineArray.indexOf("Purple") == -1){
            lineArray.push("Purple");
        }
    }
    if (entry.pexp){
        // purple line express
        if (lineArray.indexOf("Purple-Express") == -1){
            lineArray.push("Purple-Express");
        }
    }
    if (entry.y){
        // yellow line
        if (lineArray.indexOf("Yellow") == -1){
            lineArray.push("Yellow");
        }
    }
    if (entry.pnk){
        // pink line
        if (lineArray.indexOf("Pink") == -1){
            lineArray.push("Pink");
        }
    }
    if (entry.o){
        // orange line
        if (lineArray.indexOf("Orange") == -1){
            lineArray.push("Orange");
        }
    }
    return lineArray;
};

StationLocationWidget.prototype.renderTable = function(stationListingArray) {
    var data,
        template,
        rendered;

    data = {
        stationListing: stationListingArray
    };

    template = $('#stationListingTemplate').html();
    rendered = Mustache.render(template, data);
    $('.stationListingWrapper').html(rendered);
    // Enable tooltips
    $('[data-toggle="tooltip"]').tooltip();
};