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
    getSupplierUserController = require('../../controller/supplierUser'),
    getSupplierController = require('../../controller/supplier'),
    getUserModel = require('../../model/user.js').getModel,
    getZoneManagerController = require('../../controller/zoneManager'),
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db,
    MockEmailService = testCommon.MockEmailService;;

describe('SupplierUser Controller Tests', function() {
    var database,
        zoneManagerData = testCommon.commonzoneManagerData(),
        supplierData = testCommon.commonSupplierData(),
        supplierManagerData = testCommon.commonSupplierManagerData(),
        supplierUserData = testCommon.commonSupplierUserData(),
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
        testCommon.removeCollections(mongoose, function(err){
            if (err) {                                        
               logger.error({filePath: __filename},{functionName: 'beforeEach'},err);
            }
            done();
        });
    });

    describe('Login  SupplierUser', function() { 
        it('should login supplier user', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(user){
                    assert.equal(user.username, supplierUserData[0].email, 'Supplier email is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login supplier user due to invalid password', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail login supplier user due to invalid password'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    req.payload.password = 'su1234';
                    LoginUser.login(database, config)(req, fourthLoginReply);
                },
                fourthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier login is not what  expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login supplier user due to invalid username', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username = "sushant@cronj.com";
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier login is not what  expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login supplier user due to invalid username and password', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.password = "password123";
                    req.payload.username = "sushant@cronj.com";
                    LoginUser.login(database, config)(req, fourthLoginReply);
                },
                fourthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier login is not what  expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get  SupplierUser', function() { 
        it('should get supplier user', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                        authToken = user.token;
                        req.payload = {};
                        req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                        req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                        req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(user){
                    assert.equal(user.username, supplierUserData[0].email, 'Supplier User email is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + user.token;
                    getSupplierUserController.getSupplierUser(database, config)(req, sixthSupplierUserReply);
                },
                sixthSupplierUserReply = function(supplieruser){
                    assert.equal(supplieruser.firstname, supplierUserData[0].firstname, 'Supplier First Name is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail to get supplier user', function(done) {
            var req = {},
                authToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                    firstCreateZoneManagerReply = function(status){
                        assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                        assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                        req.payload = {};
                        req.payload.username = zoneManagerData.email;
                        User.getByUserName(req.payload.username, function(err, res) {
                            if (err) {
                                logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplier user'} + err.message);
                            } else {
                                req.payload.password = CryptoPwd.decrypt(res.password, config);
                                LoginUser.login(database, config)(req, secondLoginReply);
                            }
                        });
                    },
                    secondLoginReply = function(user){
                        assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                            authToken = user.token;
                            req.payload = {};
                            req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                            req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                            req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                            req.headers = {};
                            req.headers.authorization = 'Bearer ' + authToken;
                            getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                    },
                    thirdCreateSupplierReply = function(status){
                        assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                        assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                        req.payload = {};
                        req.payload.username = supplierUserData[0].email;
                        User.getByUserName(req.payload.username, function(err, res) {
                            if (err) {
                                logger.error({filePath: __filename}, {testCaseName: 'should fail to get supplier user'} + err.message);
                            } else {
                                req.payload.password = CryptoPwd.decrypt(res.password, config);
                                LoginUser.login(database, config)(req, fourthLoginReply);
                            }
                        });
                    },
                    fourthLoginReply = function(user){
                        assert.equal(user.username, supplierUserData[0].email, 'Supplier User email is not what is expected');
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                        getSupplierUserController.getSupplierUser(database, config)(req, fifthSupplierUserReply);
                    },
                    fifthSupplierUserReply = function(error){
                        assert.equal(error.output.payload.message, 'Not Found', 'Supplier User is not what expected');
                        done();
                    };
                req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Update  SupplierUser', function() { 
        it('should update supplier user', function(done) {
             var req = {},
                authToken,
                supplierauthToken,
                 emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                 emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(user){
                    assert.equal(user.username, supplierUserData[0].email, 'Supplier User email is not what is expected');
                    supplierauthToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierUserController.getSupplierUser(database, config)(req, fifthSupplierUserReply);
                },
                fifthSupplierUserReply = function(supplieruser){
                    req.payload = supplieruser;
                    req.params = {};
                    req.payload.phone = '1234567890';
                    req.headers = {};
                    req.params.id = supplieruser._id;
                    req.headers.authorization = 'Bearer ' + supplierauthToken;
                    getSupplierUserController.updateSupplierUser(database, config)(req, sixthUpdateSupplierReply);
                },
                sixthUpdateSupplierReply = function(supplieruser){
                    assert.equal(supplieruser.phone, '1234567890', 'Supplier update phone is not what expected');
                    done(); 
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail to update supplier user', function(done) {
            var req = {},
                authToken,
                supplierauthToken,
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to update supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.supplier = JSON.parse(JSON.stringify(supplierData));
                    req.payload.supplierManager = JSON.parse(JSON.stringify(supplierManagerData));
                    req.payload.supplierUser = JSON.parse(JSON.stringify(supplierUserData));
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(status){
                    assert.equal(status, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = supplierUserData[0].email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to update supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(user){
                    assert.equal(user.username, supplierUserData[0].email, 'Supplier User email is not what is expected');
                    supplierauthToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierUserController.getSupplierUser(database, config)(req, fifthSupplierUserReply);
                },
                fifthSupplierUserReply = function(supplieruser){
                    req.payload = supplieruser;
                    req.payload.phone = '';
                    req.params = {};
                    req.params.id = supplieruser._id;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + supplierauthToken;
                    getSupplierUserController.updateSupplierUser(database, config)(req, sixthUpdateSupplierReply);
                },
                sixthUpdateSupplierReply = function(error){
                    assert.equal(error.output.payload.message,  'ValidationError: Path `phone` is required.', 'Update supplier User failure error is not what expected');
                    done(); 
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
     });
});
