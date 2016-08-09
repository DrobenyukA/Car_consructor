/**
 * Created by Drobenyuk.A on 06.08.16.
 */

$(function (){
    window.UserView = (function (){
        
        var showUser = function (message){
            console.log('showUser from: ' + message);
            hidePopups();
            $('.login').addClass('hidden');
            $('.logout').removeClass('hidden');
            $('.register').addClass('hidden');
            $('.user').removeClass('hidden');
            setTimeout(function(){
                var username = sessionStorage.getItem('user_name');
                $('.user').html('Привіт, <span>' + username + '</span>');
            }, 500);

        };
        
        var showGuest = function(message){
            console.log('showGuest from: ' + message);
            $('.login').removeClass('hidden');
            $('.logout').addClass('hidden');
            $('.register').removeClass('hidden');
            $('.user').addClass('hidden');
            $('.user').html('');
        };

        var showFailureToLogin = function(message){
            console.log('showFailureToLogin from: ' + message);
            alert('Please enter valid data!');
        };
        
        var allowRegistration = function(){
            var login  = $('input[name="email"]').val(),
                password = $('input[name="confpassword"]').val();
            if (login && password){
                $('#registration .button').attr('onclick', 'UsersApp.registered()');
            } else {
                DeniRegistration();
            }

        };
        
        var DeniRegistration = function (status) {
            switch (status){
                case 1 : $('#registration .email').html('Email is already in use.');
                    break;
                case 2: 
                    $('#registration .email').html('Please enter valid email.');
                    $('input[type="email"]').addClass('error');
                    break;
                case 3:
                    $('input[type="password"]').addClass('error');
                    $('#registration .password').html('Passwords are not same.');
                    break;
                default: $('#registration .button').attr('onclick', 'alert("Please fill correct all fields")');
            }
            
        };

        var hidePopups = function (){
            var dropdowns = $('.dropdown-pane').hasClass('is-open');

            if (dropdowns){
                $('.dropdown-pane').removeClass('is-open').removeClass('left');
            }
        };

        return {
            showUser: showUser,
            showGuest: showGuest,
            showFailureToLogin: showFailureToLogin,
            allowRegistration: allowRegistration,
            DeniRegistration: DeniRegistration,
            hidePopups: hidePopups
        }
    })();
});
