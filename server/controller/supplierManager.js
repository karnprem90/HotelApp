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
var getSupplierManagerModel = require('../model/supplierManager').getModel,
    Jwt = require('jsonwebtoken'),
    Helper = require('../Utility/helper'),
    Boom = require('boom'),
    logger = require('../config/logger').logger;


//to get Supplier Manager By Id

/**
   GET: /getSupplierManager
 */

exports.getSupplierManager = function(database, config) {
    return function(request, reply) {
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var SupplierManager = getSupplierManagerModel(database);
            SupplierManager.getByIdBasic(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getSupplierManager'}, 'No such Supplier exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getSupplierManager'}, 'error in get supplier manager');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };
};

//to update Supplier Manager

/**
   PUT: /updateSupplierManager by Supplier Manager
   PUT: /updateSupplierManager/{id} by Zone Manager
   Input: request.payload is the supplier manager data to update supplier manager
 */


exports.updateSupplierManager = function(database, config) {
    return function(request, reply) {
        var SupplierManager = getSupplierManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'SupplierManager') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            SupplierManager.getByIdBasic(userId, function(err, supplierManager) {
                if (supplierManager === null) {
                    logger.error({filePath: __filename}, {functionName: 'updateSupplierManager'}, 'No such account exist');
                    return reply(Boom.forbidden('No such account exist')); //HTTP 403
                }
                Helper.updateHelper(request.payload, supplierManager);
                SupplierManager.updateSupplierManager(supplierManager, function(err, supplierManager) {
                    if (!err) {
                        reply(supplierManager); //HTTP 200
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'updateSupplierManager'}, 'error in update supplier manager');
                        reply(Boom.forbidden(err)); // HTTP 403

                    }
                });
            });
        });
    };
};
