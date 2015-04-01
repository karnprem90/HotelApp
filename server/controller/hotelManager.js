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
    getHotelManagerModel = require('../model/hotelManager').getModel,
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;


// to get Hotel Manager By Id

/**
   GET: /getHotelManager
 */

exports.getHotelManager = function(database, config) {
    return function(request, reply) {
        var HotelManager = getHotelManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            HotelManager.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getHotelManager'}, 'No such Hotel manager exist.'); 
                        reply(Boom.notFound('Not Found')); //HTTP 404 
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelManager'}, 'error in get hotel manager');
                    reply(Boom.badImplementation(err)); //HTTP 500
                }
            });
        });
    };
};

// to get Hotel Manager List By ZoneId

/**
   GET: /getHotelManagerList  by ZoneManager
   GET: /getHotelManagerList/{zone}  by ExecutiveManager
 */

exports.getHotelManagerList = function(database, config) {
    return function(request, reply) {
        var HotelManager = getHotelManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var zoneId;
            if (decoded.scope[0] === 'ZoneManager') {
                zoneId = decoded.userId;
            } else if (decoded.scope[0] === 'ExecutiveManager') {
                zoneId = request.params.zone;
            }
            HotelManager.getHotelManagerListByZone(zoneId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getHotelManagerList'}, 'No such Zone exist.');
                        reply(Boom.notFound('Not Found')); //HTTP 404 
                    }
                    else{
                        return reply(user); //HTTP 200
                    }

                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelManagerList'}, 'error in get hotel manager list');
                    reply(Boom.badImplementation(err)); //HTTP 500
                }
            });
        });
    };
};

// to Update Hotel Manager

/**
   PUT: /updateHotelManager
   Input: request.payload is the hotel manager data to update hotel manager
 */

exports.updateHotelManager = function(database, config) {
    return function(request, reply) {
        var HotelManager = getHotelManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            HotelManager.getById(decoded.userId, function(err, hotelManager) {
                Helper.updateHelper(request.payload, hotelManager);
                HotelManager.updateHotelManager(hotelManager, function(err, hotelManager) {
                    if (!err) {
                        reply(hotelManager); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateHotelManager'}, 'please provide another hotel manager id, it already exist.');
                            reply(Boom.forbidden('please provide hotel manager id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateHotelManager'}, 'error in update hotel manager');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};

//to update Hotel Manager By HotelId

/**
  PUT: /updateHotelManager/{hotel}
  PUT: /updateHotelManager/{hotel}/{zone}
  Input: request.payload is the hotel manager data to update hotel
 */

exports.updateHotelManagerByZoneHotel = function(database, config) {
    return function(request, reply) {
        var HotelManager = getHotelManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            HotelManager.getByZoneIdHotelId(decoded.userId, request.params.hotel, function(err, hotelManager) {
                Helper.updateHelper(request.payload, hotelManager);
                HotelManager.update(hotelManager, function(err, hotelManager) {
                    if (!err) {
                            reply(hotelManager) // HTTP 200     
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateHotelManagerByZoneHotel'}, 'please provide another hotel manager id, it already exist.');
                            reply(Boom.forbidden('please provide hotel manager id, it already exist'));
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateHotelManagerByZoneHotel'}, 'error in update hotel manager by zone');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};

