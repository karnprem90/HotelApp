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
    getSupplierUserModel = require('../../model/supplierUser').getModel,
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Supplier User Model Tests', function() {
    var database,
        SupplierUser,
        supplieruser = testCommon.commonSupplierUserData()[0];

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            SupplierUser = getSupplierUserModel(mongoose, db);
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

describe('Create SupplierUser', function() {
    it('should create supplieruser', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should create supplieruser'}, error);
            } else {
                assert.equal(result.firstname, supplieruser.firstname, 'is not expected');
                done();
            }
        });
    });

    it('should fail to create supplieruser with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(supplieruser, result);
            result.phone = '476hjg9';
            SupplierUser.createSupplierUser(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
    });
});
    
describe('Get SupplierUser', function() {
    it('should get supplieruser by id', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should get supplieruser by id'}, error);
            } else {
                SupplierUser.getByIdBasic(result._id, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should get supplieruser by id'}, err);
                    } else {
                        assert.equal(res.firstname, supplieruser.firstname, 'is not expected');
                        done();
                    }
                });
            }
        });
    });

    it('should fail to get supplieruser by id', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplieruser by id'}, error);
            } else {
                result._id = 5;
                SupplierUser.getByIdBasic(result._id, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplieruser by id'}, err);
                    } else {
                        assert.equal(res, null, 'is not expected');
                        done();
                    }
                });
            }
        });
    });
});
    
describe('Get  SupplierUser By Supplier', function() {
    it('should get supplieruser by supplier', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should get supplieruser by supplier'}, error);
            } else {
                SupplierUser.getBySupplier(result.supplier, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should get supplieruser by supplier'}, err);
                    } else {
                        assert.equal(res[0].firstname, supplieruser.firstname, 'is not expected');
                        done();
                    }
                });
            }
        });
    });

     it('should fail to get supplieruser by supplier', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplieruser by supplier'}, error);
            } else {
                result.supplier = 'asd';
                SupplierUser.getBySupplier(result.supplier, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplieruser by supplier'}, err);
                    } else {
                        assert.equal(res.length, 0, 'is not expected');
                        done();
                    }
                });
            }
        });
    });
});
    
describe('Update SupplierUser', function() {
    it('should update supplieruser by id', function(done) {
        SupplierUser.createSupplierUser(supplieruser, function(error, result) {
            if (error) {
                logger.error({filePath: __filename}, {testCaseName: 'should update supplieruser by id'}, error);
            } else {
                result.firstname = 'Gaurav';
                SupplierUser.updateSupplierUser(result, function(err, res) {
                    if (err) {
                        logger.error({filePath: __filename}, {testCaseName: 'should update supplieruser by id'}, err);
                    } else {
                        assert.equal(res.firstname, result.firstname, 'is not expected');
                        done();
                    }
                });
            }
        });
    });

    it('should fail to update SupplierUser with invalid details', function(done) {
            SupplierUser.createSupplierUser(supplieruser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update SupplierUser with invalid details'}, error);
                } else {
                    result.preferedLanguage = '23@78/8kj543543';
                    SupplierUser.updateSupplierUser(result, function(err) {
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