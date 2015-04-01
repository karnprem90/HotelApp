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


var assert = require('chai').assert,
    mongoose = require('mongoose'),
    getCategoryModel = require('../../model/category').getModel,
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;
describe('Category Model Tests', function() {
    var database,
        Category,
        categoryData = testCommon.commonCategoryData();
        
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Category = getCategoryModel(mongoose, db);
            database = mongoose;
            done();
        });
    });

    after(function(done) {
        mongoose.connection.close(done);
    });

    beforeEach(function(done) {
        testCommon.removeCollections(mongoose, function(err) {
            if (err) {
                logger.error({
                    filePath: __filename
                }, {
                    functionName: 'beforeEach'
                }, err);
            }
            done();
        });
    });

    describe('Category Creation', function() {
        it('should create new category', function(done) {
            Category.createCategory(categoryData, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should new category'}, error);
                } else {
                    assert.equal(result.categoryNames[0].name, categoryData.categoryNames[0].name, 'Category creation name is not what is expected');
                    done();
                }
            });
        });
    });
   

    describe('Category Creation', function() {
        it('should fail to get all category', function(done) {
            Category.getAllCategory(function(err, res) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all category'}, err);
                } else {
                    assert.equal(res.length, 0, 'Get All Category fails result is not what is expected');
                    done();
                }
            });
        });

        it('should get all category', function(done) {
            Category.createCategory(categoryData, function(error) {
                if (error) {
                    logger.error(error);
                } else {
                    Category.getAllCategory(function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all category'}, error);
                        } else {
                            assert.equal(res[0].categoryNames[0].name, categoryData.categoryNames[0].name, 'Get All Category name is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
    
});