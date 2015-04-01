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
    getProductModel = require('../../model/product').getModel,
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Product Model Tests', function() {
    var database,
        Product,
        product = testCommon.commonProductData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Product = getProductModel(mongoose, db);
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
    
    describe('Create Product', function() {
        it('should fail to create product with invalid data', function(done) {
            var result = {};
            Helper.updateHelper(product, result);
            result.productType = '+6gff';
            Product.createProduct(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('should create product', function(done) {        
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create product'}, error);
                } else {
                    assert.equal(result.name, product.name, 'is expected');
                    done();
                }
            });        
        });
    });

    describe('Get Product', function() {
        it('should get product by id', function(done) {
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get product by id'}, error);
                } else {
                    Product.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get product by id'}, err);
                        } else {
                            assert.equal(res.name, product.name, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get product by id', function(done) {
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get product by id'}, error);
                } else {
                    result._id= 5;
                    Product.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get product by id'}, err);
                        } else {
                            assert.equal(res, null, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });

    });

    describe('Get All Product', function() {
        it('should get all products', function(done) {
            Product.createProduct(product, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all products'}, error);
                } else {
                    Product.getAllProduct(function(err, result) {
                        if (err) {
                            logger.error('error' + err.message);
                        } else {
                            assert.equal(result[0].name, product.name, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all products', function(done) {
            Product.getAllProduct(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all products'} + err.message);
                } else {
                    assert.equal(result.length, 0, 'is  expected');
                    done();
                }
            });
        });
    });

    describe('Update Product', function() {
        it('should update product by id', function(done) {
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update product by id'}, error);
                } else {
                    result.productType = 'Shirt';
                    Product.updateProduct(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update product by id'} + err.message);
                        } else {
                            assert.equal(res.productType, result.productType, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

    it('should fail to  update product with invalid data', function(done) {
        Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to  update product with invalid data'} + error.message);
                } else {
                    result.productType = '+ghjghg&';
                    Product.updateProduct(result, function(err) {
                        if (err) {
                            assert.equal(err.message, 'Validation failed', 'is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
    
    describe('Get Product By Supplier', function() {
        it('should get product by supplierid', function(done) {
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get product by supplierid'}, error);
                } else {
                    Product.getProductBySupplierId(result.supplierId, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get product by supplierid'}, err);
                        } else {
                            assert.equal(res[0].name, product.name, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get product by supplierid', function(done) {
            Product.createProduct(product, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get product by supplierid'}, error);
                } else {
                    result.supplierId = '9';
                    Product.getProductBySupplierId(result.supplierId, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get product by supplierid'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });
});