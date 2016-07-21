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
            logger.logError("Can't read from file");
            return [];
        }
    };
    
    
    var saveData = function(params){
        var result = false,
            dbPath = './data/custom-cars.json';
        
        if (!params){
            return result;
        };

        try{
            fs.writeFileSync(
                dbPath,
                JSON.stringify(params),
                { flag: 'w+' }
            );
        } catch(e) {
            logger.logError('Failed save params to file, params: ' + JSON.stringify(params));
        }
        result = true;

        return result
    };

    return{
        getData: getData,
        saveData: saveData
    }
})();