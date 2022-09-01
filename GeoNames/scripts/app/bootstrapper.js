app.bootstrapper = (function ($, ko, vm, map, toastr, dataservice) {
  
    //initialize google analytics:
    // var _gaq = window._gaq = window._gaq || [];
    // _gaq.push(['_setAccount', 'UA-36825195-1']);
    // _gaq.push(['_trackPageview']);         
    // var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    // ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    // var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

    //load the lookup tables parallel in the dataservice module:
    dataservice.primeData()
        .then(boot)
        .fail(failedInitialization);

    function boot()
    {        
        // ko.applyBindings(vm.listResults, $(app.viewIds.listResults).get(0));
        var test = $('#map').get(0);
        ko.applyBindings(vm.listResults, test);
        //app.vm.listResults.activate();

        map.renderMap();        
        toastr.success("GeoNames application successfully loaded!");
    }

    function failedInitialization(error)
    {
        toastr.error('App initialization failed: ' + error.statusText);
    }

})($, ko, app.vm, app.mapapp, toastr, app.dataservice);
