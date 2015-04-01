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
    getZoneModel = require('../../model/zone.js').getModel,
    logger = require('../../config/logger').logger,
   testCommon = require('../test.commonHelper'),
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Zone Model Tests', function() {
    var database,
        Zone,
        zone = testCommon.commonZone();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Zone = getZoneModel(mongoose, db);
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

    describe(' Create Zone', function() {
        it('shoul not create create zone with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(zone, result);
            result.zoneName = '+hggh&';
            Zone.createZone(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('create zone', function(done) {         
            Zone.createZone(zone, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'create zone'} + error.message);
                } else {
                    assert.equal(result.zoneName, zone.zoneName, 'is not expected');
                    done();
                }
            });            
        });
    });

    describe('Get Zone By Id', function() {
        it('should get zone by id', function(done) {
            Zone.createZone(zone, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get zone by id'}, error);
                } else {
                    Zone.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get zone by id'}, err);
                        } else {
                            assert.equal(res.zoneName, zone.zoneName, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get by id', function(done) {
            Zone.createZone(zone, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get by id'}, error);
                } else {
                    result._id = 5;
                    Zone.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get All Zone', function() {   
        it('should get all zones', function(done) {
            Zone.createZone(zone, function(error) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all zones'}, error);
                } else {
                    Zone.getAllZone(function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all zones'}, err);
                        } else {
                            assert.equal(result[0].zoneName, 'Hyderabad', 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all zones', function(done) {
            Zone.getAllZone(function(err, result) {
                if (err) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all zones'}, err);
                } else {
                    assert.equal(result.length, 0, 'is not expected');
                    done();
                }
            });
        });
    });

    describe('Zone Model Tests', function() {
        
        it('should update zone by id', function(done) {
            Zone.createZone(zone, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update zone by id'}, error);
                } else {
                    result.zoneName = 'Bangalore';
                    Zone.updateZone(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update zone by id'}, err);
                        } else {
                            assert.equal(res.zoneName, result.zoneName, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update zone with invalid details', function(done) {
            Zone.createZone(zone, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update zone with invalid details'}, error);
                } else {
                    result.zoneName = '+&hkhj';
                    Zone.updateZone(result, function(err) {
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