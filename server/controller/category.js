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
    getCategoryModel = require('../model/category').getModel,
    logger = require('../config/logger').logger;


//to createCategory

/**
   POST: /createCategory
   Input: request.payload is the category data to create category
 */
exports.createCategory = function(database) {
    return function(request, reply) {
        var Category = getCategoryModel(database);
        Category.createCategory(request.payload, function(err, result) {
            if (err) {
                logger.error({filePath: __filename}, {functionName: 'createCategory'}, 'error in category creation');
                return reply(err); // HTTP 403
            }
            else{
                reply(result); //HTTP 200
            }
        });
    };
};

//to getAll Category

/**
   GET: /getAllCategory
 */
exports.getAllCategory = function(database, config) {
    return function(request, reply) {
        var Category = getCategoryModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Category.getAllCategory(function(err, category) {
                if (!err) {
                    if (category === null) {
                        logger.error({filePath: __filename}, {functionName: 'getAllCategory'}, 'Category not found.');
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    else{
                       reply(category); //HTTP 200 
                    }
                } else {
                    logger.error({filePath: __filename}, {functionName: 'createCategory'}, 'error in get all category');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });

    };
};
