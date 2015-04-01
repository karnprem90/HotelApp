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
    getLogisticAgentModel = require('../../model/logisticAgent').getModel,
   testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('LogisticAgent Model Tests', function() {
    var database,
        LogisticAgent,
        logisticagent = testCommon.commonLogisticAgentData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            LogisticAgent = getLogisticAgentModel(mongoose, db);
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
    
    describe('Create LogisticAgent', function() {
        it('should fail to create logisticagent with invalid details', function(done) {
            var result = {};
            updateHelper(logisticagent, result);
            result.email = 'gaurav57';
            LogisticAgent.createLogisticAgent(result, function(error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
            });
        });

        it('should create logisticagent', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create logisticagent'}, error);
                } else {
                    assert.equal(result.firstname, logisticagent.firstname, 'is not expcted');
                    done();
                }
            });
        });
    });
    describe('Get LogisticAgent', function() {
        it('should get logisticagent by id', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get logisticagent by id'}, error);
                } else {
                    LogisticAgent.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get logisticagent by id'}, err);
                        } else {
                            assert.equal(res.firstname, logisticagent.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get logisticagent by id', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get logisticagent by id'}, error);
                } else {
                    result._id = 5;
                    LogisticAgent.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get logisticagent by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });
    describe('Get All LogisticAgent', function() {
        it('should get all logisticagent', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all logisticagent'}, error);
                } else {
                    LogisticAgent.getAllLogisticAgent(function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all logisticagent'}, err);
                        } else {
                            assert.equal(result[0].firstname, logisticagent.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all logisticagent', function(done) {
            LogisticAgent.getAllLogisticAgent(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all logisticagent'}, err);
                } else {
                    assert.equal(result.length, 0, 'is not expcted');
                    done();
                }
            });
        });

    });
    describe('Update LogisticAgent', function() {
        it('should update logisticagent by id', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update logisticagent by id'}, error);
                } else {
                    result.phone = '9851110666';
                    LogisticAgent.updateLogisticAgent(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update logisticagent by id'}, err);
                        } else {
                            assert.equal(res.phone, result.phone, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update logisticagent with invalid data', function(done) {
            LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update logisticagent with invalid data'}, error);
                } else {
                    result.phone = '985111hjkghj666';
                    LogisticAgent.updateLogisticAgent(result, function(err) {
                        assert.equal(err.message, 'Validation failed', 'is expected');
                        done();
                    });
                }
            });
        });
    });

       
    function updateHelper(requestData, originalData) {
        for (var req in requestData) {
            if (req === 'homeAddress' || req === 'officeAddress') {
                for (var req1 in requestData[req]) {
                    if (requestData[req][req1] === ' ') {
                        originalData[req][req1] = ' ';
                    } else {
                        originalData[req][req1] = requestData[req][req1];
                    }
                }
            } else {
                if (requestData[req] === ' ') {
                    originalData[req] = ' ';
                } else {
                    originalData[req] = requestData[req];
                }
            }

        }
    }
});