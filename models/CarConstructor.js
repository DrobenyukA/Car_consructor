/**
 * Created by drobenyuk on 09.07.16.
 */

var fs     = require('fs'),
    logger = require('./../services/Logger');

module.exports = (function(){

    /**
     * Data manager
     * @param path
     * @returns {Array}
     */
    var getData = function (path) {
        try{
            var result = fs.readFileSync(path, 'utf8');
            return JSON.parse(result);
        } catch(e) {
            logger.logError("Can't read from file");
            return [];
        }
    };

    /**
     * Models manager
     * @returns {Array}
     */
    var getModels = function (){
        var path = './data/models.json';
        return getData(path);
    };
    
    var getComplectations = function (params) {
        var path   = './data/complectations.json',
            data   = getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            if (parseInt(params.modelId) === data[i].model_id){
                result.push(data[i]);
            }
        }
        return result;
    };
    
    var getEngines = function(params){
        var path   = './data/engines.json',
            data   = getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            if ((parseInt(params.modelId) === data[i].model_id)
                && (parseInt(params.complId) === data[i].compl_id)){
                result.push(data[i]);
            }
        }
        return result;
    };

    var getColors = function(params){
        var path   = './data/colors.json',
            data   = getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            for (var j = 0; j < data[i].cars.length; j++){
                if ((parseInt(params.modelId) === data[i].cars[j].model_id)){
                    result.push(data[i]);
                }
            }
        }
        return result;

    };

    var getOptions = function(params){
        var path   = './data/options.json',
            data   = getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            if ((parseInt(params.modelId) === data[i].model_id)
                && (parseInt(params.complId) === data[i].compl_id)){
                result.push(data[i]);
            }
        }
        return result;
    };
    
    return{
        getModels:         getModels,
        getComplectations: getComplectations,
        getEngines:        getEngines,
        getColors:         getColors,
        getOptions:        getOptions
    }
    
})();