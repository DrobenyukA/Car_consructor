/**
 * Created by Drobenyuk.A on 06.08.16.
 */
module.exports = function (user) {

    var getId = function () {
        return user.id;
    };

    var isCurrentUser = function (email, password) {
        return email === user.email && password === user.password;
    };

    var getFullName = function () {
        return user.first_name + " " + user.last_name;
    };

    var isAdmin = function (){
        return user.type === "admin";
    };

    var checkLogin = function (email) {
        return email === user.email;
    };

    return {
        getId: getId,
        isCurrentUser: isCurrentUser,
        getFullName: getFullName,
        isAdmin: isAdmin,
        checkLogin: checkLogin
    }
};