'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * 
 *
 *  [2014] - [2015] Top Hat Voyage SAS - Alfred by THV
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Top Hat Voyage SAS and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Top Hat Voyage SAS
 * and its suppliers and may be covered by French and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Top Hat Voyage SAS.
 */


var Boom = require('boom'),
    Jwt = require('jsonwebtoken'),
    EncryptPwd = require('../Utility/thvcryptolib'),
    getZoneManagerModel = require('../model/zoneManager').getModel,
    getHotelManagerModel = require('../model/hotelManager').getModel,
    getHotelUserModel = require('../model/hotelUser').getModel,
    getSupplierManagerModel = require('../model/supplierManager').getModel,
    getSupplierUserModel = require('../model/supplierUser').getModel,
    getUserModel = require('../model/user').getModel,
    logger = require('../config/logger').logger,
    gravatar = require('gravatar');

//to  User Login

/**
   POST: /login
   Input: request.payload is the login info ( username and password ) to log in
 */

exports.login = function(database, config) {
    return function(request, reply) {
        var User = getUserModel(database);
        User.getByUserName(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) {
                    logger.warn({filePath: __filename}, {functionName: 'login'}, 'Invalid User Name and Password.');
                    return reply(Boom.forbidden('Invalid User Name and Password')); //HTTP 403
                } else {
                    if (request.payload.password !== EncryptPwd.decrypt(user.password, config)) {
                        logger.warn({filePath: __filename}, {functionName: 'login'}, 'Invalid User Name and Password.');
                        return reply(Boom.forbidden('Invalid User Name and Password')); //HTTP 403
                    }

                    if (user.scope === 'ZoneManager') {

                        loginAsZoneManager(database, config, user, reply);
                        
                    } else if (user.scope === 'HotelManager') {

                        loginAsHotelManager(database, config, user, reply);
                        
                    } else if (user.scope === 'HotelUser') {

                        loginAsHotelUser(database, config, user, reply);

                    } else if (user.scope === 'SupplierManager') {

                        loginAsSupplierManager(database, config, user, reply);
                        
                    } else if (user.scope === 'SupplierUser') {

                        loginAsSupplierUser(database, config, user, reply);
                        
                    } else {

                        loginAsOthers(config, user, reply);

                    }
                }
            }

        });

    };

};

function loginAsZoneManager(database, config, user, reply){
    var ZoneManagerModel = getZoneManagerModel(database);
    ZoneManagerModel.getByIdBasic(user.userId, function(err, zoneManagerUser) {
        if (!err) {
            if (zoneManagerUser === null) {
                logger.warn({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'This Account no more exist.');
                return reply(Boom.notFound('This Account no more exist')); //HTTP 404
            }
            var tokenData = {
                userId: user.userId,
                scope: [user.scope],
                username: user.username,
                zone: zoneManagerUser.zone
            };
            var res = {
                userId: user.userId,
                username: user.username,
                scope: user.scope,
                zone: zoneManagerUser.zone,
                url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
                token: Jwt.sign(tokenData, config.key.privateKey)
            };

            return reply(res);
        } else {
            logger.error({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'error in loginAsZoneManager');
            reply(Boom.badImplementation(err)); //HTTP 500
        }
    });
}

function loginAsHotelManager(database, config, user, reply){
    var HotelManagerModel = getHotelManagerModel(database);
    HotelManagerModel.getById(user.userId, function(err, hotelManagerUser) {
        if (!err) {
            if (hotelManagerUser === null) {
                logger.warn({filePath: __filename}, {functionName: 'loginAsHotelManager'}, 'This Account no more exist.');
                return reply(Boom.notFound('This Account no more exist')); //HTTP 404
            }
            var tokenData = {
                userId: user.userId,
                scope: [user.scope],
                username: user.username,
                zone: hotelManagerUser.zone,
                hotel: hotelManagerUser.hotel
            };
            var res = {
                userId: user.userId,
                username: user.username,
                scope: user.scope,
                zone: hotelManagerUser.zone,
                hotel: hotelManagerUser.hotel,
                url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
                token: Jwt.sign(tokenData, config.key.privateKey)
            };

            return reply(res); //HTTP 200
        } else {
            logger.error({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'error in loginAsHotelManager');
            reply(Boom.badImplementation(err)); //HTTP 500
        }
    });
}

function loginAsHotelUser(database, config, user, reply){
    var HotelUserModel = getHotelUserModel(database);
    HotelUserModel.getById(user.userId, function(err, hotelUser) {
        if (!err) {
            if (hotelUser === null) {
                logger.warn({filePath: __filename}, {functionName: 'loginAsHotelUser'}, 'This Account no more exist.');
                return reply(Boom.notFound('This Account no more exist')); //HTTP 404
            }
            var tokenData = {
                userId: user.userId,
                scope: [user.scope],
                username: user.username,
                zone: hotelUser.zone,
                hotel: hotelUser.hotel
            };
            var res = {
                userId: user.userId,
                username: user.username,
                scope: user.scope,
                zone: hotelUser.zone,
                hotel: hotelUser.hotel,
                url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
                token: Jwt.sign(tokenData, config.key.privateKey)
            };

            return reply(res);
        } else {
            logger.error({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'error in loginAsHotelUser');
            reply(Boom.badImplementation(err)); //HTTP 500
        }
    });
}

function loginAsSupplierManager(database, config, user, reply){
    var SupplierManagerModel = getSupplierManagerModel(database);
    SupplierManagerModel.getByIdBasic(user.userId, function(err, supplierManager) {
        if (!err) {
            if (supplierManager === null) {
                logger.warn({filePath: __filename}, {functionName: 'loginAsSupplierManager'}, 'This Account no more exist.');
                return reply(Boom.notFound('This Account no more exist')); //HTTP 404
            }
            var tokenData = {
                userId: user.userId,
                scope: [user.scope],
                username: user.username,
                supplier: supplierManager.supplier
            };
            var res = {
                userId: user.userId,
                username: user.username,
                scope: user.scope,
                supplier: supplierManager.supplier,
                url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
                token: Jwt.sign(tokenData, config.key.privateKey)
            };

            return reply(res); //HTTP 200
        } else {
            logger.error({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'error in loginAsSupplierManager');
            reply(Boom.badImplementation(err)); // 500 error
        }
    });
}

function loginAsSupplierUser(database, config, user, reply){
    var SupplierUserModel = getSupplierUserModel(database);
    SupplierUserModel.getByIdBasic(user.userId, function(err, supplierUser) {
        if (!err) {
            if (supplierUser === null) {
                logger.warn({filePath: __filename}, {functionName: 'loginAsSupplierUser'}, 'This Account no more exist.');
                return reply(Boom.notFound('This Account no more exist')); //HTTP 404
            }
            var tokenData = {
                userId: user.userId,
                scope: [user.scope],
                username: user.username,
                supplier: supplierUser.supplier
            };
            var res = {
                userId: user.userId,
                username: user.username,
                scope: user.scope,
                supplier: supplierUser.supplier,
                url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
                token: Jwt.sign(tokenData, config.key.privateKey)
            };

            return reply(res); //HTTP 200
        } else {
            logger.error({filePath: __filename}, {functionName: 'loginAsZoneManager'}, 'error in loginAsSupplierUser');
            reply(Boom.badImplementation(err)); // 500 error
        }
    });
}

function loginAsOthers(config, user, reply){
    var tokenData = {
        userId: user.userId,
        scope: [user.scope],
        username: user.username
    };
    var res = {
        userId: user.userId,
        username: user.username,
        url: gravatar.url(user.username, { s: '100', r: 'pg', d: '202' }),
        scope: user.scope,
        token: Jwt.sign(tokenData, config.key.privateKey)
    };

    return reply(res); //HTTP 200
}