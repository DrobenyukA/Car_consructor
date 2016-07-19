/**
 * Created by Drobenyuk.A on 19.07.16.
 */

module.exports = (function(){
    var saveCar = function(params){
        var result = false;
        
        if (params){
            console.log(params);
            result = true;
        }
        return result;
        
    };

    return{
        saveCar: saveCar
    }
})();