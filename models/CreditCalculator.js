/**
 * Created by Drobenyuk.A on 19.07.16.
 */

var dataService = require('../services/DataService.js');

module.exports = (function() {
        //var price = parseInt(params.price);

    var getCreditPayment = function(params){
        var result = {};
        var price = parseInt(params.price);
        var payment = getPaymentValue(params.payment);
        var period = getPeriodValue(params.period);
        var interest = getInterestValue(params.interest);

        // get first payment;
        var paymentValue = price * parseInt(payment[0].payment_value) / 100;
        result.fistPayment = paymentValue;
        
        // get KASKO
        var kasko = price * parseInt(payment[0].payment_insurance) / 100;
        result.kasko = kasko;
        
        //get first comission
        var comission = (price - paymentValue) * parseFloat(payment[0].payment_comission) / 100;
        result.comission = comission;

        console.log(result);
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

    var getFirstPayment = function(instance){

    };

    return{
        getCreditPayment: getCreditPayment
    }

})();