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
    getUserModel = require('../model/user').getModel,
    Jwt = require('jsonwebtoken'),
    EncryptPwd = require('../Utility/thvcryptolib'),
    logger = require('../config/logger').logger;

// to resend password to User

/**
   POST: /forgetPassword
 */

exports.resendPassword = function(database, config, EmailService) {
    return function(request, reply) {
        var User = getUserModel(database);
        User.getByUserName(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) {
                    logger.warn({filePath: __filename}, {functionName: 'resendPassword'}, 'Invalid User Name ');
                    return reply(Boom.forbidden('Invalid User Name')); // HTTP 403
                } else {
                    EmailService.sentPasswordMail(user.username, user.password, config);
                    return reply('Password is Successfully sent to an email address'); // HTTP 200
                }
            } else {
                logger.error({filePath: __filename}, {functionName: 'resendPassword'}, 'error in resend password');
                reply(Boom.badImplementation('Oops! something went wrong')); // HTTP 500
            }
        });
    };
};


// to update password

/**
   PUT: /changePassword
   Input: request.payload is the new password and old password to update password for a user
 */

exports.update = function(database, config) {
    return function(request, reply) {
        var User = getUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            User.getByUserName(decoded.username, function(err, user) {
                if (!err) {
                    if (request.payload.oldpassword === EncryptPwd.decrypt(user.password, config)) {
                        user.password = EncryptPwd.encrypt(request.payload.newpassword, config);
                        User.updateUser(user, function(err) {
                            if (!err) {
                                return reply('password Successfully updated'); // HTTP 200
                            } else {
                                logger.error({filePath: __filename}, {functionName: 'update'}, err);
                                return reply(Boom.badImplementation(err)); // HTTP 403
                            }
                        });
                    } else {
                        logger.warn({filePath: __filename}, {functionName: 'update'}, 'Invalid old password entered');
                        return reply(Boom.forbidden('Invalid old password entered')); //HTTP 403
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'update'}, 'error in update password');
                    return reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };
};

