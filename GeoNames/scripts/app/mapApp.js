app.mapapp = (function ($, toastr) {

    var markers;
    var center = new OpenLayers.LonLat(16.3716888427734, 48.2082017620591).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));  // Centered on LVienna because I am biased
    var zoomLevel = 6;
    var numZoomLevels = 20;
    var map;
    // Define a projection for the map
    var proj = new OpenLayers.Projection("EPSG:4326");

    var context = {
       getStrokeColor: function (feature) {
           if (feature.attributes.verifiziert === true) {
               //dunkelrot:
               return "#CC0000";
           }
           else {
               //mattes schwarz:
               return "#000000";
           }
       },

       getFillColor: function (feature) {
           if (feature.attributes.verifiziert === true) {
               //hellrot:
               return "#FF4444";
           }
           else {
               //hellgrau:
               return "#D3D3D3";
           }
       },

       getPointRadius: function (feature) {
           if (feature.attributes.verifiziert === true) {
               //hellrot:
               return 7;
           }
           else {
               //hellgrau:
               return 7;
           }
       }
   };

    var templateDefault = {
        strokeColor: "${getStrokeColor}", strokeOpacity: 1, strokeWidth: 2,
        fillColor: "${getFillColor}", fillOpacity: 1, pointRadius: "${getPointRadius}", pointerEvents: "visiblePainted",

        label: "${name}", //label from attribute name
        labelPadding: "1px", labelBackgroundColor: "white", labelOpacity: 0.7,

        labelXOffset: 0, labelYOffset: 15, fontColor: "black", fontSize: "14px",
        fontFamily: "Arial", fontWeight: "bold", labelAlign: "cm"
    };

    var templateSelect = {
        strokeColor: "#00FF00", strokeOpacity: 1, strokeWidth: 2,
        fillColor: "#00FF00", fillOpacity: 0.25, pointRadius: 6, pointerEvents: "visiblePainted",

        label: "${name}", labelXOffset: "0", labelYOffset: 15,
        fontColor: "red", fontSize: "14px", fontFamily: "Arial", fontWeight: "bold", labelAlign: "cm"
    };

    var aStyleMap = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style(templateDefault, { context: context }),
        //"default": new OpenLayers.Style(templateDefault),
        "select": new OpenLayers.Style(templateSelect, { context: context })
    });

    var markers;
    var center = new OpenLayers.LonLat(16.3716888427734, 48.2082017620591).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));  // Centered on LVienna because I am biased
    var zoomLevel = 6;
    var numZoomLevels = 20;
    var map;
    // Define a projection for the map
    var proj = new OpenLayers.Projection("EPSG:4326");

    var renderMap = function () {
        var options =
        {
            controls:
            [
                new OpenLayers.Control.ScaleBar(),
                new OpenLayers.Control.MousePosition(),
                //new OpenLayers.Control.OverviewMap(),
                 new OpenLayers.Control.Zoom({zoomInId: "zoomIn", zoomOutId: "zoomOut"}),
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.Navigation({
                    dragPanOptions:
                   {
                       enableKinetic: true
                   }
                }),
            ],
            units: "km",
            panDuration: 100, //numZoomLevels: numZoomLevels,
            center: center,
            zoom: 1,
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: proj
        };
        map = new OpenLayers.Map("map", options);
        markers = new OpenLayers.Layer.Vector("Code Markers", { styleMap: aStyleMap });

        //ESRI tile service:
        var tileServiceURL = "//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}";
        var layer = new OpenLayers.Layer.OSM(null, tileServiceURL, {
            transitionEffect: 'resize', tileOptions: { crossOriginKeyword: null }, wrapDateLine: false
        });


        map.addLayers([layer, markers]);
        selectControl = new OpenLayers.Control.SelectFeature(markers,
                { onSelect: _onMarkerSelect, onUnselect: _onMarkerUnselect });
        map.addControl(selectControl);
        selectControl.activate();

        // create an overview map control with non-default options
        var overviewControlOptions = {
            size: new OpenLayers.Size(200, 150),
            autoPan: true,
            mapOptions: {
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: proj,
                units: "km",               
                numZoomLevels: 1  // If you'd like to have an overview map that doesn't zoom in and out at all, give it just one zoom level:
            }
        };
        var overviewControl = new OpenLayers.Control.OverviewMap(overviewControlOptions);
        map.addControl(overviewControl);

        map.zoomTo(zoomLevel);
        //map.zoomToExtent(new OpenLayers.Bounds(-8341644, 4711236, -8339198, 4712459));
    };

    var _onPopupClose = function (evt) {
        selectControl.unselect(selectedFeature);
    };

    var _onMarkerSelect = function (feature) {
        selectedFeature = feature;

        //$.each(feature.attributes.adlibArticles.slice(0, 5), function (index, article)
        var grepArray = $.grep(feature.attributes.adlibArticles, function (article, i) {
            return (article.visible == true);
        });

        if (grepArray.length >= 100) {
            popupContentHTML = "<div style='width:350px;'><h2>" + feature.attributes.name + ", " + feature.attributes.country +
                            " (" + feature.attributes.count + ")</h2></div><ul id='ul_list'>";
        }
        else {
            popupContentHTML = "<div style='width:350px;'><h2>" + feature.attributes.name + ", " + feature.attributes.country +
                            " (" + grepArray.length + ")</h2></div><ul id='ul_list'>";
        }

        //only display the first 5 adlibArticles-entries
        $.each(grepArray.slice(0, 5), function (index, article) {
            if (article.visible == true) {
                if (article.verifiziert == true) {
                    //popupContentHTML += "<li class='verifiziert'>" + article.author + ",<a target='_blank' href='http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=(priref=" + article.priref + ")'> Titel: " + article.title + "</a></li>";
                    popupContentHTML += "<li class='verifiziert list'><a target='_blank' href='http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=(priref=" + article.priref + ")'><span class='author'>" + article.author + ": </span><span>" + article.title + "</span></a></li>";
                }
                else {
                    //popupContentHTML += "<li class='nichtVerifiziert'>Autor: " + article.author + ",<a target='_blank' href='http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=(priref=" + article.priref + ")'> Titel: " + article.title + "</a></li>";
                    popupContentHTML += "<li class='nichtVerifiziert list'><a target='_blank' href='http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=(priref=" + article.priref + ")'><span class='author'>" + article.author + ": </span><span>" + article.title + "</span></a></li>";
                }
            }
        });
        popupContentHTML += "</ul>";

        //if (feature.attributes.count > 5)
        if (grepArray.length > 5) {
            var currSearchStat = String.Empty;
            var output = feature.attributes.name;

            if (output.indexOf("Sankt") != -1) {
                var output2 = output.replace("Sankt", "St");
                currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '" or geographical_keyword="' + output2 + '" or title="' + output2 + '"';
                //currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '" or abstract="' + output + '" or geographical_keyword="' + output2 + '" or title="' + output2 + '" or abstract="' + output2 + '"';
            }
            else if (output.indexOf("St.") != -1) {
                var output3 = output.replace("St.", "Sankt");
                currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '" or geographical_keyword="' + output3 + '" or title="' + output3 + '"';
                //currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '" or abstract="' + output + '" or geographical_keyword="' + output3 + '" or title="' + output3 + '" or abstract="' + output3 + '"';
            }
            else {
                currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '"';
                //currSearchStat = 'geographical_keyword="' + output + '" or title="' + output + '" or abstract="' + output + '"';
            }


            if (feature.attributes.alternateNames.length > 0) {
                for (var j = 0; j < feature.attributes.alternateNames.length; j++) {
                    if (feature.attributes.alternateNames[j].name != feature.attributes.name) {
                        currSearchStat += ' or geographical_keyword="' + feature.attributes.alternateNames[j].name + '" or title="' + feature.attributes.alternateNames[j].name + '"';
                        //currSearchStat += ' or geographical_keyword="' + feature.attributes.alternateNames[j].name + '" or title="' + feature.attributes.alternateNames[j].name + '" or abstract="' + feature.attributes.alternateNames[j].name + '"';
                    }
                }
            }
            //currSearchStat += ')';
            //var hrefUrl = 'http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=geographical_keyword="' + feature.attributes.name + '" or title="' + feature.attributes.name + '"';
            var hrefUrl = 'http://opac.geologie.ac.at/ais312/dispatcher.aspx?action=search&database=ChoiceFullCatalogue&search=' + currSearchStat;
            var hrefUnicodeUrl = encodeURI(hrefUrl);
            popupContentHTML += "<a target='_blank' href='" + hrefUnicodeUrl + "'>view more...</a>";
        }

        popup = new OpenLayers.Popup.FramedCloud("popupid",
                                    feature.geometry.getBounds().getCenterLonLat(),
                                    null, popupContentHTML,
                                    null, true, _onPopupClose);
        feature.popup = popup;
        map.addPopup(popup);
    };   

    var _onMarkerUnselect = function (feature) {
        if (feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            delete feature.popup;
        }

    };   

    var _addMarker = function (ll, pointAttributes) {
        var pointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(ll.lon, ll.lat), null, null);
        pointFeature.attributes =
        {
            name: pointAttributes.name,
            alternateNames: pointAttributes.alternateNames,
            country: pointAttributes.country,
            fclassName: pointAttributes.featureClassName,
            fclass: pointAttributes.featureClass,
            lon: pointAttributes.lon,
            lat: pointAttributes.lat,
            distance: pointAttributes.distance,
            adlibArticles: pointAttributes.adlibArticles,
            count: pointAttributes.count,
            verifiziert: pointAttributes.verifiziert
        };
        markers.addFeatures([pointFeature]);

    };

    var buildMarkers = function (searchPoints, setCenter) {
        var newCenterLL;
        $.each(searchPoints, function (i, point) {
            if (i == 0) {
                newCenterLL = new OpenLayers.LonLat(point.lon, point.lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));;
            }
            latit = point.lat;
            longit = point.lon;
            //markerIcon = icon.clone();
            lonLatMarker = new OpenLayers.LonLat(longit, latit).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));;
            _addMarker(lonLatMarker, point);
        });
        if (setCenter == true) {
            map.setCenter(newCenterLL, 12);
        }
    };

    var clear = function (setCenter) {
        for (var x = markers.features.length - 1; x >= 0; x--) {
            markers.features[x].destroy();
            markers.removeFeatures(markers.features[x]);
        }
        //clear a popup, if one is opened:
        while (map.popups.length) {
            map.removePopup(map.popups[0]);
        }
        if (setCenter == true)
        {
            map.setCenter(center, zoomLevel);
           
        }
    };

    var getMap = function () {
        return map;
    };

    return {
        renderMap: renderMap,
        buildMarkers: buildMarkers,
        clear: clear,
        getMap: getMap
    };




})($, toastr);