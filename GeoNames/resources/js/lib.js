window.$ = window.jQuery = require('jquery');
require('jquery-slimscroll');
require('./jQuery.download.js');
window.toastr = require('toastr');
window.ko = require('knockout');

// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's slideDown()/slideUp() methods
// Could be stored in a separate utility library
ko.bindingHandlers.slideVisible = {
    init: function (element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        if (ko.utils.unwrapObservable(value) === true) {
            $(element).slideDown(500);
            $($(element).children()[2]).slimScroll({ railVisible: true, disableFadeOut: true, size: '10px' });
            //$($(element).children()[2]).slimScroll({ height: 'auto', railVisible: true, disableFadeOut: true, size: '10px' });
        }
        else {
            $(element).slideUp(500);
        }
    }
};

//for executing the search string via Enter
ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                allBindings.executeOnEnter.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

