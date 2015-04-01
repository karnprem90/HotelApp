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
var getSupplierUserModel = require('../model/supplierUser').getModel,
    Jwt = require('jsonwebtoken'),
    Helper = require('../Utility/helper'),
    Boom = require('boom'),
    logger = require('../config/logger').logger;



//to get Supplier User By Id

/**
   GET: /getSupplierUser
 */

exports.getSupplierUser = function(database, config) {
    return function(request, reply) {
        var SupplierUser = getSupplierUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            SupplierUser.getByIdBasic(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getSupplierUser'}, 'No such Supplier User exist.');
                        reply(Boom.notFound('Not Found'));  //HTTP 404
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.warn({filePath: __filename}, {functionName: 'getSupplierUser'}, 'error in get supplier user');
                    reply(Boom.badImplementation(err)); //HTTP 500
                }
            });
        });
    };
};

// to update Supplier User 

/**
   PUT: /updateSupplierUser/{id} by Zone Manager
   PUT: /updateSupplierUser by Supplier User
   Input: request.payload is the supplier user data to update supplier user
 */

exports.updateSupplierUser = function(database, config) {
    return function(request, reply) {
        var SupplierUser = getSupplierUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'SupplierUser') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            SupplierUser.getByIdBasic(userId, function(err, supplierUser) {
                if (supplierUser === null) {
                    logger.error({filePath: __filename}, {functionName: 'updateSupplierUser'}, 'No such account exist');
                    return reply(Boom.forbidden('No such account exist')); //HTTP 403
                }
                Helper.updateHelper(request.payload, supplierUser);
                SupplierUser.updateSupplierUser(supplierUser, function(err, supplierUser) {
                    if (!err) {
                        reply(supplierUser); //HTTP 200
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'updateSupplierUser'}, 'error in update supplier user');
                        reply(Boom.forbidden(err)); // HTTP 403
                    }
                });
            });
        });
    };
};