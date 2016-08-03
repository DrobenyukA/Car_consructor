/**
 * Created by Drobenyuk.A on 09.07.16.
 */
$(function () {
    window.CarsApp =(function (){
        var initialize = function () {
            $.ajax('/cars').done(getCarsModels);
        };
        
        var getCarsModels = function(models){
            var options = '<option value="0">Модель</option>';

            for (var i = 0; i < models.length; ++i) {
                options += '<option value="' + models[i].id +
                                '" data-price="' + models[i].price + '">' +
                                models[i].name +
                           '</option>';
            }
            $('select[name="models"]').html(options);
        };
        
        var getCarsComplectation = function(compls){
            var options = '<option value="0">Коплектація</option>';

            for (var i = 0; i < compls.length; ++i) {
                options += '<option value="' + compls[i].id +
                    '" data-price="' + compls[i].price + '">' +
                    compls[i].name +
                    '</option>';
            }
            $('select[name="complectations"]').html(options);
        };
        
        var getCarsEngine = function(engines){
            var options = '<option value="0">Двигун</option>';

            for (var i = 0; i < engines.length; ++i) {
                options += '<option value="' + engines[i].id +
                    '" data-price="' + engines[i].price + '">' +
                    engines[i].volume + ' ' +
                    engines[i].type + ' (' + engines[i].fuel + ') ' +
                    engines[i].power + ' ' +
                    engines[i].gearbox +
                    '</option>';
            }

            $('select[name="engine"]').html(options);
        };

        var getColors = function(colors){
            var options = '<option value="0">Колір</option>',
                modelId = $('select[name="models"]').val(),
                price = null;
            for (var i = 0; i < colors.length; ++i) {
                options += '<option style="background: '+ colors[i].value +'" value="' + colors[i].id;

                for (var j = 0; j < colors[i].cars.length; j++){

                    if (parseInt(modelId) === parseInt(colors[i].cars[j].model_id)){
                        options += '" data-price="' + colors[i].cars[j].price + '">';
                     }

                }
                options += colors[i].name +
                    '</option>';
            }
            $('select[name="colors"]').html(options);

        };

        var getOptions = function(addOptions){
            var options = '<option value="0">Додаткова Опція</option>';

            for (var i = 0; i < addOptions.length; ++i) {
                options += '<option value="' + addOptions[i].id +
                    '" data-price="' + addOptions[i].price + '">' +
                    addOptions[i].name +
                    '</option>';
            }
            $('select[name="options"]').html(options);
        };
        
        initialize();

        return{
            getCarsComplectation: getCarsComplectation,
            getCarsEngine: getCarsEngine,
            getColors: getColors,
            getOptions: getOptions
        }

    })();
});
