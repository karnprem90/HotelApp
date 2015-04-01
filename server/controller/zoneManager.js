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
    getZoneManagerModel = require('../model/zoneManager').getModel,
    getUserModel = require('../model/user').getModel,
    EncryptPwd = require('../Utility/thvcryptolib'),
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;

function updateHelper(requestData, originalData) {
    for (var req in requestData) {
        if (req === 'homeAddress' || req === 'officeAddress') {
            for (var req1 in requestData[req]) {
                if (requestData[req][req1] === ' ') {
                    originalData[req][req1] = ' ';
                } else {
                    originalData[req][req1] = requestData[req][req1];
                }
            }
        } else {
            if (requestData[req] === ' ') {
                originalData[req] = ' ';
            } else {
                originalData[req] = requestData[req];
            }
        }

    }
}
// to create ZoneManager

/**
   POST: /createZoneManager
   Input: request.payload is the zone manager data to create zone manager
 */

exports.createZoneManager = function(database, config, EmailService) {
    return function(request, reply) {
        var ZoneManager = getZoneManagerModel(database);
        ZoneManager.createZoneManager(request.payload, function(err, result) {
            if(!err){
                var user = {
                    userId: result._id,
                    username: request.payload.email,
                    password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                    scope: 'ZoneManager'
                };
                var User = getUserModel(database);
                User.createUser(user, function (err, user) {
                    var strError = 'Oops! Something went wrong. Unable to delete ZoneManager Previous account during user creation failure';
                    if (!err) {
                        EmailService.sentMail(user, request.payload.email, config);
                        return reply(constants.successMessage); //HTTP 200
                    }
                    else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            strError = 'please provide another email, it already exist.';
                        }
                        ZoneManager.removeZoneManager(result._id, function (err) {
                            if (err) {
                                    strError = 'Oops! Something went wrong. Unable to delete ZoneManager Previous account during user creation failure';
                            }
                            logger.error({filePath: __filename}, {functionName: 'createZoneManager'}, strError);
                            reply(Boom.forbidden(strError)); // HTTP 403
                        });
                    }
                });
            }
            else {
                
                    logger.error({filePath: __filename}, {functionName: 'createZoneManager'}, 'error in create zone manager');
                    return reply(err);// HTTP 403
            }
        }); 
    };
};

// to get ZoneManager By Id

/**

   GET: /getZoneManager
 */

exports.getZoneManager = function(database, config) {
    return function(request, reply) {
        var ZoneManager = getZoneManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            ZoneManager.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getZoneManager'}, 'No such Zone exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getZoneManager'}, 'error in get zone manager');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };
};


//to Update ZoneManager

/**
   PUT: /updateZoneManager by Zone Manager
   PUT: /updateZoneManager/{id} by Executive Manager
   Input: request.payload is the zone manager data to update zone manager
 */

exports.updateZoneManager = function(database, config) {
    return function(request, reply) {
        var ZoneManager = getZoneManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'ZoneManager') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            ZoneManager.getById(userId, function(err, zoneManager) {
                if (zoneManager === null) {
                    logger.error({filePath: __filename}, {functionName: 'updateZoneManager'}, 'No such account exist');
                    return reply(Boom.forbidden('No such account exist')); // HTTP 403
                }
                updateHelper(request.payload, zoneManager);
                ZoneManager.updateZoneManager(zoneManager, function(err, zoneManager) {
                    if (!err) {
                        reply(zoneManager); //HTTP 200
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'updateZoneManager'}, 'error in update zone manager');
                        reply(Boom.forbidden(err)); // HTTP 403

                    }
                });
            });
        });
    };
};

