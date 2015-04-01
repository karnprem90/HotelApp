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
    getUserModel = require('../../model/user').getModel,
    getHotelController = require('../../controller/hotel'),
    getZoneManagerController = require('../../controller/zoneManager'),
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db,
    MockEmailService = testCommon.MockEmailService;

describe('Hotel Controller Tests', function() {
    var database,
        User,
        hotelData = testCommon.commonHotelData(),
        hotelManagerData = testCommon.commonhotelManagerData(),
        hotelUserData = testCommon.commonhotelUserData(),
        zoneManagerData = testCommon.commonzoneManagerData();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            User = getUserModel(mongoose);
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

    describe('Register New Hotel', function() {
        it('should register new hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');10
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config,emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail to register new hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.payload.hotelUser[0].firstname = '';
                    req.headers = {};

                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(error) {
                    assert.equal(error.output.payload.message, 'Oops! something went wrong', 'hotel creation failure status is not what is expected');
                    assert.isFalse(emailServiceForHotel.hasBeenCalled(), 'SentMail has been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get All Hotels', function() {
        it('should get all hotel by zone', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail get all hotel by zone', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'get all hotel by zone error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get  Hotel', function() {
        it('should get hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    req.payload = {};
                    req.params = {};
                    req.params.id = hotel[0]._id;

                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsById(database, config)(req, fifthGetHotelByIdReply);
                },
                fifthGetHotelByIdReply = function(hotel) {
                    assert.equal(hotel.name, hotelData.name, 'get hotel by Id, hotel name is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should not get hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    req.payload = {};
                    req.params = {};
                    req.params.id = 10000;

                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsById(database, config)(req, fifthGetHotelByIdReply);
                },
                fifthGetHotelByIdReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'get hotel by Id failure error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Update  Hotel', function() {
        it('should update hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    req.payload = hotel[0];
                    req.params = {};
                    req.params.id = hotel[0]._id;
                    req.payload.telephone = '1236589740';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.updateHotel(database, config)(req, fifthUpdateHotelByIdReply);
                },
                fifthUpdateHotelByIdReply = function(hotel) {
                    assert.equal(hotel.telephone, '1236589740', 'update hotel by Id, hotel phone is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail update hotel', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    req.payload = hotel[0];
                    req.params = {};
                    req.params.id = hotel[0]._id;
                    req.payload.telephone = '';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.updateHotel(database, config)(req, fifthUpdateHotelByIdReply);
                },
                fifthUpdateHotelByIdReply = function(error) {
                    assert.equal(error.isBoom, true, 'update hotel by Id failue error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get  Hotel Hotel Manager and Hotel User', function() {
        it('should get hotel hotel manager and hotel user', function(done) {
            var req = {},
                authToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should register new hotel'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.hotel = JSON.parse(JSON.stringify(hotelData));
                    req.payload.hotelManager = JSON.parse(JSON.stringify(hotelManagerData));
                    req.payload.hotelUser = JSON.parse(JSON.stringify(hotelUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.createHotel(database, config, emailServiceForHotel)(req, thirdCreateHotelReply);
                },
                thirdCreateHotelReply = function(status) {
                    assert.equal(status, constants.successMessage, 'hotel creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getHotelController.getHotelsByZone(database, config)(req, fourthGetHotelByZoneReply);
                },
                fourthGetHotelByZoneReply = function(hotel) {
                    assert.equal(hotel[0].name, hotelData.name, 'get all hotel by zone name is not what is expected');
                    req.payload = hotel[0];
                    req.params = {};
                    req.params.id = hotel[0]._id;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getHotelController.getAllHotel(database, config)(req, fifthGetAllHotelReply);
                },
                fifthGetAllHotelReply = function(hotel) {
                    assert.equal(hotel[0].hotel.name, hotelData.name, 'get hotel, hotel name is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });
});
