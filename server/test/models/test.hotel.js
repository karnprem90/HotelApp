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
    getHotelModel = require('../../model/hotel').getModel,
    Helper = require('../../Utility/helper'),
   testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Hotel Model Tests', function() {
    var database,
        hotel = testCommon.commonHotelData(),
        Hotel;
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Hotel = getHotelModel(mongoose, db);
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

    describe('Create Hotel ', function() {
        it('should fail to create hotel with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(hotel, result);
            result.fax = 'abc68565465';
            Hotel.createHotel(result, function(error) {
                if (error) {
                   assert.equal(error.message, 'Validation failed', 'is expected');
                   done();
                } 
            });
        });

        it('should create hotel', function(done) {            
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create hotel'}, error);
                } else {
                    assert.equal(result.name, hotel.name, 'is not expcted');
                    done();
                }
            });
        });
    });

    describe('Get Hotel By Id ', function() {
        it('should get hotel by id', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hotel by id'}, error);
                } else {
                    Hotel.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hotel by id'}, err);
                        } else {
                            assert.equal(res.name, hotel.name, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hotel by id', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotel by id'}, error);
                } else {
                    result._id = 5;
                    Hotel.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotel by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    
    describe('Get Hotel By Zone ', function() {
        it('should get hotel by zone', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hotel by zone'}, error);
                } else {
                    Hotel.getByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hotel by zone'}, err);
                        } else {
                            assert.equal(res[0].name, hotel.name, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hotel by zone', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotel by zone'}, error);
                } else {
                    result.zone = 'ad';
                    Hotel.getByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotel by zone'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });
        
    describe('Update Hotel', function() {
        it('update hotel by id', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'update hotel by id'}, error);
                } else {
                    result.fax = '1 (234) 567-8901';
                    Hotel.updateHotel(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'update hotel by id'}, err);
                        } else {
                            assert.equal(res.fax, result.fax, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('cannot update hotel with invalid details', function(done) {
            Hotel.createHotel(hotel, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'cannot update hotel with invalid details'}, error);
                } else {
                    result.fax = '24677dsgh';
                    Hotel.updateHotel(result, function(err) {
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