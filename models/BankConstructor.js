/**
 * Created by Drobenyuk.A on 09.07.16.
 */
var dataService = require('../services/DataService.js');

module.exports = (function() {

    
    var getBanks = function (){
        var path = './data/banks.json';
        return dataService.getData(path);
    };
    
    var getPayments = function(params){
        var path   = './data/payments.json',
            data   = dataService.getData(path),
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
            data   = dataService.getData(path),
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
            data   = dataService.getData(path),
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
