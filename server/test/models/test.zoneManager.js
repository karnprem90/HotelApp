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
    getZoneManagerModel = require('../../model/zoneManager').getModel,
   testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('ZoneManager Model Tests', function() {
    var database,
        ZoneManager,
        zonemanager = testCommon.commonzoneManagerData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            ZoneManager = getZoneManagerModel(mongoose, db);
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

    describe('Create ZoneManager', function() {
        it('should fail to create zonemanager with invalid data', function(done) {
            var result = {};
            updateHelper(zonemanager, result);
            result.email = 'gaurav';
            ZoneManager.createZoneManager(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('should create zonemanager', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create zonemanager'}, error);
                } else {
                    assert.equal(result.firstname, zonemanager.firstname, 'is not expected');
                    done();
                }
            });            
        });
    });

    describe('Get ZoneManager By Id', function() {
        it('should get zonemanager by id', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get zonemanager by id'}, error);
                } else {
                    ZoneManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get zonemanager by id'}, err);
                        } else {
                            assert.equal(res.firstname, zonemanager.firstname, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get zonemanager by id', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get zonemanager by id'}, error);
                } else {
                    result._id = 5;
                    ZoneManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get zonemanager by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get All ZoneManager', function() {
        it('should get all zonemanager', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all zonemanager'}, error);
                } else {
                    ZoneManager.getAllZoneManager(function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all zonemanager'}, err);
                        } else {
                            assert.equal(result[0].firstname, 'Henry', 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all zonemanager', function(done) {
            ZoneManager.getAllZoneManager(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all zonemanager'}, err);
                } else {
                    assert.equal(result.length, 0, 'is not expected');
                    done();
                }
            });
        });
    });

    describe('Update ZoneManager', function() {
        it('should update zonemanager by id', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update zonemanager by id'}, error);
                } else {
                    result.firstname = 'gaurav';
                    ZoneManager.updateZoneManager(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update zonemanager by id'}, err);
                        } else {
                            assert.equal(res.firstname, result.firstname, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update zonemanager with invalid data', function(done) {
            ZoneManager.createZoneManager(zonemanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update zonemanager with invalid data'}, error);
                } else {
                    result.firstname = '787&+hjghj';
                    ZoneManager.updateZoneManager(result, function(err) {
                        if (err) {
                            assert.equal(err.message, 'Validation failed', 'is expected');
                            done();
                        }
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