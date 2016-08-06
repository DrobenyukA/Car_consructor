/**
 * Created by Drobenyuk.A on 19.07.16.
 */
var fs     = require('fs'),
    logger = require('./../services/Logger');

module.exports = (function(){

    var getData = function (path) {
        try{
            var result = fs.readFileSync(path, 'utf8');
            return JSON.parse(result);
        } catch(e) {
            logger.logError("Can't read from file |" + path + "|");
            return [];
        }
    };
    
    
    var saveData = function(dbPath, params){
        var result = false;
        
        if (!params){
            return result;
        };

        var data = getData(dbPath);
        data.push(params);

        try{
            fs.writeFileSync(
                dbPath,
                JSON.stringify(data),
                { flag: 'w+' }
            );
        } catch(e) {
            logger.logError('Failed save params to '+ dbPath +' | params: ' + JSON.stringify(params));
        }
        
        result = true;

        return result
    };

    return{
        getData: getData,
        saveData: saveData
    }
})();