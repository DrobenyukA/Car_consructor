/**
 * Created by drobenyuk on 09.07.16.
 */

var dataService = require('../services/DataService.js');

module.exports = (function(){

    /**
     * Models manager
     * @returns {Array}
     */
    var getModels = function (){
        var path = './data/models.json';
        return dataService.getData(path);
    };

    /**
     * Complectations manager
     * @param params
     * @returns {Array}
     */
    var getComplectations = function (params) {
        var path   = './data/complectations.json',
            data   = dataService.getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            if (parseInt(params.modelId) === data[i].model_id){
                result.push(data[i]);
            }
        }
        return result;
    };

    /**
     * Engines manager
     * @param params
     * @returns {Array}
     */
    var getEngines = function(params){
        var path   = './data/engines.json',
            data   = dataService.getData(path),
            result = [];

        for(var i = 0; i < data.length; i++){
            if ((parseInt(params.modelId) === data[i].model_id)
                && (parseInt(params.complId) === data[i].compl_id)){
                result.push(data[i]);
            }
        }
        return result;
    };

    /**
     * Colors manager
     * @param params
     * @returns {Array}
     */
    var getColors = function(params){
        var path   = './data/colors.json',
            data   = dataService.getData(path),
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
    
    /**
     * Options manager
     * @param params
     * @returns {Array}
     */
    var getOptions = function(params){
        var path   = './data/options.json',
            data   = dataService.getData(path),
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