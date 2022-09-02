app.dataservice = (function ($, toastr, model, util) {

    //private members
    var _countryArray = new Array();
    var _langDictionary = {};

    var primeData = function ()
    {
        // run in parallel             
        return $.when(_createCountryArray(), _createLanguageDictionary());
    };

    var getListResultsBriefs = function (listResultsObservable, val)
    {       
        if (listResultsObservable !== null) {
            listResultsObservable([]);//übergebene Variable leeren
        }        
        var url = "http://api.geonames.org/searchJSON";
        //var url = "http://ws.geonames.net/searchJSON";
        var gbauser = app.geonamesuser;
        //featureClasses A, R, and S are not used in this request       
        var options = { lang: 'local', style: 'full', featureClass: ['H', 'L', 'P', 'T', 'U', 'V'], maxRows: 100, q: val, username: gbauser };
        //perform a traditional "shallow" serialization via parameter true
        var str = $.param(options, true);

        //var geonamesSearchRequest = $.ajax({
        //    type: "POST",
        //    url: url,
        //    dataType: "jsonp",
        //    data: str //data:options
        //});
        var geonamesSearchRequest = $.ajax({
            type: "POST",
            url: "http-proxy.ashx?url=" + url,
            // url: url,
            dataType: "json",
            data: str //data:options
        });
        geonamesSearchRequest.done(function (data)
        {           
            var _listResults = [];
            if (data.geonames === undefined || data.geonames instanceof Array === false) {
                if (data.status.message) {
                    toastr.warning(data.status.message);
                }
                else {
                    toastr.warning("no places found in the geonames database");
                }                
            }
            else
            {
                if (data.geonames.length <= 0) {
                    toastr.warning("no places found in the geonames database"); return;
                }
                //_listResults = data.geonames;
                var number = 0;
                data.geonames.forEach(function (item) {
                    //if (item.fcl == 'S' || item.fcl == 'A') {
                    //    return null;
                    //}
                    number++;
                    var newItem = {
                        id: number,
                        name: item.name, //+ (item.adminName1 ? ", " + item.adminName1 : ""),
                        featureClassName: item.fcodeName,
                        featureClass: item.fcl,
                        country: item.countryName,
                        bundesland: item.adminName1,
                        value: item.name,
                        lat: item.lat,
                        lon: item.lng,
                        population: item.population
                    };
                    _listResults.push(newItem);
                });
                listResultsObservable(_listResults);

                toastr.success(app.toasts.retrievedPlaceData);
            }  
        });

        geonamesSearchRequest.fail(function (jqXHR, textStatus) {
            toastr.error("Search places names query error: " + jqXHR.statusText);
        });
    };

    var getLocationResultsBriefs = function (adlibResultsObservable, selectedListObject) {
        //$.blockUI();
        util.setLoading("map");
        var url = "http://api.geonames.org/findNearbyJSON";
        //var url = "http://ws.geonames.net/findNearbyJSON";
        var gbauser = app.geonamesuser;// "geosetter";
        var country = "Austria";
        var options = {};
        if (selectedListObject.country.toLowerCase() === country.toLowerCase())
        {
            if (selectedListObject.population > 50000)
            {
                options = { lang: 'local', featureClass: 'P', radius: 6, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser };
            }
            else {
                options = { lang: 'local', radius: 6, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser };
            }
        }
        else
        {
            if (selectedListObject.population > 50000)
            {
                options = { lang: 'local', featureClass: 'P', radius: 40, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser };
            }
            else
            {
                options = { lang: 'local', radius: 40, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser };
            }
        }
        var str = jQuery.param(options, true);
        //var geonamesNearbySearchRequest = $.ajax({
        //    type: "POST",
        //    url: url,
        //    dataType: "jsonp",
        //    data: str //data:options
        //});
        var geonamesNearbySearchRequest = $.ajax({
            type: "POST",            
            url: "http-proxy.ashx?url=" + url,
            // url: url,
            dataType: "json",
            data: str //data:options
        });

        geonamesNearbySearchRequest.done(function (data) {
            var _locationResults = [];
            if (data.geonames === undefined || data.geonames instanceof Array === false) {
                if (data.status.message) {
                    toastr.warning(data.status.message);
                }
                else {
                    toastr.warning("no nearby places");
                }
                util.unsetLoading("map");
                //$.unblockUI();
            }
            else
            {
                if (data.geonames.length <= 0) {
                    toastr.warning("no nearby places");
                    //$.unblockUI();
                    util.unsetLoading("map");
                    return;
                }
                var number = 0;
                var latin = /^[A-Za-z0-9üöäÜÖÄß]+$/;
                data.geonames.forEach(function (item) {
                    if (item.fcl === 'S') {
                        return null;
                    }
                    number++;

                    var newAlternateArray = new Array();
                    if (item.alternateNames !== undefined)
                    {
                        item.alternateNames.forEach(function (alternateName)
                        {
                            if (alternateName.lang !== "link" && alternateName.lang !== "post" && alternateName.lang !== "abbr"
                                && alternateName.lang !== "iata" && alternateName.lang !== "icao" && alternateName.lang !== "faac"
                                && alternateName.name !== item.name && latin.test(alternateName.name) === true)
                            {
                                var tempObject = {
                                    name: alternateName.name,
                                    lang: alternateName.lang,
                                    completeName: alternateName.name + "_" + alternateName.lang
                                };
                                if (_hasObjectName(tempObject.name, newAlternateArray) === false) {
                                    newAlternateArray.push(tempObject);
                                }

                            }
                        });
                    }
                    var newItem = {
                        id: number, name: item.name,
                        featureClassName: item.fcodeName, featureClass: item.fcl,
                        country: item.countryName, countryCode: item.countryCode,
                        bundesland: item.adminName1, lat: item.lat, lon: item.lng,
                        coordinatesCombinated: item.lat + " " + item.lng,
                        distance: item.distance,
                        alternateNames: newAlternateArray, adlibArticles: [],
                        verifiziert: false, count: 0
                    };
                    _locationResults.push(newItem);
                });//Ende forEach
                toastr.success(app.toasts.retrievedLocationData);
                //make the array distinct by the property 'name'
                _locationResults = _cleanupDuplicates(_locationResults, 'name');
                _getAdlibResultsBriefs(adlibResultsObservable, _locationResults);
               
             }
        });

        geonamesNearbySearchRequest.fail(function (jqXHR, textStatus) {
            toastr.error("Nearby places query error: " + jqXHR.statusText);
            //$.unblockUI();
            util.unsetLoading("map");
        });



    };

    var getLocationResultsBriefs2org = function (adlibResultsObservable, selectedListObject) {
        //$.blockUI();
        util.setLoading("map");
        //var url = "http://ws.geonames.org/findNearbyJSON"; //?featureClass=P&featureClass=A&featureClass=H&featureClass=L&featureClass=R&featureClass=T&featureClass=U&featureClass=V";
        var url = "http://api.geonames.org/findNearbyJSON";
        //var url = "http://ws.geonames.net/findNearbyJSON";
        var gbauser = app.geonamesuser;// "geosetter";
        var normalSearch = false;
        var country = "Austria";
        //innerhalb von Österreich ist der Suchradius 10km mit maximal 300 Treffer:
        if (selectedListObject.country.toLowerCase() === country.toLowerCase())
        {
            if (selectedListObject.population > 50000)
            {
                $().geonamesdata(url, normalSearch, { lang: 'local', featureClass: 'P', radius: 6, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser }, _searchLocationsResponse, _searchLocationsErrorResponse);
            }
            else
            {
                $().geonamesdata(url, normalSearch, { lang: 'local', radius: 6, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser }, _searchLocationsResponse, _searchLocationsErrorResponse);
            }
        }
            //außerhalb von Österreich ist der Suchradius 40km mit mximal 300 Treffer
        else
        {
            if (selectedListObject.population > 50000)
            {
                $().geonamesdata(url, normalSearch, { lang: 'local', featureClass: 'P', radius: 40, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser }, _searchLocationsResponse, _searchLocationsErrorResponse);
            }
            else
            {
                $().geonamesdata(url, normalSearch, { lang: 'local', radius: 40, style: 'full', maxRows: 300, lng: selectedListObject.lon, lat: selectedListObject.lat, username: gbauser }, _searchLocationsResponse, _searchLocationsErrorResponse);
            }
        }

        function _searchLocationsResponse(geoData)
        {
            var _locationResults = [];
            if (geoData instanceof Array)
            {
                _locationResults = geoData;
            }
            else {
                toastr.warning("no nearby places: " +geoData);
                //alert(geoData);
                //$.unblockUI();
                util.unsetLoading("map");
                return;
            }
            if (_locationResults.length <= 0) {
                toastr.warning("no nearby places");
                //$.unblockUI();
                util.unsetLoading("map");
                return;
            }
            //data.forEach(function (item) {
            //    //results.push(new model.SpeakerBrief(item));
            //    results.push(item);
            //});
            //locationResultsObservable(_locationResults);
            toastr.success(app.toasts.retrievedLocationData);
            //make the array distinct by the property 'name'
            _locationResults = _cleanupDuplicates(_locationResults, 'name');
            _getAdlibResultsBriefs(adlibResultsObservable, _locationResults);
           
        }
        function _searchLocationsErrorResponse(textStatus)
        {
            toastr.error("Nearby places query error: " + textStatus);
            //$.unblockUI();
            util.unsetLoading("map");
        }
    };

    var _getAdlibResultsBriefs = function (adlibResultsObservable, locationResults) {
        if (adlibResultsObservable !== null && adlibResultsObservable().length > 0)
        {
            adlibResultsObservable([]);//übergebenes observable Array leeren
        }

        var locationResultsString = JSON.stringify(locationResults);
        var countryArrayString = JSON.stringify(_countryArray);
        var str = jQuery.param({ test: locationResultsString, countryArray: countryArrayString }, true);
        ////add the adlib articles:
        var adlibRequest = $.ajax({
            type: "POST",
            //url: '/PrintMapHandler.ashx?method=picture&test=' + test,
            url: 'AdlibHandler.ashx',
            //data: { test: locationResultsString, countryArray: countryArrayString },
            // DO NOT SET CONTENT TYPE to json
            //contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: str   
        });

        adlibRequest.done(function (data)
        {
            //var adlibResults = JSON.parse(data);
            var adlibResults = data;
            if (adlibResults.length <= 0) {
                toastr.warning("there are no searching matches in the adlib library");
            }
            else {                
                //verfizierte Adlib Artikel werden nach vorne sortiert
                _sortResultsLocationsAdlib(adlibResults);
                toastr.success(app.toasts.retrievedAdlibData);
                adlibResultsObservable(adlibResults);
            }
            //$.unblockUI();
            util.unsetLoading("map");
        });

        adlibRequest.fail(function (jqXHR, textStatus)
        {            
            toastr.error("Adlib query error: " + jqXHR.responseText);
            //$.unblockUI();
            util.unsetLoading("map");
        });
    };

    var getFilterExpressionsBriefs = function (adlibResultsObservable, filterExpressionsObservable)
    {
        var filterArray = new Array();        
        //add the PDF-Filter object:
        var ob = {};
        ob.label = "Only results with PDF";
        ob.adlibLanguageName = "";
        //ob.languageName = "";
        ob.checked = false;
        ob.isLanguageFiltered = false;
        ob.isPdfFiltered = true;
        filterArray.push(ob);

        var langs = _getUniqueLanguageList(adlibResultsObservable());
        langs.forEach(function (languageItem) {
            var ob = {};
            ob.adlibLanguageName = languageItem;
            if (_langDictionary.hasOwnProperty(languageItem))
            {
                ob.label = _langDictionary[languageItem];
            }
            else
            {
                ob.label = languageItem;
            }
            ob.checked = false;
            ob.isLanguageFiltered = true;
            ob.isPdfFiltered = false;
            //ob.label = ob.languageName;
            filterArray.push(ob);
        });
       

        var filterExpressions = [];
        filterArray.forEach(function (item) {
            filterExpressions.push(new model.FilterExpressionBrief(item));
        });
        filterExpressionsObservable(filterExpressions);

    };

    var exportAdlibResults = function (adlibLocationArray) {

        var adlibLocationList = JSON.stringify(adlibLocationArray);//korrekt     
        $.download('pdf/PdfHandler.ashx', 'adlibLocationArray=' + escape(adlibLocationList));

        //var ajaxPdfRequest = $.ajax({
        //    type: "POST",
        //    //url: '/PrintMapHandler.ashx?method=pdf&test=' + test,
        //    url: 'pdf/PdfHandler.ashx',
        //    data: { adlibLocationArray : escape(adlibLocationList) },
        //    // DO NOT SET CONTENT TYPE to json
        //    //contentType: "application/json; charset=utf-8",           
        //    dataType: "text" //what you are getting back
        //});
        //ajaxPdfRequest.done(function (data) {            
        //    // responseText encoding 
        //    pdfStream = data; var nw = window.open(pdfStream); nw.focus();

        //});
        //ajaxPdfRequest.fail(function (jqXHR, textStatus) {
        //    toastr.error("PDF error: " + textStatus);
        //});
    };

    //private Method:
    var _getUniqueLanguageList = function (adlibArray)
    {
        //var adlibArray = adlibResults();
        var uniqueLanguageList = new Array();

        adlibArray.forEach(function (adlibResult) {
            //uniqueLanguageList.push(adlibResult);
            adlibResult.adlibArticles.forEach(function (adlibArticle) {
                adlibArticle.languageCodes.forEach(function (language) {
                    //if array does not contain value:
                    if ($.inArray(language, uniqueLanguageList) === -1) {
                        uniqueLanguageList.push(language);
                    }
                });
            });
        });

        return uniqueLanguageList;
    };

    //private method
    var _cleanupDuplicates = function (arr, prop) {
        var new_arr = [];
        var lookup = {};

        for (var i in arr) {
            //var test = arr[i][prop];
            //var test2 = arr[i];
            lookup[arr[i][prop]] = arr[i];
        }
        for (i in lookup) {
            new_arr.push(lookup[i]);
        }

        return new_arr;
    };

    //private method
    var _sortResultsLocationsAdlib = function (adlibResults) {
        $.each(adlibResults, function (index, location) {
            location.adlibArticles.sort(function (a, b) {
                var aVerifiziert = a.verifiziert;
                var bVerifiziert = b.verifiziert;
                if (aVerifiziert === bVerifiziert) { return 0; }
                if (aVerifiziert > bVerifiziert) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
        });
    };

    //private method
    var _createLanguageDictionary = function () {
        var url = 'langDictionary.txt';

        var languageDicRequest = $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json'            
        });
        return languageDicRequest.done(queryLangDicSucceeded)
            .fail(queryLangDicFailed);

        function queryLangDicSucceeded(data) {
            let arr = data.langTranslate;
            $.each(arr, function (index, el)
            {
                if (!_langDictionary[el.deutsch])
                {
                    _langDictionary[el.deutsch] = el.local;
                }
                else
                {
                    _langDictionary[el.deutsch].push(el.local);
                }
            });
        }
        function queryLangDicFailed(jqXHR, textStatus) {
            toastr.error("No language dictionary: " + jqXHR.statusText);
        }

    };

    //private method
    var _createCountryArray = function () {
        var url = 'countryCodes2.txt';
        var countryArrayRequest = $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json'         
        });

        return countryArrayRequest.done(queryCountryArraySucceeded)
            .fail(queryCountryArrayFailed);

        function queryCountryArraySucceeded(data) {
                data.countryCodes.forEach(function (item) {
                    //results.push(new model.SpeakerBrief(item));
                    _countryArray.push(item);
                });                
        }
        function queryCountryArrayFailed(jqXHR, textStatus) {
            toastr.error("No defined layers: " + jqXHR.statusText);
        }       

    };

    //private method
    var _hasObjectName = function (name, arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i].name === name) {
                return true;
            }
        }
        return false;
    };

    return {
        getListResultsBriefs: getListResultsBriefs,
        getLocationResultsBriefs: getLocationResultsBriefs,
        getFilterExpressionsBriefs: getFilterExpressionsBriefs,
        //createCountryArray: createCountryArray,
        primeData: primeData,
        exportAdlibResults: exportAdlibResults
    };

})($, toastr, app.model, app.util);