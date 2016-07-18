/**
 * Created by Drobenyuk.A on 17.07.16.
 */

$(function(){
   window.CreditApp = (function(){
       
       var setBanks = function(data){
           var banks = '<option value="0">Оберіть банк</option>';
           
           for (var i = 0; i < data.length; ++i) {
               banks += '<option value="' + data[i].bank_id + '">' +
                   data[i].bank_name +
                   '</option>';
           }

           $('select[name="banks"]').html(banks);
       };

       var setPayments = function(data){
           var payments = '<option value="0">Оберіть початковий внесок</option>'

           for (var i = 0; i < data.length; ++i) {
               payments += '<option value="' + data[i].payment_id +
                   '" data-comission="'+ data[i].payment_comission +
                   '" data-month-comission="'+ data[i].payment_month_comission +
                   '" data-insurance="'+ data[i].payment_insurance +'">' +
                   + data[i].payment_value + "% від вартості" +
                   '</option>';
           }

           $('select[name="payment"]').html(payments);
       };
        
       var setPeriods = function(data){
           var periods    = '<option value="0">Оберіть термін</option>';

           
           for (var i = 0; i < data.length; ++i) {
               var yearsVal   = data[i].periods_value / 12,
                   yearsDescr = '';

               switch (yearsVal){
                   case 1: yearsDescr = "рік";
                       break;
                   case 2: yearsDescr = "роки";
                       break;
                   case 3: yearsDescr = "роки";
                       break;
                   case 4: yearsDescr = "роки";
                       break;
                   case 5: yearsDescr = "років";
                       break;
                   case 6: yearsDescr = "років";
                       break;
               }
               periods += '<option value="' + data[i].periods_id + '">' +
                   + yearsVal + ' '+ yearsDescr +
                   '</option>';
           }
           $('select[name="period"]').html(periods);
       };

       var setInterest = function(data){
           $('input[name="interest"]').attr('data-id', data[0].interests_id)
               .attr('value', data[0].interests_value);
       };

       return{
           setBanks: setBanks,
           setPayments: setPayments,
           setPeriods: setPeriods,
           setInterest: setInterest
       }
   })(); 
});