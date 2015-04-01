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
    getCustomerModel = require('../../model/customer').getModel,
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Customer Model Tests', function() {
    var database,
        Customer,
        customer = testCommon.commonCustomerData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Customer = getCustomerModel(mongoose, db);
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
    
    describe('Create Customer', function() {
        it('should fail to create customer with invalid details', function(done) {
            var customerData = JSON.parse(JSON.stringify(customer));
            customerData.phone = 'dgjjgj';
            Customer.createCustomer(customerData, function(error) {
                    assert.equal(error.message, 'Validation failed', 'Customer creation failure, error message is not what is expected');
                    done();
            });
        });

        it('should create customer', function(done) {        
            Customer.createCustomer(customer, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create customer'} , error);
                }
                else {
                    assert.equal(result.firstname, customer.firstname, 'Customer creation, firstname is not what is expected');
                    done();
                }
            });        
        });
    });
    
    describe('Get Customer', function() {
        it('should get customer by id', function(done) {
            Customer.createCustomer(customer, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get customer by id'}, error);
                }
                else {
                    Customer.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get customer by id'},err);
                        }
                        else {
                            assert.equal(res.firstname, customer.firstname, 'Get customer, firstname is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
        it('should fail to get customer by id', function(done) {
            Customer.createCustomer(customer, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get customer by id'} ,  error);
                }
                else {
                    result._id = 5;
                    Customer.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get customer by id'} , err);
                        }
                        else {
                            assert.equal(res, null, 'Get customer failue error is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
       
    describe('Update Customer', function() {
        it('should fail update customer with invalid details', function(done) {
            Customer.createCustomer(customer, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail update customer with invalid details'}, error);
                }
                else {
                    result.phone = '9874abc569870';
                    Customer.updateCustomer(result, function(err) {
                        assert.equal(err.message, 'Validation failed', 'Update customer failue error is not what is expected');
                        done();
                    });
                }
            });
        });

        it('should update customer by id', function(done) {
            Customer.createCustomer(customer, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update customer by id'} , error);
                }
                else {
                    result.phone = '9874569870';
                    Customer.updateCustomer(result, function(err, result) {
                        if (err) {logger.error({filePath: __filename}, {testCaseName: 'should update customer by id'} + err.message);}
                        else {
                            assert.equal(result.phone, '9874569870', 'Update customer, phone is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
        
    describe('Get All Customer', function() {
        it('should get all customers', function(done) {
            Customer.createCustomer(customer, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all customers'} , error);
                }
                else {
                    Customer.getAllCustomer(function(err, res) {
                        if (err) {logger.error({filePath: __filename}, {testCaseName: 'should get all customers'} + err.message);}
                        else {
                            assert.equal(res[0].firstname, customer.firstname, 'Get customer, firstname is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all customers', function(done) {
            Customer.getAllCustomer(function(err, res) {
                if (err) {logger.error({filePath: __filename}, {testCaseName: 'should fail to get all customers'} + err.message);}
                else {
                    assert.equal(res.length, 0, 'Get customer failure message is not what is expected');
                    done();
                }
            });
        });
    });
});