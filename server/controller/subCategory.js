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
    getSubCategoryModel = require('../model/SubCategory').getModel,
    logger = require('../config/logger').logger,
    constants = require('../Utility/constants').constants;


//to create SubCategory

/**
   POST: /createSubCategory
   Input: request.payload is the sub category data to create sub category
 */

exports.createSubCategory = function(database) {
    return function(request, reply) {
        var SubCategory = getSubCategoryModel(database);
        request.payload.isActive = true;
        SubCategory.createSubCategory(request.payload, function(err, result) {
            if (err) {
                logger.error({filePath: __filename}, {functionName: 'createSubCategory'}, 'Error in createSubCategory'); //HTTP 500
                return reply(err);
            } 

            else{
                reply(result); //HTTP 200
            }
        });
    };
};

//to Sub Category By Id

/**
   GET: /getSubCategorybyId/{id}
 */

exports.getSubCategorybyId = function(database, config) {
    return function(request, reply) {
        var SubCategory = getSubCategoryModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            SubCategory.getById(request.params.id, function(err, category) {
                if (!err) {
                    if (category === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getSubCategorybyId'}, 'User not found.');
                        reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    else{
                        reply(category); // HTTP 200
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getSubCategorybyId'}, 'Error in getting SubCategory');
                    reply(Boom.badImplementation(err)); // HTTP 500
                }
            });
        });

    };
};


//to Get All subCategory By Category Id

/**
   GET: /getAllSubCategorybyCategoryId/{id}
 */

exports.getAllSubCategorybyCategoryId = function(database) {
    return function(request, reply) {
        var SubCategory = getSubCategoryModel(database);
        // Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
        SubCategory.getByCategory(request.params.id, function(err, category) {
            if (!err) {
                if (category === null) {
                    logger.warn({filePath: __filename}, {functionName: 'getAllSubCategorybyCategoryId'}, 'User not found.');
                    reply(Boom.notFound('Not Found')); // HTTP 404
                }
                else{
                    reply(category); // HTTP 200
                }
            } else {
                logger.error({filePath: __filename}, {functionName: 'getAllSubCategorybyCategoryId'}, 'Error in geting getByCategory');
                reply(Boom.badImplementation(err)); // HTTP 500
            }
        });
        // });

    };
};

/**
   PUT: /updateSubCategorybyId/{id}
   Input: request.payload is the sub category data to update sub category
 */

exports.updateSubCategorybyId = function(database, config) {
    return function(request, reply) {
        var SubCategory = getSubCategoryModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            SubCategory.getById(request.params.id, function(err, subcategory) {
                if (!err) {
                    if (subcategory === null) {
                        logger.warn({filePath: __filename}, {functionName: 'updateSubCategorybyId'}, 'SubCategory not found.');
                        return reply(Boom.notFound('Not Found')); // HTTP 404
                    }
                    subcategory.isActive = false;
                    SubCategory.updateSubCategory(subcategory, function(err, subcategory) {
                        if (!err) {
                            return reply(subcategory); // HTTP 200
                        }
                        if (constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code) {
                            logger.warn({filePath: __filename}, {functionName: 'updateSubCategorybyId'}, 'please provide another subcategory id, it already exist.');
                            reply(Boom.forbidden('please provide subcategory id, it already exist')); // HTTP 403
                        } else {
                            logger.error({filePath: __filename}, {functionName: 'updateSubCategorybyId'}, 'error in updateSubCategorybyId');
                            reply(Boom.forbidden(err)); // HTTP 403
                        }
                    });
                }
            });
        });
    };
};
