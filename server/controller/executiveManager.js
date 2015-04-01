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
    getExecutiveManagerModel = require('../model/executiveManager').getModel,
    getZoneManagerModel = require('../model/zoneManager').getModel,
    getLogisticAgentModel = require('../model/logisticAgent').getModel,
    getUserModel = require('../model/user').getModel,
    EncryptPwd = require('../Utility/thvcryptolib'),
    gravatar = require('gravatar'),
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

//create ExecutiveManager

/**
   POST: /createExecutiveManager
   Input: request.payload is the executive manager data to create executive manager
 */
exports.createExecutiveManager = function(database, config, EmailService) {
    return function(request, reply) {
        var ExecutiveManager = getExecutiveManagerModel(database);
        ExecutiveManager.createExecutiveManager(request.payload, function(err, result) {
            if(!err){
                var user = {
                    userId: result._id,
                    username: request.payload.email,
                    password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                    scope: 'ExecutiveManager'
                };
                var User = getUserModel(database);
                User.createUser(user, function (err, user) {
                    var strError = 'Oops! Something went wrong. Unable to delete ExecutiveManager Previous account during user creation failure';
                    if (!err) {
                        EmailService.sentMail(user, request.payload.email, config);
                        return reply(constants.successMessage);//HTTP 200 
                    }
                    else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            strError = 'please provide another email, it already exist.';
                        }
                        ExecutiveManager.removeExecutiveManager(result._id, function (err) {
                            if (err) {
                                    strError = 'Oops! Something went wrong. Unable to delete ExecutiveManager Previous account during user creation failure';
                            }
                            logger.error({filePath: __filename}, {functionName: 'createExecutiveManager'}, strError);
                            reply(Boom.forbidden(strError)); //HTTP 403
                        });
                    }
                });
            } else {
                logger.error('error in create executive manager');
                return reply(err); // HTTP 403
            }    
        });
    };
};

//get the ExecutiveManager By Id

/**
   GET: /getExecutiveManager
 */
exports.getExecutiveManager = function(database, config) {
    return function(request, reply) {
        var ExecutiveManager = getExecutiveManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            ExecutiveManager.getById(decoded.userId, function(err, executiveManager) {
                if (!err) {
                    if (executiveManager === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getExecutiveManager'}, 'No such Executive manager exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        reply(executiveManager); //HTTP 200 
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getExecutiveManager'}, 'error in get executiveManager');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });

    };
};

//to get the all ExecutiveManagerList

/**
   GET: /getExecutiveManagerList
 */
exports.getExecutiveManagerList = function(database) {
    return function(request, reply) {
        var ExecutiveManager = getExecutiveManagerModel(database);
        ExecutiveManager.getAllExecutiveManager(function(err, executiveManager) {
            if (!err) {
                if (executiveManager.length === 0) {
                    logger.error({filePath: __filename}, {functionName: 'getExecutiveManagerList'}, 'No such Executive manager exist.');
                    reply(Boom.notFound('Not Found')); // HTTP 404
                } else {
                    var result = [];
                    for (var i = 0; i < executiveManager.length; i++) {
                        var data = {};
                        if (executiveManager[i]._id !== 'undefined') {
                            data._id = executiveManager[i]._id;
                        }
                        if (executiveManager[i].prefix !== 'undefined') {
                            data.prefix = executiveManager[i].prefix;
                        }
                        if (executiveManager[i].firstname !== 'undefined') {
                            data.firstname = executiveManager[i].firstname;
                        }
                        if (executiveManager[i].lastname !== 'undefined') {
                            data.lastname = executiveManager[i].lastname;
                        }
                        if (executiveManager[i].email !== 'undefined') {
                            data.email = executiveManager[i].email;
                        }
                        if (executiveManager[i].phone !== 'undefined') {
                            data.phone = executiveManager[i].phone;
                        }
                        if (executiveManager[i].preferedLanguage !== 'undefined') {
                            data.preferedLanguage = executiveManager[i].preferedLanguage;
                        }
                        if (executiveManager[i].homeAddress !== 'undefined') {
                            data.homeAddress = executiveManager[i].homeAddress;
                        }
                        if (executiveManager[i].officeAddress !== 'undefined') {
                            data.officeAddress = executiveManager[i].officeAddress;
                        }
                        data.Imageurl = gravatar.url(executiveManager[i].email, {
                            s: '100',
                            r: 'pg',
                            d: '202'
                        });
                        result.push(data);
                    }
                    reply(result); //HTTP 200 
                }

            } else {
                logger.error({filePath: __filename}, {functionName: 'getExecutiveManagerList'}, 'error in get executiveManager list');
                reply(Boom.badImplementation(err)); // HTTP 500
            }
        });

    };
};

//to update ExecutiveManager

/**
   PUT: /updateExecutiveManager
   Input: request.payload is the executive manager data to update executive manager
 */
exports.updateExecutiveManager = function(database, config) {
    return function(request, reply) {
        var ExecutiveManager = getExecutiveManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            ExecutiveManager.getById(decoded.userId, function(err, executive) {
                updateHelper(request.payload, executive);
                ExecutiveManager.updateExecutiveManager(executive, function(err, executive) {
                    if (!err) {
                        return reply(executive); //HTTP 200
                    }
                    if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                        logger.warn({filePath: __filename}, {functionName: 'getExecutiveManagerList'}, 'please provide another executive id, it already exist.');
                        reply(Boom.forbidden('please provide executive admin id, it already exist')); // HTTP 403
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'updateExecutiveManager'}, 'error in update executiveManager');
                        reply(Boom.forbidden(err)); //HTTP 403
                    }

                });
            });
        });
    };
};


//to get all Logistic Agent and ZoneManager list created By ExecutiveManager

/**
   GET: /getAllLogisticAgentZoneManager
 */

exports.getAllLogisticAgentZoneManager = function(database) {
    return function(request, reply) {
        var LogisticAgent = getLogisticAgentModel(database),
            ZoneManager = getZoneManagerModel(database);
            LogisticAgent.getAllLogisticAgent(function(err, logisticAgent) {
            ZoneManager.getAllZoneManager(function(err, zoneManager) {
                if(!err){
                        var result = [];
                        for (var i = 0; i < logisticAgent.length; i++) {
                        var data = {};
                        if (logisticAgent[i]._id !== undefined) {
                            data._id = logisticAgent[i]._id;
                        }
                        if (logisticAgent[i].prefix !== undefined) {
                            data.prefix = logisticAgent[i].prefix;
                        }
                        if (logisticAgent[i].firstname !== undefined) {
                            data.firstname = logisticAgent[i].firstname;
                        }
                        if (logisticAgent[i].lastname !== undefined) {
                            data.lastname = logisticAgent[i].lastname;
                        }
                        if (logisticAgent[i].email !== undefined) {
                            data.email = logisticAgent[i].email;
                        }
                        if (logisticAgent[i].phone !== undefined) {
                            data.phone = logisticAgent[i].phone;
                        }
                        if (logisticAgent[i].preferedLanguage !== undefined) {
                            data.preferedLanguage = logisticAgent[i].preferedLanguage;
                        }
                        if (logisticAgent[i].homeAddress !== undefined) {
                            data.homeAddress = logisticAgent[i].homeAddress;
                        }
                        if (logisticAgent[i].officeAddress !== undefined) {
                            data.officeAddress = logisticAgent[i].officeAddress;
                        }
                        data.Imageurl = gravatar.url(logisticAgent[i].email, {
                            s: '100',
                            r: 'pg',
                            d: '202'
                        });
                        data.title = 'Logistic Agent';
                        result.push(data);
                        }

                        for (var j = 0; j < zoneManager.length; j++) {
                            var zoneData = {};
                            if (zoneManager[j]._id !== undefined) {
                                zoneData._id = zoneManager[j]._id;
                            }
                            if (zoneManager[j].prefix !== undefined) {
                                zoneData.prefix = zoneManager[j].prefix;
                            }
                            if (zoneManager[j].firstname !== undefined) {
                                zoneData.firstname = zoneManager[j].firstname;
                            }
                            if (zoneManager[j].lastname !== undefined) {
                                zoneData.lastname = zoneManager[j].lastname;
                            }
                            if (zoneManager[j].email !== undefined) {
                                zoneData.email = zoneManager[j].email;
                            }
                            if (zoneManager[j].phone !== undefined) {
                                zoneData.phone = zoneManager[j].phone;
                            }
                            if (zoneManager[j].preferedLanguage !== undefined) {
                                zoneData.preferedLanguage = zoneManager[j].preferedLanguage;
                            }
                            if (zoneManager[j].homeAddress !== undefined) {
                                zoneData.homeAddress = zoneManager[j].homeAddress;
                            }
                            if (zoneManager[j].officeAddress !== undefined) {
                                zoneData.officeAddress = zoneManager[j].officeAddress;
                            }
                            zoneData.Imageurl = gravatar.url(zoneManager[j].email, {
                                s: '100',
                                r: 'pg',
                                d: '202'
                            });
                            zoneData.title = 'Zone Manager';
                            result.push(zoneData);
                    }

                    if(result.length === 0 ){
                        logger.error({filePath: __filename}, {functionName: 'getAllLogisticAgentZoneManager'}, 'No such Executive manager exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        return reply(result); //HTTP 200
                    }
                }
                
            });
        });
    };
}; 
