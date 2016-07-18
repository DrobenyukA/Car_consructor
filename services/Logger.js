
var fs = require('fs');

module.exports = (function () {
    var path = './logs/app.log';

    var logError = function (message) {
        var date = new Date();
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

    return {
        logError: logError
    };
})();