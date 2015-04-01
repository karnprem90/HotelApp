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
    getLogisticAgentModel = require('../model/logisticAgent').getModel,
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

//to create LogisticAgent

/**
   POST: /createLogisticAgent
   Input: request.payload is the logistic agent data to create logistic agent
 */

exports.createLogisticAgent = function(database, config, EmailService) {
    return function(request, reply) {
        var LogisticAgent = getLogisticAgentModel(database);
        LogisticAgent.createLogisticAgent(request.payload, function(err, result) {
            if(!err){
                var user = {
                    userId: result._id,
                    username: request.payload.email,
                    password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                    scope: 'LogisticAgent'
                };
                var User = getUserModel(database);
                User.createUser(user, function (err, user) {
                    var strError = 'Oops! Something went wrong. Unable to delete LogisticAgent Previous account during user creation failure';
                    if (!err) {
                        EmailService.sentMail(user, request.payload.email, config);
                        return reply(constants.successMessage); //HTTP 200
                    }
                    else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            strError = 'please provide another email, it already exist.';
                        }
                        LogisticAgent.removeLogisticAgent(result._id, function (err) {
                            if (err) {
                                    strError = 'Oops! Something went wrong. Unable to delete LogisticAgent Previous account during user creation failure';
                            }
                            logger.error({filePath: __filename}, {functionName: 'createLogisticAgent'}, strError);
                            reply(Boom.forbidden(strError)); //HTTP 403
                        });
                    }
                });
            }
            else {
                logger.error({filePath: __filename}, {functionName: 'createLogisticAgent'}, 'error in createLogisticAgent')
                return reply(err); // HTTP 403
            }
        });
    };
};

//to getLogistic Agent ById

/**
   GET: /getLogisticAgent
 */

exports.getLogisticAgent = function(database, config) {
    return function(request, reply) {
        var LogisticAgent = getLogisticAgentModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            LogisticAgent.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getLogisticAgent'}, 'No such Logistic Agent exist.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                     else {
                       reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getLogisticAgent'},  'error in getLogisticAgent');
                    reply(Boom.badImplementation(err)); //HTTP 500
                }
            });
        });

    };
};

//to get Logistic Agent By Zone 

/**
   GET: /getLogisticAgentByZone
 */

exports.getLogisticAgentByZone = function(database, config) {
    return function(request, reply) {
        var LogisticAgent = getLogisticAgentModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            LogisticAgent.getByZone(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getLogisticAgentByZone'}, 'No such Logistic Agent exist.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    reply(user); //HTTP 200
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getLogisticAgentByZone'}, 'error in getLogisticAgentByZone');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });

    };
};


//to Update Logistic Agent

/**
   PUT: /updateLogisticAgent by Logistic agent
   PUT: /updateLogisticAgent/{id} by Zone Manager
   Input: request.payload is the logistic agent data to update logistic agent
 */

exports.updateLogisticAgent = function(database, config) {
    return function(request, reply) {
        var LogisticAgent = getLogisticAgentModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'LogisticAgent') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            LogisticAgent.getById(userId, function(err, logisticAgent) {
                updateHelper(request.payload, logisticAgent);
                LogisticAgent.updateLogisticAgent(logisticAgent, function(err, logisticAgent) {
                    if (!err) {
                        reply(logisticAgent); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateLogisticAgent'}, 'please provide another logistic agent id, it already exist.');
                            reply(Boom.forbidden('please provide another logistic agent id, it already exist')); //HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateLogisticAgent'}, 'error in updateLogisticAgent');
                            reply(Boom.badImplementation(err)); //HTTP 500
                        }
                    }
                });
            });
        });
    };
};

