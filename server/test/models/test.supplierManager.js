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
    getSupplierManagerModel = require('../../model/supplierManager').getModel,
    Helper = require('../../Utility/helper'),
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('SupplierManager Model Tests', function() {
    var database,
        SupplierManager,
        suppliermanager = testCommon.commonSupplierManagerData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            SupplierManager = getSupplierManagerModel(mongoose, db);
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
    
    describe('Create SupplierManager', function() {
        it('should fail to  create suppliermanager with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(suppliermanager, result);
            result.firstname = '+&hjjn';
            SupplierManager.createSupplierManager(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('should create suppliermanager', function(done) {
                SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                    if (error) {
                        logger.error({filePath: __filename}, {testCaseName: 'should create suppliermanager'}, error);
                    } else {
                        assert.equal(result.firstname, suppliermanager.firstname, 'is not expected');
                        done();
                    }
                });
        });
    });
    describe('Get SupplierManager By Id', function() {
        it('should get suppliermanager by id', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get suppliermanager by id'}, error);
                } else {
                    SupplierManager.getByIdBasic(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get suppliermanager by id'}, err);
                        } else {
                            assert.equal(res.firstname, suppliermanager.firstname, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get suppliermanager by id', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get suppliermanager by id'}, error);
                } else {
                    result._id = 5;
                    SupplierManager.getByIdBasic(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get suppliermanager by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });
    describe('Get SupplierManager By Supplier', function() {
        it('should get supplierManager by supplier', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get supplierManager by supplier'}, error);
                } else {
                    SupplierManager.getBySupplier(result.supplier, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get supplierManager by supplier'}, err);
                        } else {
                            assert.equal(res.firstname, suppliermanager.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get supplierManager by supplier', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplierManager by supplier'}, error);
                } else {
                    result.supplier = 'rwew';
                    SupplierManager.getBySupplier(result.supplier, function(err, res) {
                        if (err) {
                            logger.error( {filePath: __filename}, {testCaseName: 'should fail to get supplierManager by supplier'}, err);
                        } else {
                            assert.equal(res, null, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });
    describe('Update SupplierManager', function() {
        it('should update supplierManager by id', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update supplierManager by id'}, error);
                } else {
                    result.firstname = 'Gaurav';
                    SupplierManager.updateSupplierManager(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update supplierManager by id'}, err);
                        } else {
                            assert.equal(res.firstname, result.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update supplierManager with invalid data', function(done) {
            SupplierManager.createSupplierManager(suppliermanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update supplierManager with invalid data'}, error);
                } else {
                    result.firstname = '';
                    SupplierManager.updateSupplierManager(result, function(err) {
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