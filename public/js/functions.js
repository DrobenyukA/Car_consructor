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
    $('input[name="price"]').val(totalPrice);
}

function setComplectation(){
    var modelId = $('select[name="models"]').val();
    $.ajax('/complectations', { data: {modelId: modelId} }).done(window.CarsApp.getCarsComplectation);
    
    $('.compl').removeClass('hidden');
    $('select[name="complectations"]').html('');
    $('.engine').addClass('hidden');
    $('select[name="engine"]').html('');
    $('.colors').addClass('hidden');
    $('select[name="colors"]').html('');
    $('.options').addClass('hidden');
    $('select[name="options"]').html('');
    $('#car-constructor .callout').addClass('hidden');
    $('.btn-save').html('');

    changePrice();
}

function setEngine(){
    var modelId = $('select[name="models"]').val();
    var complId = $('select[name="complectations"]').val();
    $.ajax('/engines', { data: {modelId: modelId, complId: complId} }).done(window.CarsApp.getCarsEngine);

    $('.engine').removeClass('hidden');
    $('select[name="engine"]').html('');
    $('.colors').addClass('hidden');
    $('select[name="colors"]').html('');
    $('.options').addClass('hidden');
    $('select[name="options"]').html('');
    $('#car-constructor .callout').addClass('hidden');
    $('.btn-save').html('');

    changePrice();
}

function setColors(){
    var modelId = $('select[name="models"]').val();
    $.ajax('/colors', { data: {modelId: modelId} }).done(window.CarsApp.getColors);

    $('.colors').removeClass('hidden');
    $('select[name="colors"]').html('');
    $('.options').addClass('hidden');
    $('select[name="options"]').html('');
    $('#car-constructor .callout').addClass('hidden');
    $('.btn-save').html('');
    changePrice();
}

function setOptions(){
    var modelId = $('select[name="models"]').val();
    var complId = $('select[name="complectations"]').val();
    $.ajax('/options', { data: {modelId: modelId, complId: complId} }).done(window.CarsApp.getOptions);

    $('.options').removeClass('hidden');
    $('#car-constructor .callout').addClass('hidden');
    $('.btn-save').html('');
    changePrice();
}

function goNext(){
    var credit = '<button class="button" onclick="getBanks()">Переглянути</button>',
        saveCar = '<button class="success button" onclick="saveCar()">Зберегти</button>';
    $('#car-constructor .callout').removeClass('hidden');
    $('.credit-info').removeClass('hidden');
    $('.btn-save').html(saveCar);
    $('#next-steps').html(credit);
    changePrice();
}

function getBanks(){
    $.ajax('/bank').done(window.CreditApp.setBanks);
    
    $('.banks').removeClass('hidden');
    $('.credit-info').addClass('hidden');
    $('#credit-calculator .callout').addClass('hidden');
    $('#next-steps').html('');
}

function setPayments(){
    var bankId = $('select[name="banks"]').val();
    $.ajax('/payments', { data: {bankId: bankId} }).done(window.CreditApp.setPayments);

    $('.payments').removeClass('hidden');
    $('select[name="payment"]').html('');
    $('.periods').addClass('hidden');
    $('select[name="period"]').html('');
    $('.interests').addClass('hidden');
    $('.interest').html('');
    $('#credit-calculator .callout').addClass('hidden');
}

function setPeriods(){
    var bankId = $('select[name="banks"]').val();
        
    $.ajax('/period', { data: {bankId: bankId} }).done(window.CreditApp.setPeriods);

    $('.periods').removeClass('hidden');
    $('select[name="period"]').html('');
    $('.interests').addClass('hidden');
    $('.interest').html('');

    $('#credit-calculator .callout').css('display', 'none');

}

function setInterest(){
    var bankId     = $('select[name="banks"]').val(),
        paymentId  = $('select[name="payment"]').val(),
        periodId   = $('select[name="period"]').val(),
        calcButton = '<button class="success button" onclick="calcCredit()">Розрахувати</button>';
    $.ajax('/interest', {
        data: {
            bankId: bankId,
            paymentId: paymentId,
            periodId: periodId
        }
    }).done(window.CreditApp.setInterest);

    $('.interests').removeClass('hidden');
    $('#credit-calculator .callout').removeClass('hidden');
    $('#credit-calculator .btn-calc').html(calcButton);
}

function saveCar(){
    var car = {
        model: $('select[name="models"]').val(),
        compl: $('select[name="complectations"]').val(),
        engines: $('select[name="engines"]').val(),
        colors: $('select[name="colors"]').val(),
        options: $('select[name="options"]').val(),
        date: new Date(),
        userId: null
    };
    $.ajax({
        method: 'post',
        url: '/savecar',
        data: car
    }).done(function(success){
        var message = '';
        if (success){
            message = '<h4 class="success-msg">'
                        +'<i class="fa fa-floppy-o" aria-hidden="true"></i>'
                        +'Your car successfully saved!</h4>'
        } else {
            message = '<h4 class="failed-msg">'
                        +'<i class="fa fa-times-circle" aria-hidden="true"></i>'
                        +'Something goes wrong. Please, try again.</h4>'
        }
        $('#car-constructor .callout').html(message);
        $('.btn-save').css('display', 'none');
    });
}

function calcCredit() {
    var data = {
        price: $('#price-js').text(),
        bank: $('select[name="banks"]').val(),
        payment: $('select[name="payment"]').val(),
        period: $('select[name="period"]').val(),
        interest: $('.interest').attr("data-id")
    };

    $.ajax({
        method: 'post',
        url: '/credit',
        data: data
    }).done(function(value){
        // var result = [value];
        //
        // $('#credit-calculator div').html(result.join(''));
        console.log('done');
    });
}