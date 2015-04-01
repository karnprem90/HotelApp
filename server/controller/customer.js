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
    getCustomerModel = require('../model/customer').getModel,
    EncryptPwd = require('../Utility/thvcryptolib'),
    getUserModel = require('../model/user').getModel,
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;
    

var updateHelper = function(requestData, originalData) {
    for (var req in requestData) {
        if (requestData[req] === ' ') {
            originalData[req] = ' ';
        } else {
            if (req === 'address') {
                for (var req1 in requestData[req]) {
                    if(requestData[req][req1] !== undefined){
                        originalData[req][req1] = requestData[req][req1];
                    }
                }
            } else if (req === 'currentStay') {
                console.log('request is currentStay');
            } else {
                originalData[req] = requestData[req];
            }

        }
    }
};

//to Create Customer

/**
   POST: /createCustomer
   Input: request.payload is the customer data to create customer
 */
exports.createCustomer = function(database, config, EmailService) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Customer.createCustomer(request.payload, function(err, result) {
            if(!err){
                    var user = {
                        userId: result._id,
                        username: result.email,
                        password: EncryptPwd.encrypt(Math.random().toString(36).substring(7), config),
                        scope: 'Customer'
                    };
                    var User = getUserModel(database);
                    User.createUser(user, function (err, user) {
                        var strError = 'Oops! Something went wrong. Unable to delete Customer Previous account during user creation failure';
                        if (!err) {
                            EmailService.sentMail(user, request.payload.email, config);
                            return reply(constants.successMessage); //HTTP 200
                        }
                        else {
                            if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                                strError = 'please provide another email, it already exist.';
                            }
                            Customer.removeCustomer(result._id, function (err) {
                                if (err) {
                                        strError = 'Oops! Something went wrong. Unable to delete Customer Previous account during user creation failure';
                                }
                                logger.error({filePath: __filename}, {functionName: 'createCustomer'}, strError);
                                reply(Boom.forbidden(strError)); //HTTP 403
                            });
                        }
                    });
            }
            else  {
                logger.error({filePath: __filename}, {functionName: 'createCustomer'}, 'error in customer creation');
                return reply(err);
            } // HTTP 403
           
        });
    };
};

//to get Customer By Id

/**
   GET: /getCustomer
 */
exports.getCustomer = function(database, config) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Customer.getById(decoded.userId, function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getCustomer'}, 'User not found.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    else{
                        reply(user); //HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getCustomer'}, 'error in get customer');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });
    };
};

//get all customer created by Hotel Manager and Hotel User

/**
   GET: /getAllCustomer
 */
exports.getAllCustomer = function(database, config) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Customer.getAllCustomer(function(err, user) {
                if (!err) {
                    if (user === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getAllCustomer'}, 'User not found.'); 
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    else{
                        reply(user);//HTTP 200
                    } 
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getAllCustomer'}, 'error in get all customer');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });

    };
};

// to update Customer

/**
   PUT: /updateCustomer by Customer
   PUT: //updateCustomer/{id} by Zone Manager
   Input: request.payload is the customer data to create customer
 */
exports.updateCustomer = function(database, config) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var userId;
            if (decoded.scope[0] === 'Customer') {
                userId = decoded.userId;
            } else {
                userId = request.params.id;
            }

            Customer.getById(userId, function(err, customer) {
                updateHelper(request.payload, customer);
                Customer.updateCustomer(customer, function(err, customer) {
                    if (!err) {
                        reply(customer); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateCustomer'}, 'please provide another customer id, it already exist.');
                            reply(Boom.forbidden('please provide another customer id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateCustomer'}, 'error in update customer');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};

// to checkin Customer

/**
   POST: /checkinCustomer
   Input: request.payload is the data to update customer ( add checkin information )
 */
exports.checkinCustomer = function(database, config) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Customer.getById(request.payload.customerId, function(err, customer) {
                if (customer === null) {
                    logger.warn({filePath: __filename}, {functionName: 'checkinCustomer'}, 'No such customer exist.');
                    return reply(Boom.forbidden('No such customer exist')); // HTTP 403
                }

                customer.currentStay.stayStartDate = new Date();
                customer.currentStay.zoneId = decoded.zone;
                customer.currentStay.hotelId = decoded.hotel;
                customer.currentStay.expectedStayEndDate = request.payload.expectedStayEndDate;
                customer.currentStay.room = request.payload.room;

                updateHelper(request.payload, customer);

                Customer.update(customer, function(err, customer) {
                    if (!err) {
                        reply(customer); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'checkinCustomer'}, 'please provide another customer id, it already exist.');
                            reply(Boom.forbidden('please provide another customer id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'checkinCustomer'}, 'error in checkin customer');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};
//to checkOut Customer

/**
   POST: /checkoutCustomer
 */
exports.checkoutCustomer = function(database, config) {
    return function(request, reply) {
        var Customer = getCustomerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Customer.getById(request.payload.customerId, function(err, customer) {
                if (customer === null) {
                    logger.warn({filePath: __filename}, {functionName: 'checkoutCustomer'}, 'No such customer exist.');
                    return reply(Boom.forbidden('No such customer exist')); // HTTP 403
                }


                var history = {
                    stayStartDate: customer.stayStartDate,
                    stayEndDate: new Date(),
                    zoneId: decoded.zone,
                    hotelId: decoded.hotel,
                    room: customer.currentStay.room
                };

                customer.history.push(history);

                customer.currentStay.stayStartDate = undefined;

                customer.currentStay.expectedStayEndDate = undefined;

                customer.currentStay.zoneId = undefined;

                customer.currentStay.hotelId = undefined;

                customer.currentStay.room = undefined;

                if (customer.currentStay.cart !== undefined) {
                    customer.currentStay.cart = undefined;
                }

                Customer.update(customer, function(err, customer) {
                    if (!err) {
                        reply(customer); // HTTP 200
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'checkoutCustomer'}, 'please provide another customer id, it already exist');
                            reply(Boom.forbidden('please provide another customer id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'checkoutCustomer'}, 'please provide another customer id, it already exist');
                            reply(Boom.forbidden(err)); // HTTP 403
                        } 
                    }
                });
            });
        });
    };
};
