/**
 * Created by Drobenyuk.A on 19.07.16.
 */

var dataService = require('../services/DataService.js');

module.exports = (function() {
    

    var getCreditPayment = function(params){
        var price    = parseFloat(params.priceVal),
            payment  = getPaymentValue(params.paymentId),
            period   = getPeriodValue(params.periodId),
            interest = getInterestValue(params.interestVal);
        
        var fistPayment = price * parseInt(payment[0].value) / 100;

        var kasko = price * parseInt(payment[0].insurance) / 100;

        var commission = (price - fistPayment) * parseFloat(payment[0].comission) / 100;
        

        /**
         * Annuity calculation
         * source
         * http://damoney.ru/bank/38_formula_annuitet.php
         */
        var i = interest[0].value / 1200;
        var n = period[0].value;
        var upperPart = i * Math.pow((1 + i), n);
        var lowerPart = Math.pow((1 + i), n) - 1;
        var coefficient = upperPart / lowerPart;
        var monthPayment = coefficient * (price - fistPayment + kasko + commission);
        
        return {
            fistPayment: fistPayment,
            kasko: kasko,
            commission: commission,
            monthPayment: monthPayment
        };
    };
    
    var getPaymentValue = function (instance){
        var result = [],
            path = './data/payments.json',
            data = dataService.getData(path);
        for(var i = 0; i < data.length; i++){
            if (data[i].id === parseInt(instance)){
                result.push(data[i]);
            }
        }
        return result;
    };

    var getPeriodValue = function(instance){
        var result = [],
            path = './data/periods.json',
            data = dataService.getData(path);
        for(var i = 0; i < data.length; i++){
            if (data[i].id === parseInt(instance)){
                result.push(data[i]);
            }
        }
        return result;
    };

    var getInterestValue = function (instance){
        var result = [],
            path = './data/interests.json',
            data = dataService.getData(path);
        for(var i = 0; i < data.length; i++){
            if (data[i].id === parseInt(instance)){
                result.push(data[i]);
            }
        }
        return result;
    };

    return{
        getCreditPayment: getCreditPayment
    }

})();