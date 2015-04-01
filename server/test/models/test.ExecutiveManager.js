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
    getExecutiveManagerModel = require('../../model/executiveManager').getModel,
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('ExecutiveManager Model Tests', function() {
    var database,
        ExecutiveManager,
        executivemanager = testCommon.commonExecutiveManagerData();
        
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            ExecutiveManager = getExecutiveManagerModel(mongoose, db);
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

    describe('Create ExecutiveManager', function() {
        it('should fail to create executive manager with invalid details', function(done) {
            var execmanager = JSON.parse(JSON.stringify(executivemanager));
            execmanager.phone = 'dgjjgj';
            ExecutiveManager.createExecutiveManager(execmanager, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'create executive manager failure is not what is expected');
                    done();
                } 
            });
        });


        it('should create executive manager', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'});
                } else {
                    assert.equal(result.firstname, executivemanager.firstname, 'executive manager creation firstname is not what is expected');
                    done();
                }
            });
        });
    });

    describe('Get ExecutiveManager', function() {
        it('should get executive manager by id', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get executive manager by id'}, error);
                } else {
                    ExecutiveManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get executive manager by id'}, err);
                        } else {
                            assert.equal(res.firstname, executivemanager.firstname, 'get executive manager firstname is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get executive manager by id', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get executive manager by id'}, error);
                } else {
                    result._id = 5;
                    ExecutiveManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get executive manager by id'}, err);
                        } else {
                            assert.equal(res, null, 'fail to get executive manager error is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
    describe('Get All ExecutiveManager', function() {
        it('should get all executive manager', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all executive manager'}, error);
                } else {
                    ExecutiveManager.getAllExecutiveManager(function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all executive manager'}  + err.message);
                        } else {
                            assert.equal(result[0].firstname, executivemanager.firstname, 'get all executive manager firstname is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all executive manager', function(done) {
            ExecutiveManager.getAllExecutiveManager(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all executive manager'}  + err.message);
                } else {
                    assert.equal(result.length, 0, 'fail to get all executive manager error is not what is expected');
                    done();
                }
            });
        });

        it('should get all executive managers by email', function(done) {

            ExecutiveManager.createExecutiveManager(executivemanager, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all executive managers by email'}, error);
                } else {
                    ExecutiveManager.getAllEmailExecutiveManager(function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all executive managers by email'}, err);
                        } else {
                            assert.equal(result[0].email, executivemanager.email, 'get all executive manager by email is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all executive managers by email', function(done) {
            ExecutiveManager.getAllEmailExecutiveManager(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all executive managers by email'}, err);
                } else {
                    assert.equal(result.length, 0, 'fail to get executive manager by email error is not what is expected');
                    done();
                }
            });
        });
    });

    describe('Update ExecutiveManager', function() {
        it('should update executive manager', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error, result) {
                if (error) {
                        logger.error({filePath: __filename}, {testCaseName: 'should update executive manager'}, error);
                } else {
                    result.phone = '9851110666';
                    result.lastname = 'Hazan';
                    ExecutiveManager.updateExecutiveManager(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update executive manager'}, err);
                        } else {
                            assert.equal(res.lastname, result.lastname, 'update executive manager lastname is not what is expected');                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update executive manager with invalid details', function(done) {
            ExecutiveManager.createExecutiveManager(executivemanager, function(error, result) {
                if (error) {
                        logger.error({filePath: __filename}, {testCaseName: 'should fail to update executive manager with invalid details'}, error);
                } else {
                    result.phone = '98511abc10666';
                    ExecutiveManager.updateExecutiveManager(result, function(err) {
                        assert.equal(err.message, 'Validation failed', 'fail to update executive manager error is not what is expected');
                        done();
                    });
                }
            });
        });
    });
});