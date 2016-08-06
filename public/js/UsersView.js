/**
 * Created by Drobenyuk.A on 06.08.16.
 */

$(function (){
    window.UserView = (function (){
        
        var showUser = function (message){
            console.log('showUser from: ' + message);
        };
        
        var showGuest = function(message){
            console.log('showGuest from: ' + message);
        };

        var showFailureToLogin = function(message){
            console.log('showFailureToLogin from: ' + message);
        };

        var showFailureToRegister = function(message){
            console.log('showFailureToRegister from: ' + message);
        };
        
        var allowRegistration = function(){
            var login  = $('input[name="email"]').val(),
                password = $('input[name="confpassword"]').val();
            if (login && password){
                $('footer .button').attr('onclick', 'UsersApp.registered()');
            } else {
                DeniRegistration();
            }

        };
        
        var DeniRegistration = function (status) {
            switch (status){
                case 1 : console.log('Email is already in use.');
                    break;
                case 2: console.log('Please enter valid email.');
                    break;
                case 3: console.log('Passwords are not same.');
                    break;
                default: $('footer .button').attr('onclick', 'alert("Please fill correct all fields")');
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
            showFailureToRegister: showFailureToRegister,
            allowRegistration: allowRegistration,
            DeniRegistration: DeniRegistration,
            hidePopups: hidePopups
        }
    })();
});
