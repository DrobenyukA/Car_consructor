
var fs = require('fs');

module.exports = (function () {
    var path = './logs/app.log';

    var logError = function (message) {
        var date = getCurrentDate();
        var logRow = date + ' | ERROR | ' + message + "\r\n";
        try {
            fs.writeFileSync(path, logRow, {
                flag: 'a+'
            });
        } catch (e) {
            console.log('Cannot write to file');
            console.log(e);
        }
    };

    var getCurrentDate = function(){
        var date    = new Date(),
            year    = date.getFullYear(),
            month   = date.getMonth() + 1,
            day     = date.getDate(),
            hours   = date.getHours(),
            minutes = date.getMinutes(),
            result  = '';

        result += day + '.' + month + '.' + year + ' at: ' + hours + ':' + minutes;
        return result
    };

    return {
        logError: logError
    };
})();