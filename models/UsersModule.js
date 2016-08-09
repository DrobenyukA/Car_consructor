/**
 * Created by Drobenyuk.A on 06.08.16.
 */
var dbManager = require('./../services/DataService'),
    logger    = require('./../services/Logger'),
    User      = require('./../models/Users');


module.exports = (function (){
    var data    = [],
        sessions = [];

    var initialize = function (){
        var path  = './data/users.json',
            users = dbManager.getData(path);

        for (var i = 0; i < users.length; ++i) {
            data.push(new User(users[i]));
        }
    };

    var registered = function(guest){
        var path    = './data/users.json',
            userId  = dbManager.getData(path).length + 1,
            newUser = {
                "id": userId,
                "first_name": guest.first_name,
                "last_name": guest.last_name,
                "type": 'user',
                "email": guest.email,
                "password": guest.password
            };

        return dbManager.saveData(path, newUser);
    };
    
    var authenticate = function (guest){
        var user = [];
        for (var i = 0; i < data.length; i++){
            if (data[i].isCurrentUser(guest.email, guest.password)){
                user.push(data[i]);
            }
        }

        if (user.length > 1) {
            logger.logError("Multiple users " + JSON.stringify(user));
            throw {
                message: "DataBase error!"
            };
        } else if(user.length === 1){
            return createSession(user[0]);
        } else {
            return null;
        }

    };

    var isAvailableLogin = function (guest){
        for (var i = 0; i < data.length; i++){
            if (data[i].checkLogin(guest.login)){
               return false
            }
        }
        return true
    };

    var createSession = function(user){
        var sessionId = sessions.length + 1,
            session   = {
                id: sessionId,
                user_id: user.getId(),
                user_name: user.getFullName(),
                token: generateToken()
            };
        sessions.push(session);

        delete session.id;
        delete session.user_id;

        return session;
    };

    var generateToken = function () {
        var token   = '',
            source  = '1234567890QPWOEIRUTYLAKSJDHFGZMXNCBVhgjfkdldsazpxoicuvbyntmrewq0987456321';

        for (var i = 0; i < 32; ++i) {
            token += source[Math.floor(Math.random() * (source.length - 1)) + 1];
        }

        return token;
    };

    var checkSession = function(token, action){
        var session = null;
        for(var i = 0; i < sessions.length; i++){
            if (sessions[i].token === token){
                session = sessions[i];
            }
        }

        if (session){
            action();
        } else {
            throw {
                status: 401
            };
        }
    };

    var authorize = function (request, response, action){
        try{
            checkSession(req.headers.token, function () {
                res.send(action());
            });
        } catch (error) {
            logger.logError("Couldn't authorize user with token: " + req.headers.token);
            res.statusCode = error.status;
            res.send();
        }
    };


    initialize();

    return {
        registered: registered,
        authenticate: authenticate,
        authorize: authorize,
        isAvailableLogin: isAvailableLogin
    };
})();