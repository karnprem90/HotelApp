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
    getAdministratorModel = require('../model/administrator').getModel,
    getUserModel = require('../model/user').getModel,
    Helper = require('../Utility/helper'),
    EncryptPwd = require('../Utility/thvcryptolib'),
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;


//create Admin

/**
   POST: /createAdmin
   Input: request.payload is the data to create Admin
 */
exports.createAdmin = function(database, config, EmailService) {
    return function(request, reply) {
        var User = getUserModel(database);
        User.getByScope('Admin', function(err, user) {
            if (!err) {
                if (user.length > 0) {
                    logger.warn({filePath: __filename}, {functionName: 'createAdmin'}, 'You are unauthorized to perform this operation.');
                    return reply(Boom.forbidden('You are unauthorized to perform this operation')); // HTTP 403
                } else {
                    var admin = {
                        alertEmail: request.payload.alertEmail,
                        alertPhone: request.payload.alertPhone
                    };
                    var Administrator = getAdministratorModel(database);
                    Administrator.createAdmin(admin, function(err, result) {
                        if(!err){
                            request.payload.userId = result._id;
                            request.payload.scope = 'Admin';
                            request.payload.password = EncryptPwd.encrypt(request.payload.password, config);
                            User.createUser(request.payload, function (err, user) {
                                var strError;
                                if (!err) {
                                    EmailService.sentMail(user, request.payload.username, config);
                                    return reply(constants.successMessage); // HTTP 200
                                }
                                else {
                                    if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                                        strError = 'please provide another email, it already exist.';
                                    }
                                    Administrator.removeAdmin(result._id, function (error) {
                                        if (error) {
                                                strError = 'Oops! Something went wrong. Unable to delete Administrator Previous account during user creation failure';
                                        }
                                        if(strError){
                                            logger.error({filePath: __filename}, {functionName: 'createAdmin'}, strError);
                                            reply(Boom.forbidden(strError)); // HTTP 403
                                        }
                                        else{
                                            logger.error({filePath: __filename}, {functionName: 'createAdmin'}, 'error in admin creation');
                                            reply(Boom.forbidden(err)); // HTTP 403
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            logger.error({filePath: __filename}, {functionName: 'createAdmin'}, 'error in admin creation');
                            return reply(Boom.forbidden(err)); // HTTP 403
                        }
                    });
                }
            } else {
                logger.error({filePath: __filename}, {functionName: 'createAdmin'}, 'Oops! Something went wrong. Please try again later.');
                reply(Boom.badImplementation('Oops! Something went wrong. Please try again later')); // HTTP 500
            }
        });
    };
};

//to get the All Admin List

/**
   GET: /getAdmin
 */
exports.getAdmin = function(database, config){
    return function (request, reply) {
        var Administrator = getAdministratorModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Administrator.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.error({filePath: __filename}, {functionName: 'getAdmin'}, 'User not found.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        return reply(user); // HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getAdmin'}, 'error in get admin');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });

    };
};

//to update Admin

/**
   PUT: /updateAdmin
   Input: request.payload is the data to be update admin
 */
exports.updateAdmin = function(database, config) {
    return function (request, reply) {
        var Administrator = getAdministratorModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Administrator.getById(decoded.userId, function(err, admin) {
                Helper.updateHelper(request.payload, admin);
                Administrator.updateAdmin(admin, function(err, administrator) {
                    if (!err) {
                        reply(administrator); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateAdmin'}, 'please provide another admin id, it already exist.');
                            reply(Boom.forbidden('please provide another admin id, it already exist'));// HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateAdmin'}, 'error in update admin');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};
