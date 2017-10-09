app.vm.listResults = (function ($, ko, dataservice, map) {
    var hasSelected = ko.observable(false);

    var listResults = ko.observableArray();
    //var locationResults = ko.observableArray();
    var adlibResults = ko.observableArray();
    var filterExpressions = ko.observableArray();
  
    //var initialized = false;
    var searchString = ko.observable("");
    var selected = ko.observable(null);    

    var searchListResults = function ()
    {        
        selected(null);
        //initialize listResults:
        dataservice.getListResultsBriefs(listResults, searchString());
    };

    var clearListResults = function () {
        //clear the array of the list results:
        listResults([]);
        //später auch dir location Results leeren
        adlibResults([]);
        //clear the search string:     
        searchString("");
        selected(null);
    };

    var clearAdlibResults = function () {
        //später auch dir location Results leeren
        adlibResults([]);
        selected(null);
    };

    var exportAdlibResults = function () {
        var _adlibLocationArray = filteredAdlibResults();
        dataservice.exportAdlibResults(_adlibLocationArray);
    };

   var isSelected = function (item) {
        return selected() === item;
    };  

   var setSelected = function (item) {      
        if (isSelected(item)) {
            //item = void (0);
            return;
        }
        selected(item);
        searchLocationResults(selected());
     };

    var searchLocationResults = function (selectedListObject)
    {
        //initialize adlibResults:
        dataservice.getLocationResultsBriefs(adlibResults, selectedListObject);        
    };

    var centerSearch = function ()
    {
        var map_div =  map.getMap();
        var center = map_div.center;
        newCenterLL = new OpenLayers.LonLat(center.lon, center.lat).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        var selectedJsonObject = {
            id: 1,
            name: "centerPoint",
            country: "",
            value: "centerSearch",
            lat: newCenterLL.lat,
            lon: newCenterLL.lon,
            population: 0,
            alternateNames: []
        };
        searchLocationResults(selectedJsonObject);
    };



    adlibResults.subscribe(function (newValue)
    {
        //get new filter expressions:
        dataservice.getFilterExpressionsBriefs(adlibResults, filterExpressions);

        if (adlibResults().length == 0) {           
            map.clear(true);//re-center map = true;
            return;
        }
    });

    var filteredAdlibResults = ko.computed(function ()
    {     

        checkedFilterExpressions = filterExpressions().filter(function (el) {
            if (el.checked() == true)
             {                
                 return el;
            }
        });


        var languageFilterArray = filterExpressions().filter(function (el) {
            if (el.checked() == true && el.isLanguageFiltered() == true) {
                return el;
            }
        });
        var alsoLanguage = false;
        if (languageFilterArray.length > 0) { alsoLanguage = true; }

        var pdfFilterArray = filterExpressions().filter(function (el) {
            if (el.checked() == true && el.isPdfFiltered() == true) {
                return el;
            }
        });
        var alsoPdf = false;
        if (pdfFilterArray.length > 0) { alsoPdf = true;}

        if (checkedFilterExpressions.length == 0)
        {
            return adlibResults();
        }

        var filteredArr = [];
        adlibResults().forEach(function (adlibResult)
        {
            //quick deep object cloning:
            var el = (JSON.parse(JSON.stringify(adlibResult)));
            //var pdfFilterIsIncluded = false;
            //var languageFilterIsIncluded = false;        

            if (alsoPdf == false && alsoLanguage == true)
            {              
                el.searchedLanguageIsAvalaible = false;
                for (var i = 0; i < el.adlibArticles.length; i++)
                {
                    var adlibArticle = el.adlibArticles[i];
                    adlibArticle.visible = false;

                    for (var x = 0; x < adlibArticle.languageCodes.length; x++)
                    {
                        language = adlibArticle.languageCodes[x];
                        //eine filterExpression muss mit der Sprache zusammen passen (oder verknüpfung)
                        for (var a = 0; a < languageFilterArray.length; a++)
                        {
                            filterExpressionItem2 = languageFilterArray[a];                           
                            var filterExpression = filterExpressionItem2.adlibLanguageName();
                            if (language.toLowerCase() == filterExpression.toLowerCase())
                            {

                                el.searchedLanguageIsAvalaible = true;
                                adlibArticle.visible = true;
                                break;//dann die anderen filter expression nicht mehr überprüfen! for-Schleife verlassen
                            }
                        }
                        if (adlibArticle.visible == true) { break; }
                    }                  
                }
                if (el.searchedLanguageIsAvalaible == true) { filteredArr.push(el); }
            }

            else if (alsoPdf == true && alsoLanguage == false)
            {
                for (var a = 0; a < pdfFilterArray.length; a++)
                {
                    filterExpressionItem = pdfFilterArray[a];                 
                    el.pdfIsAvalaible = false;
                    for (var i = 0; i < el.adlibArticles.length; i++)
                    {
                        var adlibArticle = el.adlibArticles[i];
                        adlibArticle.visible = false;
                        if (adlibArticle.pdfAvailable == true)
                        {
                            el.pdfIsAvalaible = true;
                            adlibArticle.visible = true;                           
                        }

                    }                   
                }
                if (el.pdfIsAvalaible == true) { filteredArr.push(el); }
            }

            else if (alsoPdf == true && alsoLanguage == true)
            {
                el.searchedLanguageIsAvalaible = false;
                for (var i = 0; i < el.adlibArticles.length; i++) {
                    var adlibArticle = el.adlibArticles[i];
                    adlibArticle.visible = false;

                    if (adlibArticle.languageCodes.length == 0) {
                        continue;
                    }

                    for (var x = 0; x < adlibArticle.languageCodes.length; x++) {
                        language = adlibArticle.languageCodes[x];
                        //eine filterExpression muss mit der Sprache zusammen passen (oder verknüpfung)
                        for (var a = 0; a < languageFilterArray.length; a++) {
                            filterExpressionItem2 = languageFilterArray[a];
                            var filterExpression = filterExpressionItem2.adlibLanguageName();
                            if (language.toLowerCase() == filterExpression.toLowerCase()) {

                                el.searchedLanguageIsAvalaible = true;
                                adlibArticle.visible = true;
                                break;//dann die anderen filter expression nicht mehr überprüfen!
                            }
                        }
                        if (adlibArticle.visible == true) { break; }
                    }                  

                }
                if (el.searchedLanguageIsAvalaible == true) { filteredArr.push(el); }


                filteredArr.forEach(function (adlibResult)
                {
                    for (var a = 0; a < pdfFilterArray.length; a++)
                    {
                        filterExpressionItem = pdfFilterArray[a];
                        adlibResult.pdfIsAvalaible = false;
                        for (var i = 0; i < adlibResult.adlibArticles.length; i++)
                        {
                            var adlibArticle = adlibResult.adlibArticles[i];
                            //adlibArticle.visible = false;
                            if (adlibArticle.pdfAvailable == true && adlibArticle.visible == true)
                            {
                                adlibResult.pdfIsAvalaible = true;
                                adlibArticle.visible = true;
                            }
                            else
                            {
                                adlibArticle.visible = false;
                            }

                        }                      
                    }
                    if (adlibResult.pdfIsAvalaible == false) { filteredArr.splice($.inArray(adlibResult, filteredArr), 1); }

                });
            }

        });

        return filteredArr;
    });

    filteredAdlibResults.subscribe(function (newValue)
    {
        var filteredAdlibArray = filteredAdlibResults();
        
        if (adlibResults().length != 0 && adlibResults().length == filteredAdlibResults().length)
        {
            map.clear(false);//set no center
            map.buildMarkers(filteredAdlibArray, true);
        }
        else {
            map.clear(false);//set no center
            map.buildMarkers(filteredAdlibArray, false);
        }
    });

  

    return {
        searchListResults: searchListResults,
        clearListResults: clearListResults,
        clearAdlibResults: clearAdlibResults,
        exportAdlibResults: exportAdlibResults,
        selected: selected,
        isSelected: isSelected,
        setSelected: setSelected,

        centerSearch:centerSearch,

        listResults: listResults,
        adlibResults: adlibResults,
        filterExpressions: filterExpressions,
        filteredAdlibResults: filteredAdlibResults,
        searchString: searchString
    };
})($, ko, app.dataservice, app.mapapp);



