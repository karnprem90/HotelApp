'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * __________________
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
    Helper = require('../Utility/helper'),
    getHotelUserModel = require('../model/hotelUser').getModel,
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;

//to get Hotel User by Id

/**
   GET: /getHotelUser
 */

exports.getHotelUser = function(database, config) {
    return function(request, reply) {
        var HotelUser = getHotelUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            HotelUser.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getHotelUser'}, 'No such Hotel user exist.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelUser'}, 'error in get hotel user');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });
    };
};

//to get Hotel User List By Zone Id

/**
   GET: /getHotelUserList by Zone Manager
   GET: //getHotelUserList/{zone} by Executive Manager
 */

exports.getHotelUserList = function(database, config) {
    return function(request, reply) {
        var HotelUser = getHotelUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var zoneId;
            if (decoded.scope[0] === 'ZoneManager') {
                zoneId = decoded.userId;
            } else if (decoded.scope[0] === 'ExecutiveManager') {
                zoneId = request.params.zone;
            }
            HotelUser.getHotelUserListByZone(zoneId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.error({filePath: __filename}, {functionName: 'getHotelUserList'}, 'No such Zone exist.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    return reply(user); //HTTP 200

                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelUserList'}, 'error in get hotel user list');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });
    };
};

// to update Hotel User

/**
   PUT: /updateHotelUser by Hotel User
   PUT: /updateHotelUser/{id} by Zone Manager
   Input: request.payload is the hotel user data to update hotel user
 */

exports.updateHotelUser = function(database, config) {
    return function(request, reply) {
        var HotelUser = getHotelUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'HotelUser') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            HotelUser.getById(userId, function(err, hotelUser) {
                Helper.updateHelper(request.payload, hotelUser);
                HotelUser.updateHotelUser(hotelUser, function(err, hotelUser) {
                    if (!err) {
                        reply(hotelUser); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateHotelUser'}, 'please provide another hotel user id, it already exist.');
                            reply(Boom.forbidden('please provide another hotel user id, it already exist')); //HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateHotelUser'}, 'error in update hotel user');
                            reply(Boom.badImplementation(err)); // 500 error
                        }
                    }
                });
            });
        });
    };
};
