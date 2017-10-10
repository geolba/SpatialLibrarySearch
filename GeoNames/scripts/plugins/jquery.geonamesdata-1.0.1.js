/*!
* jQuery GeoNames-Query plugin
* Version 1.0.1 (01.08.2012)
* Requires jQuery v1.4.2 or later
* ----------------------------------------------------------
* Copyright (C) Arno Kaimbacher. 2013 All rights reserved.
* ----------------------------------------------------------
*/

(function ($)
{

    $.fn.geonamesdata = function (url, normalSearch, options, successCallback, errorCallback)
    {
        //var test = htmlEncode(options);
        var myRequest = $.ajax(
        {
            type: "POST",
            url: url,
            dataType: "jsonp",           
            contentType: "application/x-www-form-urlencoded",
            data: htmlEncode(options)           
        });

        myRequest.done(function (data)
        {
            if (data.geonames === undefined) {
                errorCallback(data.status.message);
                return;
            }
           

            //producing a new jQuery object containing the return values
            var number = 0;
            if (successCallback && typeof successCallback === "function")
            {
                successCallback($.map(data.geonames, function (item) {
                    if (item.fcl === 'S' || item.fcl === 'A') {
                        return null;
                    }
                    number++;
                   
                    var latin = /^[A-Za-z0-9üöäÜÖÄß]+$/;                   

                    if (normalSearch === false)
                    {
                        var newAlternateArray = new Array();
                        if (item.alternateNames !== undefined)
                        {
                            item.alternateNames.forEach(function (alternateName) {
                                if (alternateName.lang !== "link" && alternateName.lang !== "post" && alternateName.lang !== "abbr"
                                    && alternateName.lang !== "iata" && alternateName.lang !== "icao" && alternateName.lang !== "faac"
                                    && alternateName.name !== item.name && latin.test(alternateName.name) === true)
                                {
                                    var tempObject = {
                                        name: alternateName.name,
                                        lang: alternateName.lang,
                                        completeName: alternateName.name + "_" + alternateName.lang
                                    };
                                    if (hasObjectName(tempObject.name, newAlternateArray) === false) {

                                        //uniqueLanguageList.push(language);
                                        newAlternateArray.push(tempObject);
                                    }

                                }
                            });

                        }

                        return {
                            id: number,
                            name: item.name,
                            featureClassName: item.fcodeName,
                            featureClass: item.fcl,
                            country: item.countryName,
                            countryCode: item.countryCode,
                            bundesland: item.adminName1,
                            lat: item.lat,
                            lon: item.lng,
                            coordinatesCombinated: item.lat + " " + item.lng,
                            distance: item.distance,
                            alternateNames: newAlternateArray,
                            adlibArticles: [],
                            verifiziert: false,
                            count: 0
                        };
                    }

                    else if (normalSearch === true) {
                        return {
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
                    }

                }));
            }
        });


        myRequest.fail(function (jqXHR, textStatus)
        {
            if (errorCallback && typeof errorCallback === "function")
            {
                errorCallback(textStatus);
            }
            
        });
    };

    //Hilfsfunktionen:
    var hasObjectName = function (name, arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i].name === name) {
                return true;
            }
        }
        return false;
    };

    
    var htmlEncode = function (options) {

        if (options.data === undefined)
            return options;

        //jQuery HTML encoding    
        options.data = $('<div/>').text(options.data).html();

        return options;
    };
})(jQuery);