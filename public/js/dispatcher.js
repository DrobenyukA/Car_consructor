/**
 * Created by Drobenyuk.A on 30.07.16.
 */
var dispatcher = (function () {

    var eventListeners = [];

    var addListener = function (event, listener) {
        eventListeners.push({
            event: event,
            listener: listener
        });
    };
    // TODO: check if it works correct
    var removeListener = function(event, listener) {
        for (var i = 0; i < eventListeners.length; ++i) {
            if (eventListeners[i].event === event.name
                && eventListeners[i].listener === listener) {
                eventListeners[i].splice(i,1);
            };
        }
    };
    var notify = function (event) {
        for (var i = 0; i < eventListeners.length; ++i) {
            if (eventListeners[i].event == event.name) {
                eventListeners[i].listener(event);
            }
        }
    };

    return {
        addListener: addListener,
        removeListener: removeListener,
        notify: notify
    };
})();

