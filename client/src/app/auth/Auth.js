'use strict';


angular.module('thvfactory', [])

.factory('AuthServ', function($cookieStore) {
    var user = $cookieStore.get('user') || {};
    return {
        getToken: function() {
            return user.token;
        },
        getUser: function() {
            return user;
        },
        getAuthHeader: function() {
            return (user && user.token) ? {
                'Authorization': 'Bearer ' + user.token
            } : {};
        },
        setUserToken: function(newUser, save) {
            user = newUser;
            if (!save) {
                return this.clearCookie();
            }
            this.saveToCookie();
        },
        saveToCookie: function() {
            $cookieStore.put('user', user);
        },
        clearCookie: function() {
            $cookieStore.remove('user');
            console.log(user);
        },
        loadFromCookie: function() {
            user = $cookieStore.get('user');

        },
        removeUser: function() {
            user = null;
            $cookieStore.put('user', user);

        },
        isAuthorized: function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            if (authorizedRoles[0] == "*")
                return true;
            return (authorizedRoles.indexOf($cookieStore.get('user').scope) !== -1);
        },

        isLoggedInAsync: function(cb) {
            if (user && user.scope) {
                return true;
            }
            return false;
        }

    };
})


// .factory('AuthService', function ($http, Session) {
//   var authService = {};

//   authService.login = function (credentials) {
//     return $http
//       .post('/login', credentials)
//       .then(function (res) {
//         Session.create(res.data.id, res.data.user.id,
//                        res.data.user.role);
//         return res.data.user;
//       });
//   };

//   authService.isAuthenticated = function () {
//     return !!Session.userId;
//   };

//   authService.isAuthorized = function (authorizedRoles) {
//     if (!angular.isArray(authorizedRoles)) {
//       authorizedRoles = [authorizedRoles];
//     }
//     return (authService.isAuthenticated() &&
//       authorizedRoles.indexOf(Session.userRole) !== -1);
//   };

//   return authService;
// })

// .factory('AuthInterceptor', function ($rootScope, $q,
//                                       AUTH_EVENTS) {
//   return {
//     responseError: function (response) { 
//       $rootScope.$broadcast({
//         401: AUTH_EVENTS.notAuthenticated,
//         403: AUTH_EVENTS.notAuthorized,
//         419: AUTH_EVENTS.sessionTimeout,
//         440: AUTH_EVENTS.sessionTimeout
//       }[response.status], response);
//       return $q.reject(response);
//     }
//   };
// })