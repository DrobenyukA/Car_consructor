/**
 * Created by Drobenyuk.A on 19.07.16.
 */

var dataService = require('../services/DataService.js');

module.exports = (function() {
    

    var getCreditPayment = function(params){

        var result = {};
        var price = parseInt(params.price);
        var payment = getPaymentValue(params.payment);
        var period = getPeriodValue(params.period);
        var interest = getInterestValue(params.interest);

        // get first payment;
        var paymentValue = price * parseInt(payment[0].payment_value) / 100;
        result.fistPayment = paymentValue;
        
        // get KASKO value
        var kasko = price * parseInt(payment[0].payment_insurance) / 100;
        result.kasko = kasko;
        
        //get first commission
        var commission = (price - paymentValue) * parseFloat(payment[0].payment_comission) / 100;
        result.comission = commission;

        /**
         * Annuity
         * source
         * http://damoney.ru/bank/38_formula_annuitet.php
         */
        var i = interest[0].interests_value / 1200;
        var n = period[0].periods_value;
        var upperPart = i * Math.pow((1 + i), n);
        var lowerPart = Math.pow((1 + i), n) - 1;

        var coefficient = upperPart / lowerPart;

        var monthPayment = coefficient * (price - paymentValue + kasko + commission);
        result.monthPayment = monthPayment;
        
        return result;
    };
    
    var getPaymentValue = function (instance){
        var result = [],
            path = './data/payments.json',
            data = dataService.getData(path);
        for(var i = 0; i < data.length; i++){
            if (data[i].payment_id === parseInt(instance)){
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
            if (data[i].periods_id === parseInt(instance)){
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
            if (data[i].interests_id === parseInt(instance)){
                result.push(data[i]);
            }
        }
        return result;
    };

    return{
        getCreditPayment: getCreditPayment
    }

})();