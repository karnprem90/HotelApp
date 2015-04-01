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
    getHotelUserModel = require('../../model/hotelUser').getModel,
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('HotelUser Model Tests', function() {
    var database,
        HotelUser,
        hoteluser = testCommon.commonhotelUserData()[0];
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            HotelUser = getHotelUserModel(mongoose, db);
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
    
    describe('Create HotelUser', function() {
        it('should create hoteluser', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should create hoteluser'}, error);
                } else {
                    assert.equal(result.firstname, hoteluser.firstname, 'is not expcted');
                    done();
                }
            });             
        });
        it('should fail to create hoteluser with invalid details', function(done) {
            var result = {};
            Helper.updateHelper(hoteluser, result);
            result.phone = '476hjg9';
            HotelUser.createHotelUser(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                }
            });
        });
    });

    describe('Get HotelUser By Id', function() {
        it('should get hoteluser by id', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hoteluser by id'}, error);
                } else {
                    HotelUser.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hoteluser by id'}, err);
                        } else {
                            assert.equal(res.firstname, hoteluser.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hoteluser by id', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hoteluser by id'}, error);
                } else {
                    result._id = 5;
                    HotelUser.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hoteluser by id'}, err);
                        } else {
                            assert.equal(res, null, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get HotelUser By Zone', function() {        
        it('should get hoteluser by zone', function(done) {
           HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get hoteluser by zone'}, error);
                } else {
                    HotelUser.getHotelUserListByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get hoteluser by zone'}, err);
                        } else {
                            assert.equal(res[0].firstname, hoteluser.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get hoteluser by zone', function(done) {
           HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get hoteluser by zone'}, error);
                } else {
                    result.zone = 'asad';
                    HotelUser.getHotelUserListByZone(result.zone, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get hoteluser by zone'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get HotelUser', function() {
        it('should get all hoteluser by hotel', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get all hoteluser by hotel'}, error);
                } else {
                    HotelUser.getAllHotelUser(result.hotel, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get all hoteluser by hotel'}, err);
                        } else {
                            assert.equal(res[0].firstname, hoteluser.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get all hoteluser by hotel', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get all hoteluser by hotel'}, error);
                } else {
                    result.hotel = 'dss';
                    HotelUser.getAllHotelUser(result.hotel, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get all hoteluser by hotel'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });
    });
    describe('Update HotelUser', function() {
        it('should update hoteluser by id', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update hoteluser by id'}, error);
                } else {
                    result.firstname = 'Gaurav';
                    HotelUser.updateHotelUser(result, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update hoteluser by id'}, err);
                        } else {
                            assert.equal(res.firstname, result.firstname, 'is not expcted');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to update hoteluser with invalid details', function(done) {
            HotelUser.createHotelUser(hoteluser, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to update hoteluser with invalid details'}, error);
                } else {
                    result.preferedLanguage = '23@78/8kj543543';
                    HotelUser.updateHotelUser(result, function(err) {
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