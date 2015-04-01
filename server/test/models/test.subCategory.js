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
    getSubCategoryModel = require('../../model/subCategory').getModel,
    env = process.env.NODE_ENV || 'test',
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    Helper = require('../../Utility/helper'),
    config = require('../../config/config')[env],
    db;

describe('SubCategory Model Tests', function() {
    var database,
        Subcategory,
        subcategory = testCommon.commonSubCategoryData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Subcategory = getSubCategoryModel(mongoose, db);
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

describe('Create SubCategory', function() {
    it('should fail to  create subcategory with invalid details', function(done) {
        var result = {};
            Helper.updateHelper(subcategory, result);
            result.category = undefined;
        Subcategory.createSubCategory(result, function(error) {
            if (error) {
               assert.equal(error.message, 'Validation failed', 'is expected');
                done();
            }
        });
    });

    it('should create subcategory', function(done) {        
        Subcategory.createSubCategory(subcategory, function(error, result) {
            if (error) {
                console.log(error);
            } else {
                assert.equal(result.subCategoryName[0].name, subcategory.subCategoryName[0].name, 'is not expcted');
                done();
            }
        });
    });
});
    
describe('Get SubCategory', function() {
    it('should get by id', function(done) {
        Subcategory.createSubCategory(subcategory, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should get by id'}, error);
            } else {
                Subcategory.getById(result._id, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should get by id'}, err);
                    } else {
                        assert.equal(res.subCategoryName[0].name, subcategory.subCategoryName[0].name, 'is not expcted');
                        done();
                    }
                });
            }
        });
    });

    it('should fail to get by id', function(done) {
        Subcategory.createSubCategory(subcategory, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should fail to get by id'}, error);
            } else {
                result._id = 5;
                Subcategory.getById(result._id, function(err, res) {
                    if (err) {
                       logger.error({filePath: __filename}, {testCaseName: 'should fail to get by id'}, err);
                    } else {
                        assert.equal(res, null, 'is not expcted');
                        done();
                    }
                });
            }
        });
    });
});
    
    describe('Get All SubCategory', function() {
        it('should get all subcategory', function(done) {
            Subcategory.createSubCategory(subcategory, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all subcategory'}, error);
                } else {
                    Subcategory.getAllSubCategory(function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all subcategory'}, err);
                        } else {
                            assert.equal(res[0].category, subcategory.category, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all subcategory', function(done) {
            Subcategory.getAllSubCategory(function(err, res) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all subcategory'}, err);
                } else {
                    assert.equal(res.length, 0, 'is not expcted');
                    done();
                }
            });
        });
    });

    describe('Get All SubCategory by Category', function() {
        it('should get by category', function(done) {
            Subcategory.createSubCategory(subcategory, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get by category'}, error);
                } else {
                    Subcategory.getByCategory(result.category ,function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get by category'}, err);
                        } else {
                            assert.equal(res[0].category, subcategory.category, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get by category', function(done) {
            Subcategory.createSubCategory(subcategory, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get by category'}, error);
                } else {
                    result.category = 'asd';
                    Subcategory.getByCategory(result.category ,function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get by category'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Update SubCategory', function() {
        it('should update subcategory', function(done) {
            Subcategory.createSubCategory(subcategory, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update subcategory'}, error);
                } else {
                    result.isActive = false;
                    Subcategory.updateSubCategory(result ,function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update subcategory'}, err);
                        } else {
                            assert.equal(res.isActive, result.isActive, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update subcategory', function(done) {
            Subcategory.createSubCategory(subcategory, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update subcategory'}, error);
                } else {
                    result.subCategoryName[0].name = '';
                    Subcategory.updateSubCategory(result ,function(err) {
                        if (err) {
                           assert.equal(err.message, 'Validation failed', 'is expected');
                            done();
                        } 
                    });
                }
            });
        });
    });

   
});