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
    getHotelManagerModel = require('../../model/hotelManager').getModel,
    Helper = require('../../Utility/helper'),
   testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env];

describe('HotelManager Model Tests', function() {
    var database,
        HotelManager,
        hotelmanager = testCommon.commonhotelManagerData(),
        db;
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            HotelManager = getHotelManagerModel(mongoose, db);
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
    
    describe('Create HotelManager', function() {
        it('should not create hotelmanager with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(hotelmanager, result);
            result.phone = '476hjg9';
            HotelManager.createHotelManager(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });

        it('should create hotelmanager', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create hotelmanager'} , error);
                } else {
                    assert.equal(result.firstname, hotelmanager.firstname, 'is  expected');
                    done();
                }
            });
        });
    });
   
    describe('Get HotelManager By Id', function() {
        it('should get hotelmanager by id', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by id'}, error);
                } else {
                    HotelManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by id'}, err);
                        } else {
                            assert.equal(res.firstname, hotelmanager.firstname, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hotelmanager by id', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by id'}, error);
                } else {
                    result._id = 5;
                    HotelManager.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by id'}, err);
                        } else {
                            assert.equal(res, null, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get HotelManager By Zone', function() {
       it('should get hotelmanager by zone', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by zone'}, error);
                } else {
                    HotelManager.getHotelManagerListByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by zone'}, err);
                        } else {
                            assert.equal(res[0].firstname, hotelmanager.firstname, 'is  expected');
                            done();
                        }
                    });
                }
            });
       });

        it('should fail to get hotelmanager by zone', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by zone'}, error);
                } else {
                    result.zone = 'adsad';
                    HotelManager.getHotelManagerListByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by zone'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is expected');
                            done();
                        }
                    });
                }
            });
       });
    });

    describe('Get HotelManager By Hotel', function() {
        it('should get hotelmanager by hotel', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by hotel'}, error);
                } else {
                    HotelManager.getByZoneIdHotelId(result.zone, result.hotel, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hotelmanager by hotel'}, err);
                        } else {
                            assert.equal(res.firstname, hotelmanager.firstname, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hotelmanager by hotel', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by hotel'}, error);
                } else {
                    result.zone = 'fsfsdf';
                    HotelManager.getByZoneIdHotelId(result.zone, result.hotel, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hotelmanager by hotel'}, err);
                        } else {
                            assert.equal(res, null, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Update HotelManager', function() {
        it('should fail to update hotelmanager with invalid details', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update hotelmanager with invalid details'}, error);
                } else {
                    result.preferedLanguage = '23@78/8kj543543';
                    HotelManager.updateHotelManager(result, function(err) {
                        if (err) {
                            assert.equal(err.message, 'Validation failed', 'is expected');
                            done();
                        }
                    });
                }
            });
        });


        it('should update hotelmanager by id', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update hotelmanager by id'}, error);
                } else {
                    result.firstname = 'Gaurav';
                    HotelManager.updateHotelManager(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update hotelmanager by id'}, err);
                        } else {
                            assert.equal(res.firstname, result.firstname, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });
    });



    

    describe('Get All HotelManager', function() {
        it('should get all hotelmanagers by hotel', function(done) {
            HotelManager.createHotelManager(hotelmanager, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all hotelmanagers by hotel'}, error);
                } else {
                    HotelManager.getAllHotelManager(result.hotel, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all hotelmanagers by hotel'}, err);
                        } else {
                            assert.equal(res.firstname, hotelmanager.firstname, 'is  expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    
});