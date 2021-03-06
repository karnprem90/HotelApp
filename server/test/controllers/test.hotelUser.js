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
    testCommon = require('../test.commonHelper'),
    getHotelUserController = require('../../controller/hotelUser'),
    getHotelController = require('../../controller/hotel'),
    getZoneManagerController = require('../../controller/zoneManager'),
    getUserModel = require('../../model/user.js').getModel,
    logger = require('../../config/logger').logger,
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db,
    MockEmailService = testCommon.MockEmailService;

describe('HotelUser Controller Tests', function() {
    var database,
        hotelData = testCommon.commonHotelData(),
        hotelUserData = testCommon.commonhotelUserData(),
        hotelManagerData = testCommon.commonzoneManagerData(),
        zoneManagerData = testCommon.commonzoneManagerData(),
        User;

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

    describe('Login  HotelUser', function() { 
        it('should login hotel user', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(user) {
                    assert.equal(user.username, hotelUserData[0].email, 'Hotel User login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login hotel user with invalid password', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    req.payload.password ='su1234';                    
                    LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                },
                fourthHotelUserLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Hotel User login failure error message not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login hotel user with invalid username', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.username = "sushant@cronj.com";
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Hotel User login failure error message not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login hotel user with invalid username and password', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = "sushant@cronj.com";
                    req.payload.password = "password123";
                    LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        
                },
                fourthHotelUserLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Hotel User login failure error message not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get  HotelUser', function() { 
        it('should get hotel user', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(user) {
                    assert.equal(user.username, hotelUserData[0].email, 'Hotel User login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + user.token;
                    getHotelUserController.getHotelUser(database, config)(req, fifthGetHotelUserReply);
                    
                },
                fifthGetHotelUserReply = function(hoteluser) {
                    assert.equal(hoteluser.firstname, hotelUserData[0].firstname, 'Get Hotel User firstname is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
         it('should fail to get hotel user', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(user) {
                    assert.equal(user.username, hotelUserData[0].email, 'Hotel User login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getHotelUserController.getHotelUser(database, config)(req, fifthGetHotelUserReply);
                    
                },
                fifthGetHotelUserReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get hotel user failure error message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Update  HotelUser', function() { 
        it('should update hotel user', function(done) {
            var req = {},
                authToken,
                hotelUserauthToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(user) {
                    assert.equal(user.username, hotelUserData[0].email, 'Hotel User login username is not what is expected');
                    hotelUserauthToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + hotelUserauthToken;
                    getHotelUserController.getHotelUser(database, config)(req, fifthGetHotelUserReply);
                    
                },
                fifthGetHotelUserReply = function(hoteluser) {
                    assert.equal(hoteluser.firstname, hotelUserData[0].firstname, 'Get Hotel User firstname is not what is expected');
                    req.payload = hoteluser;
                    req.payload.phone = '1234567890';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + hotelUserauthToken;
                    getHotelUserController.updateHotelUser(database, config)(req, sixthUpdateHotelUserReply);
                },
                sixthUpdateHotelUserReply = function(hoteluser) {
                    assert.equal(hoteluser.phone, '1234567890', 'Update Hotel User phone is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
       it('should fail to update hotel user', function(done) {
            var req = {},
                authToken,
                hotelUserauthToken,
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondZoneManagerLoginReply);
                        }
                    });
                },
                secondZoneManagerLoginReply = function(user) {
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
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForHotel.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = hotelUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login hotel user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthHotelUserLoginReply);
                        }
                    });
                },
                fourthHotelUserLoginReply = function(user) {
                    assert.equal(user.username, hotelUserData[0].email, 'Hotel User login username is not what is expected');
                    hotelUserauthToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + hotelUserauthToken;
                    getHotelUserController.getHotelUser(database, config)(req, fifthGetHotelUserReply);
                    
                },
                fifthGetHotelUserReply = function(hoteluser) {
                    assert.equal(hoteluser.firstname, hotelUserData[0].firstname, 'Get Hotel User firstname is not what is expected');
                    req.payload = hoteluser;
                    req.payload.phone = '';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + hotelUserauthToken;
                    getHotelUserController.updateHotelUser(database, config)(req, sixthUpdateHotelUserReply);
                },
                sixthUpdateHotelUserReply = function(error) {
                    assert.equal(error.isBoom,  true, 'Update Hotel User failure error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
            
        });
    });
});