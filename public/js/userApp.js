/**
 * Created by Drobenyuk.A on 06.08.16.
 */

$(function () {
    window.UsersApp = (function (){
        var session = null;

        var initialize = function (){
            var token = sessionStorage.getItem('token');

            if (token && (token != 'undefined')) {
                session = {};
                session.token = token;
                session.user_name = sessionStorage.getItem('user_name');
                UserView.showUser('initialize');
            };

        };

        var registered = function (){
            var email    = $('input[name="email"]').val(),
                password = $('input[name="password"]').val(),
                fname    = $('input[name="fname"]').val(),
                lname    = $('input[name="lname"]').val();

            $.ajax({
                url: '/registered',
                method: 'POST',
                data: {
                    email: email,
                    password: password,
                    first_name: fname,
                    last_name: lname
                }
            }).done(function (data) {
                if (data){
                    UserView.hidePopups();
                    alert('Registration was success!');
                    return;
                }
                return console.log('Failure to register. Something went wrong!');

            }).fail(function (error) {
                alert('Server not respond!');
            });
        };

        var authenticate = function(){
            var email    = $('input[name="login"]').val(),
                password = $('input[name="passwd"]').val();
            
            $.ajax({
                url: '/authenticate',
                method: 'POST',
                data: {
                    email: email,
                    password: password
                }
            }).done(function (data) {
                console.log(data);
                if (!data){
                    UserView.showFailureToLogin('UsersApp.authenticate');
                    return;
                }
                session = data;

                UserView.showUser('UsersApp.authenticate');
                
                sessionStorage.setItem('token', session.token);
                sessionStorage.setItem('user_name', session.user_name);
            }).fail(function (error) {
                alert('Server not respond!');
            });

        };
        
        var clearSession = function(){
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user_name');
            session = null;
          
        };

        var logOut = function(){
            clearSession();
            UserView.showGuest();
        };
        
        var isNewUser = function(){
            var login  = $('input[name="email"]').val();
            var status = 0;

            if (isValidLogin(login)){
                $.ajax({
                    url: '/checklogin',
                    method: 'POST',
                    data:{
                        login: login
                    }
                }).done(function(data){
                    if (data){
                        $('#registration .email').html('');
                        $('input[type="email"]').removeClass('error');
                        return UserView.allowRegistration();
                    }
                    status = 1;
                    return UserView.DeniRegistration(status);
                });
            } else{
                status = 2;
                return UserView.DeniRegistration(status);
            }

        };

        var isValidLogin = function(login){
            var reg = /([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}/,
                result = reg.test(login.toLowerCase());

            return result;
        };
        
        var isSamePassword = function(){
            var password     = $('input[name="password"]').val(),
                confpassword = $('input[name="confpassword"]').val(),
                status = 3;
            
            if (password === confpassword){
                UserView.allowRegistration();
                $('input[type="password"]').removeClass('error');
                $('#registration .password').html('');
            } else {
                UserView.DeniRegistration(status);
            }
        };
        
        initialize();

        return {
            authenticate: authenticate,
            registered: registered,
            isNewUser: isNewUser,
            isSamePassword: isSamePassword,
            logOut: logOut
        }

    })();
});