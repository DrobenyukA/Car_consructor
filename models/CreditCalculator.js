/**
 * Created by Drobenyuk.A on 09.07.16.
 */
var fs = require('fs');
var logger = require('./../services/Logger');

module.exports = (function() {

    var getData = function (path) {
        try{
            var result = fs.readFileSync(path, 'utf8');
            return JSON.parse(result);
        } catch(e) {
            logger.logError("Module: CreditCalculator | Can't read from file");
            return [];
        }
    };

    var getBanks = function (){
        var path = './data/banks.json';
        return getData(path);
    };

    var getPayments = function(params){
        var path   = './data/payments.json',
            data   = getData(path),
            result = [];
        
        for (var i = 0; i < data.length; i++){
            if (data[i].bank_id === parseInt(params.bankId)){
                result.push(data[i]);
            }
        }
        return result;
    };
    
    var getPeriods = function(params){
        var path   = './data/periods.json',
            data   = getData(path),
            result = [];
        
        for (var i = 0; i < data.length; i++){
            if (data[i].bank_id === parseInt(params.bankId)){
                result.push(data[i]);
            }
        }
        return result;
    };

    var getInterest = function(params){
        var path   = './data/interests.json',
            data   = getData(path),
            result = [];
        for (var i = 0; i < data.length; i++){
            if ((data[i].bank_id === parseInt(params.bankId))
                && (data[i].payment_id === parseInt(params.paymentId))
                && (data[i].periods_id === parseInt(params.periodId))){
                result.push(data[i]);
            }
        }
        return result;
    };

    return{
        getBanks: getBanks,
        getPayments: getPayments,
        getPeriods: getPeriods,
        getInterest: getInterest
    }

})();
