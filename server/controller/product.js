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
    getProductModel = require('../model/product').getModel,
    getExecutiveManagerModel = require('../model/executiveManager').getModel,
    logger = require('../config/logger').logger,
    Helper = require('../Utility/helper'),
    fs = require('fs'),
    constants = require('../Utility/constants').constants;

/** image upload function */
var imageSave = function(data, name) {
    var newPath1;
    var imgextnsn;
    var logo;
    var imageName = name + new Date().getTime() + Math.floor((Math.random() * 100) + 1);
    var newPath = dirname + '/../../upload';
    var logoPath = newPath + '/ProductImages';
    if (data) {
        logo = data;
        var re = /^data:image\/(\w+);base64,/;
        var res = logo.match(re);
        imgextnsn = '.' + res[1];
        fs.exists(newPath, function(exists) {
            if (exists === false) {
                fs.mkdirSync(newPath);
            }
            fs.exists(logoPath, function(logoexists) {
                if (logoexists === false) {
                    fs.mkdirSync(logoPath);
                }
                newPath1 = logoPath + '/' + imageName + imgextnsn;
                logo = logo.replace(re, '');
                fs.writeFile(newPath1, logo, 'base64', function() {});
            });
        });
        data = imageName + imgextnsn;
        return data;
    }
};

//to get Product by Id

/**
   GET: /getProduct/{id}
 */

exports.getProduct = function(database) {
    return function(request, reply) {
        var Product = getProductModel(database);
        Product.getById(request.params.id, function(err, product) {
            if (!err) {
                if (product === null) {
                    logger.warn({filePath: __filename}, {functionName: 'getProduct'}, 'Product not found.');
                    reply(Boom.notFound('Not Found')); //HTTP 404
                }
                else{
                    reply(product); //HTTP 200
                }
            } else {
                logger.error({filePath: __filename}, {functionName: 'getProduct'}, 'error in get product');
                reply(Boom.badImplementation(err)); // 500 error
            }
        });
    };
};

//to update Product By Id

/**
   PUT: /updateProduct/{id}
   Input: request.payload is the product data to be updated
 */

exports.updateProduct = function(database, config, EmailService) {
    return function(request, reply) {
        var Product = getProductModel(database);
        var ExecutiveManager = getExecutiveManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Product.getById(request.params.id, function(err, product) {
                if (request.payload.images) {
                    for (var i = 0; i < request.payload.images.length; i++) {
                        request.payload.images[i] = imageSave(request.payload.images[i], request.payload.name);
                    }
                }

                Helper.updateHelper(request.payload, product);
                Product.updateProduct(product, function(err, product) {
                    if (!err) {
                        if (product.retailPrice && product.costPrice) {
                            var emailList;
                            ExecutiveManager.getAllEmail(function(error, results) {
                                for (var i = 0; i < results.length; i++) {
                                    if (emailList) {
                                        emailList = emailList + ', ' + results[i].email;
                                    } else {
                                        emailList = results[i].email;
                                    }
                                }
                                if (emailList === null) {
                                    logger.warn({filePath: __filename}, {functionName: 'updateProduct'}, 'There is no executive manager email id found.');
                                    return reply(Boom.notFound('There is no executive manager email id found.')); //HTTP 404
                                } else {
                                    if(product.costPrice > product.retailPrice){
                                        EmailService.sentProductMail(request.payload, emailList, config);
                                    }                                    
                                    return reply(constants.successMessage); //HTTP 200
                                }
                            });
                        }
                        return reply(product);
                    } else {
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateProduct'}, 'please provide another product id, it already exist.');
                            reply(Boom.forbidden('please provide another product id, it already exist')); //HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateProduct'}, 'error in update product');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    }
                });
            });
        });
    };
};

//to create Product 

/**
   POST: /createProduct
   Input: request.payload is the product data to be created
 */

exports.createProduct = function(database, config, EmailService) {
    return function(request, reply) {
        var Product = getProductModel(database);
        var ExecutiveManager = getExecutiveManagerModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            request.payload.zones = [decoded.userId];
            if (request.payload.images) {
                for (var i = 0; i < request.payload.images.length; i++) {
                    request.payload.images[i] = imageSave(request.payload.images[i], request.payload.name);
                }
            }

            Product.createProduct(request.payload, function(err, product) {
                if (!err) {
                    if (product.retailPrice && product.costPrice) {
                        var emailList;
                        ExecutiveManager.getAllEmailExecutiveManager(function(error, results) { 
                            if(!error){
                                if(results === null){
                                    logger.warn({filePath: __filename}, {functionName: 'createProduct'}, 'Unable to create product.');
                                    return reply(Boom.forbidden('Unable to create product.')); // HTTP 200
                                }
                                else {
                                    for (var i = 0; i < results.length; i++) {
                                        if (emailList) {
                                            emailList = emailList + ', ' + results[i].email;
                                        } else {
                                            emailList = results[i].email;
                                        }
                                    }
                                    if (emailList === null) {
                                        logger.warn({filePath: __filename}, {functionName: 'createProduct'}, 'There is no executive manager email id found.');
                                        return reply(Boom.notFound('There is no executive manager email id found.')); //HTTP 404
                                    } else {
                                        if(product.costPrice > product.retailPrice){
                                            EmailService.sentProductMail(request.payload, emailList, config); 
                                        }                                        
                                        return reply(constants.successMessage); //HTTP 200
                                    }
                                }
                            } 
                            else {
                                Product.removeById(product._id, function(err){
                                    if (err) {
                                        logger.error({filePath: __filename}, {functionName: 'createProduct'}, 'oops, something went wrong.');
                                        return reply(Boom.notFound('oops, something went wrong.')); // HTTP 404
                                    } else {
                                        logger.warn({filePath: __filename}, {functionName: 'createProduct'}, 'Unable to create product.');
                                        return reply(Boom.forbidden('Unable to create product.')); // HTTP 200
                                    }
                                });
                            }

                        });
                    }
                    else {
                        return reply(Boom.forbidden("Invalid request")); // HTTP 403
                    }
                } else {
                    if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                        logger.warn({filePath: __filename}, {functionName: 'createProduct'}, 'please provide another product id, it already exist.');
                        return reply(Boom.forbidden('please provide another product id, it already exist')); //HTTP 403
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'createProduct'}, 'error in create product');
                        return reply(Boom.forbidden(err)); // HTTP 403
                    }
                }
            });
        });
    };
};

//to remove Product

/**
   DELETE: /removeProduct/{id}
 */

exports.removeProduct = function(database) {
    return function(request, reply) {
        var Product = getProductModel(database);
        Product.removeById(request.params.id, function(err){
            if (err) {
                logger.error({filePath: __filename}, {functionName: 'removeProduct'}, 'oops, something went wrong.');
                return reply(Boom.notFound('oops, something went wrong.')); // HTTP 404
            } else {
                return reply('Product removed successfully'); // HTTP 200
            }
        });
    };
};

//to get All Product List

/**
   GET: /getProductList
 */

exports.getProductList = function(database) {
    return function(request, reply) {
        var Product = getProductModel(database);
        Product.getAllProduct(function(err, product) {
            if (!err) {
                if (product === null) {
                    logger.warn({filePath: __filename}, {functionName: 'getProductList'}, 'Product not found.');
                    reply(Boom.notFound('Not Found')); // HTTP 404
                }
                reply(product); // HTTP 200
            } else {
                logger.error({filePath: __filename}, {functionName: 'getProductList'}, 'error in get product list');
                reply(Boom.badImplementation(err)); // HTTP 500
            }
        });
    };
};