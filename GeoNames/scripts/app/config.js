app.geonamesuser = GEONAME_USER;//("dummyuser";

// app.vm = app.vm || {};
app.viewIds = {
    listResults: '#listResults-view'
    //kartierer: '#kartierer-view'
};

toastr.options.timeOut = 2000;
toastr.options.positionClass = 'toast-bottom-right';
app.toasts = {
    errorGettingData: 'Could not retrieve data.  Please check the logs.',
    invalidRoute: 'Cannot navigate. Invalid route',
    retrievedPlaceData: 'Place data retrieved successfully',
    retrievedLocationData: 'Nearby places retrieved successfully',
    retrievedAdlibData: 'Adlib data retrieved successfully',
    savedData: 'Saved data successfully'
};
