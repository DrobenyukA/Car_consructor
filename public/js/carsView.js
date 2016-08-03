/**
 * Created by Drobenyuk.A on 30.07.16.
 */
(function(){
    var changePrice = function(event) {
        var modelPrice = parseFloat($('select[name="models"] option[value="'+ event.modelId +'"]').attr("data-price")) || 0;
        var complPrice = parseFloat($('select[name="complectations"] option[value="'+ event.complId +'"]').attr("data-price")) || 0;
        var enginePrice = parseFloat($('select[name="engine"] option[value="'+ event.engineId +'"]').attr("data-price")) || 0;
        var colorPrice = parseFloat($('select[name="colors"] option[value="'+ event.colorId +'"]').attr("data-price")) || 0;
        var optionPrice = parseFloat($('select[name="options"] option[value="'+ event.optionId +'"]').attr("data-price")) || 0;

        var totalPrice = modelPrice + complPrice + enginePrice + colorPrice + optionPrice;
        $('#price-js').text(totalPrice.toFixed(2));
        $('input[name="price"]').val(totalPrice);
    }

    var showCar = function (event){
        if (!parseInt(event.modelId)){
            $('.car-preview').html('');
            return;
        }

        var result = '',
            path = 'img/car-' + event.modelId + '/';
        for (var i = 0; i < 11; i++){
            result +='<img src="' + path + i +'.png" alt="car-'+i+'">';
        }

        $('.car-preview').html(result);
        $(".car-preview").brazzersCarousel();
    };

    var adaptWindow = function(event){
        $('html,body').animate({
            scrollTop: event.scroll
        }, 500);
    };

    var renderCompl = function(event){
        if (!parseInt(event.modelId)
            || !parseInt(event.modelId)){
            $('.compl').addClass('hidden');
            return;
        }

        $.ajax('/complectations', {
            data: {
                modelId: event.modelId
            }
            }).done(window.CarsApp.getCarsComplectation);

        $('.compl').removeClass('hidden');
    };

    var renderEngine = function(event){
        if (!parseInt(event.complId)
            || !parseInt(event.modelId)){
            $('.engine').addClass('hidden');
            return;
        }
        $.ajax('/engines', {
            data: {
                modelId: event.modelId,
                complId: event.complId
            }
        }).done(window.CarsApp.getCarsEngine);

        $('.engine').removeClass('hidden');
    };

    var renderColors = function (event){
        if (!parseInt(event.engineId)
            || !parseInt(event.modelId)){
            $('.colors').addClass('hidden');
            return;
        }
        $.ajax('/colors', {
            data: {
                modelId: event.modelId
            }
        }).done(window.CarsApp.getColors);
        $('.colors').removeClass('hidden');
    };

    var renderOptions = function(event){
        if (!parseInt(event.colorId) || !parseInt(event.modelId)){
            $('.options').addClass('hidden');
            return;
        }
        $.ajax('/options', {
            data: {
                modelId: event.modelId,
                complId: event.complId
            }
        }).done(window.CarsApp.getOptions);

        $('.options').removeClass('hidden');
    };

    var renderNotifications = function(event){

        if (!parseInt(event.modelId) || !parseInt(event.optionId)){
            $('.notifications').addClass('hidden');
            $('.car-save').html('<i class="fa fa-info" aria-hidden="true"></i>' +
                'Якщо Вам припала до душі дана комплектація тисніть' +
                '<strong>' +
                '"Зберегти"' +
                '</strong>');
            $('.btn-save').css('display', 'block');
            $('#credit-calculator div').addClass('hidden');
            $('#credit-result').html('');
            return;
        }

        $('.notifications').removeClass('hidden');
        $('.credit-info').removeClass('hidden');
        $('.btn-credit').removeClass('hidden');
    };

    dispatcher.addListener('setComplectation', renderCompl);
    dispatcher.addListener('setComplectation', renderEngine);
    dispatcher.addListener('setComplectation', renderColors);
    dispatcher.addListener('setComplectation', renderOptions);
    dispatcher.addListener('setComplectation', renderNotifications);
    dispatcher.addListener('setComplectation', showCar);
    dispatcher.addListener('setComplectation', adaptWindow);
    dispatcher.addListener('setComplectation', changePrice);

    dispatcher.addListener('setEngine', renderEngine);
    dispatcher.addListener('setEngine', renderColors);
    dispatcher.addListener('setEngine', renderOptions);
    dispatcher.addListener('setEngine', renderNotifications);
    dispatcher.addListener('setEngine', adaptWindow);
    dispatcher.addListener('setEngine', changePrice);

    dispatcher.addListener('setColors', renderColors);
    dispatcher.addListener('setColors', renderOptions);
    dispatcher.addListener('setColors', renderNotifications);
    dispatcher.addListener('setColors', adaptWindow);
    dispatcher.addListener('setColors', changePrice);

    dispatcher.addListener('setOptions', renderOptions);
    dispatcher.addListener('setOptions', renderNotifications);
    dispatcher.addListener('setOptions', adaptWindow);
    dispatcher.addListener('setOptions', changePrice);

    dispatcher.addListener('goNext', renderNotifications);
    dispatcher.addListener('goNext', adaptWindow);
    dispatcher.addListener('goNext', changePrice);
})();

function setComplectation() {
    var modelId = $('select[name="models"]').val();

    dispatcher.notify({
        name: 'setComplectation',
        modelId: modelId
    });
}

function setEngine() {
    var modelId = $('select[name="models"]').val(),
        complId = $('select[name="complectations"]').val(),
        scroll  = $('select[name="complectations"]').offset().top - 400;

    dispatcher.notify({
        name: 'setEngine',
        modelId: modelId,
        complId: complId,
        scroll: scroll
    });
}

function setColors() {
    var modelId  = $('select[name="models"]').val(),
        complId  = $('select[name="complectations"]').val(),
        engineId = $('select[name="engine"]').val(),
        scroll   = $('select[name="engine"]').offset().top - 400;

    dispatcher.notify({
        name: 'setColors',
        modelId: modelId,
        complId: complId,
        engineId: engineId,
        scroll: scroll
    });
}

function setOptions() {
    var modelId  = $('select[name="models"]').val(),
        complId  = $('select[name="complectations"]').val(),
        engineId = $('select[name="engine"]').val(),
        colorId  = $('select[name="colors"]').val(),
        scroll   = $('select[name="colors"]').offset().top - 400;

    dispatcher.notify({
        name: 'setOptions',
        modelId: modelId,
        complId: complId,
        engineId: engineId,
        colorId: colorId,
        scroll: scroll
    });
}

function goNext(){
    var modelId  = $('select[name="models"]').val(),
        complId  = $('select[name="complectations"]').val(),
        engineId = $('select[name="engine"]').val(),
        colorId  = $('select[name="colors"]').val(),
        optionId = $('select[name="options"]').val(),
        scroll   = $('select[name="options"]').offset().top - 400;

    dispatcher.notify({
        name: 'goNext',
        modelId: modelId,
        complId: complId,
        engineId: engineId,
        colorId: colorId,
        optionId: optionId,
        scroll: scroll
    });
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
        $('.car-save').html(message);
        $('.btn-save').css('display', 'none');
    });
}