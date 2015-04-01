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
    getSupplierModel = require('../model/supplier').getModel,
    getSupplierManagerModel = require('../model/supplierManager').getModel,
    getSupplierUserModel = require('../model/supplierUser').getModel,
    getUserModel = require('../model/user').getModel,
    Async = require('async'),
    Helper = require('../Utility/helper'),
    EncryptPwd = require('../Utility/thvcryptolib'),
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;

//to create Supplier

/**
   POST: /createSupplier
   Input: request.payload is the supplier data to create supplier
 */

exports.createSupplier = function(database, config, EmailService) {
    return function(request, reply) {
        var User = getUserModel(database),
           Supplier = getSupplierModel(database),
           SupplierManager = getSupplierManagerModel(database),
           SupplierUser = getSupplierUserModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            request.payload.supplier.zones = [];
            request.payload.supplier.zones.push(decoded.userId);
            Async.waterfall([
                    function(callback) {
                        Supplier.createSupplier(request.payload.supplier, function(err, result) {
                            callback(err, result);
                        });
                    },
                    function(arg1, callback) {
                        if (arg1._id !== undefined) {
                            request.payload.supplierManager.supplier = arg1._id;

                            createSupplier(SupplierManager, request.payload.supplierManager, callback);

                        } else {
                            logger.warn({filePath: __filename}, {functionName: 'createSupplier'}, 'unable to create supplier'); 
                            return reply(Boom.forbidden('unable to create supplier')); // HTTP 403
                        }

                    },

                    function(arg1, callback) {
                        if (arg1._id !== undefined) {
                            var user = {
                                userId: arg1._id,
                                username: arg1.email,
                                password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                                scope: 'SupplierManager'
                            };

                            createSupplierManager(User, user, callback);

                        } else {
                            logger.warn({filePath: __filename}, {functionName: 'createSupplier'}, 'unable to create supplier');
                            return reply(Boom.forbidden('unable to create supplier')); // HTTP 403
                        }

                    },

                ],
                //executes after all the async function is success.
                function(err, results) {
                    if (results) {
                        EmailService.sentMail(results, results.username, config);
                        Async.each(request.payload.supplierUser, function(supplierUser, callback) {
                            supplierUser.supplier = request.payload.supplierManager.supplier;

                            createSupplierUser(SupplierUser, User, config, supplierUser, EmailService, reply, callback);

                        }, function(err) {

                            createSupplierUserResponse(err, reply);
                            
                        });
                    } else {

                        handleRollback(err, Supplier, SupplierManager, request, reply);

                    }
                });


        });
    };
};

function createSupplier(SupplierManager, request, callback){
    SupplierManager.createSupplierManager(request, function(err, result) {
        if (err) {
            err.collection = 'supplier';
        }
        callback(err, result);
    });
}

function createSupplierManager(User, user, callback){
    User.createUser(user, function(err, result) {
        if (err) {
            err.collection = 'supplier supplierManager';
            err.supplierManagerId = user.userId;
        }

        callback(err, result);
    });
}

function createSupplierUser(SupplierUser, User, config, supplierUser, EmailService, reply, callback){
    SupplierUser.createSupplierUser(supplierUser, function(err, result) {
        if (err) {
            callback(err, result);
        } else {
            var user = {
                userId: result._id,
                username: result.email,
                password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                scope: 'SupplierUser'
            };

            User.createUser(user, function(err, result) {

                if (!err) {
                    EmailService.sentMail(result, result.username, config);
                    return reply(constants.successMessage); //HTTP 200
                } else {
                    callback(err, result);
                }
            });

        }
    });
}

function  handleRollback(err, Supplier, SupplierManager, request, reply){
    if (err.collection === 'supplier') {
        Supplier.removeSupplier(request.payload.supplierManager.supplier, function() {
            if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                logger.warn({filePath: __filename}, {functionName: 'handleRollback'}, 'please provide another email, it already exist.');
                reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403
            } else {
                logger.error({filePath: __filename}, {functionName: 'handleRollback'}, 'error in handling Rollback');
                return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
            }
        });
    } else if (err.collection === 'supplier supplierManager') {
        SupplierManager.removeSupplierManager(err.supplierManagerId, function() {
            Supplier.removeSupplier(request.payload.supplierManager.supplier, function() {
                if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                    logger.warn({filePath: __filename}, {functionName: 'handleRollback'}, 'please provide another email, it already exist.');
                    reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403
                } else {
                    logger.error({filePath: __filename}, {functionName: 'handleRollback'}, 'error in handling Rollback');
                    return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
                }
            });

        });
    }
}

function createSupplierUserResponse(err, reply){
    if (err) {
        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
            logger.warn({filePath: __filename}, {functionName: 'createSupplierUserResponse'}, 'please provide another email, it already exist.');
            reply(Boom.forbidden('please provide another email, it already exist')); // HTTP 403
        } else {
            logger.error({filePath: __filename}, {functionName: 'createSupplierUserResponse'}, 'error in create supplier user');
            return reply(Boom.methodNotAllowed('Oops! something went wrong')); // HTTP 405
        }
    } else {
        return reply(constants.successMessage); // HTTP 200
    }
}


//to get All Supplier

/**
   GET: /getAllSupplier
 */

exports.getAllSupplier = function(database, config) {
    return function(request, reply) {
        var Supplier = getSupplierModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Supplier.getSupplierByZone(decoded.userId, function(err, supplier) {
                if (!err) {
                    if (supplier.length === 0) {
                        logger.warn({filePath: __filename}, {functionName: 'getAllSupplier'}, 'No such Zone exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        return reply(supplier); // HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getAllSupplier'}, 'error in get all supplier');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };
};

//to get Supplier By Id

/**
   GET: /getSupplierbyId/{id}
 */

exports.getSupplierById = function(database, config) {
    return function(request, reply) {
        var Supplier = getSupplierModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Supplier.getById(request.params.id, function(err, supplier) {
                if (!err) {
                    if (supplier === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getSupplierById'}, 'No such Zone exist.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        return reply(supplier); // HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getSupplierById'}, 'error in get supplier by id');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });
    };
};

//to Update Supplier

/**
   PUT: /updateSupplier/{id} by Zone Manager
   PUT: //updateSupplier by Supplier Manager
   Input: request.payload is the supplier data to update supplier
 */

exports.updateSupplier = function(database, config) {
    return function(request, reply) {
        var Supplier = getSupplierModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'SupplierManager') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }
            Supplier.getById(userId, function(err, supplier) {
                Helper.updateHelper(request.payload, supplier);
                Supplier.updateSupplier(supplier, function(err, supplier) {
                    if (!err) {
                        reply(supplier); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateSupplier'}, 'please provide another supplier id, it already exist.');
                            reply(Boom.forbidden('please provide another supplier id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateSupplier'}, 'error in update supplier');
                            reply(Boom.badImplementation(err)); // HTTP 500
                        }
                    }
                });
            });
        });
    };
};

// to get Supplier,supplierManager and SupplierUser details

/**
   GET: /getSupplier/{id}
 */

exports.getSupplier = function(database) {
    return function(request, reply) {
        var SupplierManagerModel = getSupplierManagerModel(database);
        var SupplierModel = getSupplierModel(database);
        var SupplierUserModel = getSupplierUserModel(database);
        SupplierModel.getById(request.params.id, function(err, supplier) {
            SupplierManagerModel.getBySupplier(request.params.id, function(err, suppliermanager) {
                SupplierUserModel.getBySupplier(request.params.id, function(err, supplieruser) {
                    var result = [];
                    var data = {};
                    data.supplier = supplier;
                    data.supplierManager = suppliermanager;
                    data.supplieruser = supplieruser;
                    result.push(data);
                    return reply(result); // HTTP 200
                });
            });
        });
    };
};