/**
 * Created by Drobenyuk.A on 31.07.16.
 */
(function(){
    
    //TODO make adaptive scroll
    var adaptWindow = function(event){
        $('html,body').animate({
            scrollTop: event.scroll
        }, 500);
    };

    var renderPayments = function(event){
        if (!parseInt(event.bankId)){

            $('.payments').addClass('hidden');
            return;
        }

        $.ajax('/payments', {
            data: {
                bankId: event.bankId
            }
        }).done(window.CreditApp.setPayments);

        $('.payments').removeClass('hidden');
    };

    var renderPeriods = function(event){
        if (!parseInt(event.bankId)
            || !parseInt(event.paymentId)){

            $('.periods').addClass('hidden');
            return;
        }

        $.ajax('/period', {
            data: {
                bankId: event.bankId,
                payment: event.payment
            }
        }).done(window.CreditApp.setPeriods);

        $('.periods').removeClass('hidden');
    };

    var renderInterest = function(event){
        if (!parseInt(event.bankId)
            || !parseInt(event.paymentId)
            || !parseInt(event.periodId)){

            $('#credit-result').html('');
            $('.interest').addClass('hidden');
            $('.credit-calc').addClass('hidden');
            $('.btn-calc').addClass('hidden');
            return;
        }
        $.ajax('/interest', {
            data: {
                bankId: event.bankId,
                paymentId: event.paymentId,
                periodId: event.periodId
            }
        }).done(window.CreditApp.setInterest);

        var calcButton = '<button class="success button" onclick="calcCredit()">Розрахувати</button>';

        $('.interests').removeClass('hidden');
        $('.credit-calc').removeClass('hidden');
        $('.btn-calc').removeClass('hidden').html(calcButton);
    };

    var renderCreditInfo = function (event){
        $.ajax({
            method: 'post',
            url: '/credit',
            data: {
                priceVal: event.priceVal,
                bankId: event.bankId,
                paymentId: event.paymentId,
                periodId: event.periodId,
                interestVal: event.interestVal
            }
        }).done(function (content) {
            printCreditData(content);
            $('.credit-calc').addClass('hidden');
            $('.btn-calc').addClass('hidden');
        });

    };

    var printCreditData = function(data){

        var content = [
            '<h3>Ваш результат:</h3>',
            '<table>',
            '<tbody>',
            '<tr><th>Початковий внесок:</th><td>',
            data.fistPayment.toFixed(2),
            ' грн.</td></tr><tr><th>Разова комісія</th><td>',
            data.commission.toFixed(2),
            ' грн.</td></tr><tr><th>Страхування:</th><td>',
            data.kasko.toFixed(2),
            ' грн.</td></tr><tr><th>Місячний платіж:</th><td>',
            data.monthPayment.toFixed(2),
            ' грн.</td></tr></tbody></table>'
        ].join('');
        $('#credit-result').html(content);
    }

    dispatcher.addListener('setPayments', renderPayments);
    dispatcher.addListener('setPayments', renderPeriods);
    dispatcher.addListener('setPayments', renderInterest);
    dispatcher.addListener('setPayments', adaptWindow);

    dispatcher.addListener('setPeriods', renderPeriods);
    dispatcher.addListener('setPeriods', renderInterest);
    dispatcher.addListener('setPeriods', adaptWindow);

    dispatcher.addListener('setInterest', renderInterest);
    dispatcher.addListener('setInterest', adaptWindow);

    dispatcher.addListener('calcCredit', renderCreditInfo);

})();

function getBanks(){
    $.ajax('/bank').done(window.CreditApp.setBanks);

    $('.banks').removeClass('hidden');
    $('.credit-info').addClass('hidden');
    $('.btn-credit').addClass('hidden');
}

function setPayments() {
    var bankId = $('select[name="banks"]').val(),
        scroll = $('select[name="banks"]').offset().top - 400;

    dispatcher.notify({
        name: 'setPayments',
        bankId: bankId,
        scroll: scroll
    });
}

function setPeriods(){
    var bankId  = $('select[name="banks"]').val(),
        paymentId = $('select[name="payment"]').val(),
        scroll = $('select[name="payment"]').offset().top - 400;

    dispatcher.notify({
        name: 'setPeriods',
        bankId: bankId,
        paymentId: paymentId,
        scroll: scroll
    });
}

function setInterest(){
    var bankId     = $('select[name="banks"]').val(),
        paymentId  = $('select[name="payment"]').val(),
        periodId   = $('select[name="period"]').val(),
        scroll     = $('select[name="period"]').offset().top - 400;

    dispatcher.notify({
        name: 'setInterest',
        bankId: bankId,
        paymentId: paymentId,
        periodId: periodId,
        scroll: scroll
    });
}

function calcCredit() {
    var priceVal    = $('#price-js').text(),
        bankId      = $('select[name="banks"]').val(),
        paymentId   = $('select[name="payment"]').val(),
        periodId    = $('select[name="period"]').val(),
        interestVal = $('.interest-input').attr("data-id");


    dispatcher.notify({
        name: 'calcCredit',
        priceVal: priceVal,
        bankId: bankId,
        paymentId: paymentId,
        periodId: periodId,
        interestVal: interestVal
    });

}
