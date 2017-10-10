app.model = (function (ko) {

    var FilterExpressionBrief = function (dto) {
        //--------------
        // below is one way to do this, could be very manual. 
        // Instead we map them from json object to ko.observables.
        //--------------
        //var self = this;
        //self.name = ko.observable();
        //self.checked = ko.observable();
        //self.adlibName = ko.observable();
        //--------------
        return _addFilterExpressionComputeds(_mapToObservable(dto));
    };

    var _mapToObservable = function (dto)
    {
        var mapped = {};
        for (var prop in dto) {
            if (dto.hasOwnProperty(prop))
            {
                mapped[prop] = ko.observable(dto[prop]);
            }
        }
        return mapped;
    };

    function _addFilterExpressionComputeds(brief)
    {
        brief.fullLabel = ko.computed(function ()
        {
            return brief.adlibLanguageName() + ' ' + brief.label();
        });
        return brief;
    }

    return {       
        FilterExpressionBrief: FilterExpressionBrief
       
    };



})(ko);