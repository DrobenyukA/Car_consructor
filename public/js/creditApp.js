/**
 * Created by Drobenyuk.A on 17.07.16.
 */

$(function(){
   window.CreditApp = (function(){
       
       var setBanks = function(banks){
           var options = '<option value="0">Оберіть банк</option>';
           
           for (var i = 0; i < banks.length; ++i) {
               options += '<option value="' + banks[i].id + '">' +
                   banks[i].name +
                   '</option>';
           }

           $('select[name="banks"]').html(options);
       };

       var setPayments = function(payments){
           var options = '<option value="0">Оберіть початковий внесок</option>'

           for (var i = 0; i < payments.length; ++i) {
               options += '<option value="' + payments[i].id + '">' +
                   + payments[i].value + "% від вартості" +
                   '</option>';
           }
           $('select[name="payment"]').html(options);
       };
        
       var setPeriods = function(periods){
           var options = '<option value="0">Оберіть термін</option>';

           
           for (var i = 0; i < periods.length; ++i) {
               var yearsVal   = periods[i].value / 12,
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
               options += '<option value="' + periods[i].id + '">' +
                   + yearsVal + ' '+ yearsDescr +
                   '</option>';
           }
           
           $('select[name="period"]').html(options);
       };

       var setInterest = function(interest){
           if(interest){
               $('.interest').attr('data-id', interest[0].id)
                   .html(interest[0].value);
           }
       };

       return{
           setBanks: setBanks,
           setPayments: setPayments,
           setPeriods: setPeriods,
           setInterest: setInterest
       }
   })(); 
});