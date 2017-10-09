/*!
* jQuery Adlib-Data plugin
* Version 1.0.1 (01.08.2012)
* Requires jQuery v1.4.2 or later
* ----------------------------------------------------------
* Copyright (C) 2013 Arno Kaimbacher. All rights reserved.
* ----------------------------------------------------------
*/

(function ($)
{

    $.fn.adlibdata = function (url, options, callback)
    {

//        options.output = "json";
//        options.search ="",
        //options.limit = 5;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            async: true,
            cache: false,
            contentType: "application/x-www-form-urlencoded",
            data: htmlEncode(options),


            success: function (data)
            {
                //Check the diagnostic node for errors
                if (data.adlibJSON.diagnostic.error != undefined)
                {
                    callback("error1: " + data.adlibJSON.diagnostic.error.message);
                }
                else
                {
                    callback(data.adlibJSON);
                }


            },
            error: function (xhr, msg)
            {
                callback(msg);
                //                alert("error: " + xhr.responseText + " " + msg);
            }
        });

    };

    //Hilfsfunktion
    var htmlEncode = function (options)
    {

        if (options.data == undefined)
            return options;

        //jQuery HTML encoding    
        options.data = $('<div/>').text(options.data).html();

        return options;
    }


})(jQuery);





