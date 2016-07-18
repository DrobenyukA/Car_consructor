/**
 * Created by Drobenyuk.A on 09.07.16.
 */
$(function () {
    window.CarsApp =(function (){
        var initialize = function () {
            $.ajax('/cars').done(getCarsModels);
        };
        
        /**
         * Render select with cars models
         */
        var getCarsModels = function(data){
            var models = '<option value="0">Оберіть модель</option>';

            for (var i = 0; i < data.length; ++i) {
                models += '<option value="' + data[i].model_id + 
                                '" data-price="' + data[i].model_price + '">' +
                                data[i].model_name + 
                           '</option>';
            }
            $('select[name="models"]').html(models);
        };
        
        var getCarsComplectation = function(data){
            var complectation = '<option value="0">Оберіть коплектацію</option>';

            for (var i = 0; i < data.length; ++i) {
                complectation += '<option value="' + data[i].compl_id +
                    '" data-price="' + data[i].price + '">' +
                    data[i].compl_name +
                    '</option>';
            }
            $('select[name="complectations"]').html(complectation);
        };
        
        var getCarsEngine = function(data){
            var engine = '<option value="0">Оберіть Двигун</option>';

            for (var i = 0; i < data.length; ++i) {
                engine += '<option value="' + data[i].engine_id +
                    '" data-price="' + data[i].price + '">' +
                    data[i].engine_volume + ' ' +
                    data[i].engine_type + ' (' + data[i].engine_fuel + ') ' +
                    data[i].engine_power + ' ' +
                    data[i].gearbox_steps + data[i].gearbox_type +
                    '</option>';
            }

            $('select[name="engine"]').html(engine);
        };

        var getColors = function(data){
            var colors = '<option value="0">Оберіть Колір</option>',
                modelId = $('select[name="models"]').val(),
                price = null;

            for (var i = 0; i < data.length; ++i) {
                colors += '<option value="' + data[i].color_id;

                for (var j = 0; j < data[i].cars.length; j++){

                    if (parseInt(modelId) === parseInt(data[i].cars[j].model_id)){
                        colors += '" data-price="' + data[i].cars[j].price + '">';
                     }

                }
                colors += data[i].color_name +
                       '<span style="background: '+ data[i].color_value +'">'+data[i].color_value+'</span>' +
                    '</option>';
            }
            $('select[name="colors"]').html(colors);

        };

        var getOptions = function(data){
            var options = '<option value="0">Оберіть Опцію</option>';

            for (var i = 0; i < data.length; ++i) {
                options += '<option value="' + data[i].option_id +
                    '" data-price="' + data[i].price + '">' +
                    data[i].option_name +
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
