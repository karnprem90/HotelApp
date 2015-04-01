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
    getSupplierModel = require('../../model/Supplier').getModel,
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Supplier Model Tests', function() {
    var database,
        Supplier,
        supplier = testCommon.commonSupplierData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Supplier = getSupplierModel(mongoose, db);
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

    describe('Create Supplier', function() {
        it('should fail to create supplier with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(supplier, result);
            result.corporateName = '+&ghg4';
            Supplier.createSupplier(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('should create supplier', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create supplier'}, error);
                } else {
                    assert.equal(result.corporateName, supplier.corporateName, 'is not expcted');
                    done();
                }
            });
        });
    });

    describe('Get Supplier By Id', function() {
        it('should get supplier by id', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get supplier by id'}, error);
                } else {
                    Supplier.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get supplier by id'}, err);
                        } else {
                            assert.equal(res.corporateName, supplier.corporateName, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get supplier by id', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplier by id'}, error);
                } else {
                    result._id = 5;
                    Supplier.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplier by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get Supplier By Zones', function() {
        it('should get supplier by zone', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get supplier by zone'}, error);
                } else {
                    Supplier.getSupplierByZone(result.zones, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get supplier by zone'}, err);
                        } else {
                            assert.equal(res[0].corporateName, supplier.corporateName, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should get fail to supplier by zone', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get fail to supplier by zone'}, error);
                } else {
                    result.zones ='wrw';
                    Supplier.getSupplierByZone(result.zones, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get fail to supplier by zone'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Update Supplier', function() {
        it('should update supplier by id', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update supplier by id'}, error);
                } else {
                    result.corporateName = 'Cronj';
                    Supplier.updateSupplier(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update supplier by id'}, err);
                        } else {
                            assert.equal(res.corporateName, result.corporateName, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to  update supplier with invalid details', function(done) {
            Supplier.createSupplier(supplier, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to  update supplier with invalid details'}, error);
                } else {
                    result.corporateName = '';
                    Supplier.updateSupplier(result, function(err) {
                        assert.equal(err.message, 'Validation failed', 'is expected');
                        done();
                    });
                }
            });
        });
    });
});