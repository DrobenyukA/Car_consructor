/**
 * Created by Drobenyuk.A on 17.07.16.
 */

function changePrice() {
    var modelId = $('select[name="models"]').val();
    var modelPrice = parseInt($('select[name="models"] option[value="'+ modelId +'"]').attr("data-price")) || 0;
    var complId = $('select[name="complectations"]').val();
    var complPrice = parseInt($('select[name="complectations"] option[value="'+ complId +'"]').attr("data-price")) || 0;
    var engineId = $('select[name="engine"]').val();
    var enginePrice = parseInt($('select[name="engine"] option[value="'+ engineId +'"]').attr("data-price")) || 0;
    var colorId = $('select[name="colors"]').val();
    var colorPrice = parseInt($('select[name="colors"] option[value="'+ colorId +'"]').attr("data-price")) || 0;
    var optionId = $('select[name="options"]').val();
    var optionPrice = parseInt($('select[name="options"] option[value="'+ optionId +'"]').attr("data-price")) || 0;

    var totalPrice = modelPrice + complPrice + enginePrice + colorPrice + optionPrice;
    $('#price-js').text(totalPrice);
};

function setComplectation(){
    var modelId = $('select[name="models"]').val();
    $.ajax('/complectations', { data: {modelId: modelId} }).done(window.CarsApp.getCarsComplectation);

    $('select[name="complectations"]').html('').css('display', 'inline-block');
    $('select[name="engine"]').html('').css('display', 'none');
    $('select[name="colors"]').html('').css('display', 'none');
    $('select[name="options"]').html('').css('display', 'none');

    changePrice();
}

function setEngine(){
    var modelId = $('select[name="models"]').val();
    var complId = $('select[name="complectations"]').val();
    $.ajax('/engines', { data: {modelId: modelId, complId: complId} }).done(window.CarsApp.getCarsEngine);

    $('select[name="engine"]').html('').css('display', 'inline-block');
    $('select[name="options"]').html('').css('display', 'none');
    $('select[name="colors"]').html('').css('display', 'none');

    changePrice();
}

function setColors(){
    var modelId = $('select[name="models"]').val();
    $.ajax('/colors', { data: {modelId: modelId} }).done(window.CarsApp.getColors);

    $('select[name="colors"]').html('').css('display', 'inline-block');
    $('select[name="options"]').html('').css('display', 'none');
    changePrice();
}

function setOptions(){
    var modelId = $('select[name="models"]').val();
    var complId = $('select[name="complectations"]').val();
    $.ajax('/options', { data: {modelId: modelId, complId: complId} }).done(window.CarsApp.getOptions);

    $('select[name="options"]').html('').css('display', 'inline-block');
    changePrice();
}

function goNext(){
    var credit = '<button onclick="calcCredit()">Credit</button>',
        saveCar = '<button onclick="saveCar()"> Save Car</button>';
    $('#next-steps').html(credit + saveCar);
    changePrice();
}


function calcCredit(){
    $.ajax('/bank').done(window.CreditApp.setBanks);

    $('select[name="payment"]').html('').css('display', 'inline-block');
    $('select[name="period"]').html('').css('display', 'none');
}

function setPayments(){
    var bankId = $('select[name="banks"]').val();
    $.ajax('/payments', { data: {bankId: bankId} }).done(window.CreditApp.setPayments);

    $('select[name="period"]').html('').css('display', 'inline-block');
}

function setPeriods(){
    var bankId = $('select[name="banks"]').val();
        
    $.ajax('/period', { data: {bankId: bankId} }).done(window.CreditApp.setPeriods);

}

function getInterest(){
    var bankId    = $('select[name="banks"]').val(),
        paymentId = $('select[name="payment"]').val(),
        periodId  = $('select[name="period"]').val();
    $.ajax('/interest', {
        data: {
            bankId: bankId,
            paymentId: paymentId,
            periodId: periodId
        }
    }).done(window.CreditApp.setInterest);
    
}
function saveCar(){
    var car = {};
    
    console.log(car)
}

