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
    getUserModel = require('../model/user').getModel,
    getHotelModel = require('../model/hotel').getModel,
    getHotelManagerModel = require('../model/hotelManager').getModel,
    getHotelUserModel = require('../model/hotelUser').getModel,
    Async = require('async'),
    Helper = require('../Utility/helper'),
    EncryptPwd = require('../Utility/thvcryptolib'),
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;


//to create Hotel,HotelManager and Hotel User

/**
   POST: /createHotel
   Input: request.payload is the hotel data to create hotel, hotel manager, hotel user
 */

exports.createHotel = function(database, config, EmailService) {
    return function(request, reply) {
        var Hotel = getHotelModel(database),
            HotelManager = getHotelManagerModel(database),
            HotelUser = getHotelUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            request.payload.hotel.zone = decoded.userId;
            request.payload.hotelManager.zone = decoded.userId;

            Async.waterfall([
                    function(callback) {
                        Hotel.createHotel(request.payload.hotel, function(err, result) {
                            callback(err, result);
                        });
                    },
                    function(arg1, callback) {
                        if (arg1._id !== undefined) {
                            request.payload.hotelManager.hotel = arg1._id;

                            createHotelManager(HotelManager, request.payload.hotelManager, callback);
                        } else {
                            logger.warn({filePath: __filename}, {functionName: 'createHotel'}, 'unable to create hotel');
                            return reply(Boom.forbidden('unable to create hotel')); //HTTP 403
                        }
                    },

                    function(arg1, callback) {
                        if (arg1._id !== undefined) {
                            var user = {
                                userId: arg1._id,
                                username: arg1.email,
                                password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                                scope: 'HotelManager'
                            };
                            var User = getUserModel(database);

                            createUser(User, user, callback);
                        } else {
                            logger.warn({filePath: __filename}, {functionName: 'createHotel'}, 'unable to create hotel');
                            return reply(Boom.forbidden('unable to create hotel')); //HTTP 403
                        }
                    }
                ],
                //executes after all the async function is success.
                function(err, results) {
                    if (results) {
                        EmailService.sentMail(results, results.username, config);
                        Async.each(request.payload.hotelUser, function(hotelUser, callback) {
                            var User = getUserModel(database);
                            hotelUser.zone = request.payload.hotel.zone;
                            hotelUser.hotel = request.payload.hotelManager.hotel;

                            createHotelUser(HotelUser, User, config, hotelUser, EmailService, reply, callback);
                        }, function(err) {

                            createHotelUserResponse(err, reply);
                        });
                    } else {

                            handleRollback(err, Hotel, HotelManager, request, reply);
                    }
                });
        });
    };
};


function createHotelManager(HotelManager, request, callback){
    HotelManager.createHotelManager(request, function(err, result) {
        if (err) {
            err.collection = 'hotel';
        }
        callback(err, result);
    });
}

function createUser(User, user, callback){
    User.createUser(user, function(err, result) {
        if (err) {
            err.collection = 'hotel hotelManager';
            err.hotelManagerid = user.userId;
        }

        callback(err, result);
    });
}

function createHotelUser(HotelUser, User, config, hotelUser, EmailService, reply, callback){
    HotelUser.createHotelUser(hotelUser, function(err, result) {
        if (err) {
            callback(err, result);
        } else {
            var user = {
                userId: result._id,
                username: result.email,
                password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                scope: 'HotelUser'
            };
            
            User.createUser(user, function(err, result) {
                if (!err) {
                    EmailService.sentMail(result, result.username, config);
                    return reply(constants.successMessage); //HTTP 200
                }
                callback(err, result); 
            });
        }
    });
}

function createHotelUserResponse(err, reply){
    if (err) {
        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
            logger.warn({filePath: __filename}, {functionName: 'createHotelUserResponse'}, 'please provide another email, it already exist.');
            reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403
        } else {
            logger.error({filePath: __filename}, {functionName: 'createHotelUserResponse'}, 'error in create hotel user');
            return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
        }

    } else {
        return reply(constants.successMessage); //HTTP 200 
    }
}

function handleRollback(err, Hotel, HotelManager, request, reply){
     if (err.collection === 'hotel') {
        Hotel.removeHotel(request.payload.hotelManager.hotel, function() {
            if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                logger.warn({filePath: __filename}, {functionName: 'handleRollback'}, 'please provide another email, it already exist.');
                return reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403 
            } else {
                logger.error({filePath: __filename}, {functionName: 'handleRollback'}, 'error in handling rollback');
                return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
            }
        });
    } else if (err.collection === 'hotel hotelManager') {
        HotelManager.removeHotelManager(err.hotelManagerid, function() {
            Hotel.removeHotel(request.payload.hotelManager.hotel, function() {
                if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                    logger.warn({filePath: __filename}, {functionName: 'removeHotelManager'}, 'please provide another email, it already exist.');
                    reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403
                } else {
                    logger.error({filePath: __filename}, {functionName: 'removeHotelManager'}, 'error in get create handling rollback');
                    return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
                }
            });

        });
    }
}

//to get Hotel By Zone

/**
   GET: /getHotelsByZone
 */

exports.getHotelsByZone = function(database, config){
    return  function (request, reply) {
        var Hotel = getHotelModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Hotel.getByZone(decoded.userId, function(err, user) {
                if (!err) {
                    if (user.length === 0) {
                        logger.warn({filePath: __filename}, {functionName: 'getHotelsByZone'}, 'No hotel exist fot this Zone.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                         return reply(user); // HTTP 200
                    }
                   

                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelsByZone'}, 'error in get hotel by zone');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };

};

// to get Hotel by Id

/**
   GET: /getHotelsById/{id}
 */

exports.getHotelsById = function(database, config){
    return  function (request, reply) {
        var Hotel = getHotelModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Hotel.getById(request.params.id, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getHotelsById'}, 'No hotel exist fot this Zone.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }else{
                        return reply(user); // HTTP 200
                    }
                    

                } else {
                    logger.error({filePath: __filename}, {functionName: 'getHotelsById'}, 'error in get hotel by Id');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });
    };

};

//to update Hotel

/**
   PUT: /updateHotel/{id}
   Input: request.payload is the hotel data to update hotel
 */

exports.updateHotel = function(database, config) {
    return function (request, reply) {
        var Hotel = getHotelModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Hotel.getById(request.params.id, function(err, hotel) {
                Helper.updateHelper(request.payload, hotel);
                Hotel.updateHotel(hotel, function(err, hotel) {
                    if (!err) {
                        reply(hotel); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateHotel'}, 'please provide another hotel user id, it already exist.');
                            reply(Boom.forbidden('please provide another hotel user id, it already exist'));// HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateHotel'}, 'error in update hotel');
                            reply(Boom.badImplementation(err)); // 500 error
                        }
                    }
                });
            });
        });
    };
};

//to get All Hotel

/**
   GET: /getAllHotel/{id}
 */

exports.getAllHotel = function(database) {
    return function(request, reply) {
        var HotelModel = getHotelModel(database);
        var HotelManagerModel = getHotelManagerModel(database);
        var HotelUserModel = getHotelUserModel(database);
        HotelModel.getById(request.params.id, function(err, hotel) {
            HotelManagerModel.getAllHotelManager(request.params.id, function(err, hotelManager) {
                HotelUserModel.getAllHotelUser(request.params.id, function(err, hotelUser) {
                    var result = [];
                    var data = {};
                    data.hotel = hotel;
                    data.hotelManager = hotelManager;
                    data.hotelUser = hotelUser;
                    result.push(data);
                    return reply(result); //HTTP 200
                });

            });
        });
    };
};