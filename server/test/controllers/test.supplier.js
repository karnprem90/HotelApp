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
    getSupplierController = require('../../controller/supplier'),
    testCommon = require('../test.commonHelper'),
    getZoneManagerController = require('../../controller/zoneManager'),
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db,
    MockEmailService = testCommon.MockEmailService;

describe('Supplier Controller Tests', function() {
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
    
    describe('Register New Supplier', function() { 
        it('should register new supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should register new supplier'} + err.message);
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
                thirdCreateSupplierReply = function(supplier){
                    assert.equal(supplier, constants.successMessage, 'Supplier creation status is not what is expected');
                    assert.isTrue(emailServiceForSupplier.hasBeenCalled(), 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

         it('should fail to register new supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should fail to register new supplier'} + err.message);
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
                        supplierUserData[0].firstname = '';
                        req.payload.supplierUser = supplierUserData;
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupplierReply);
                },
                thirdCreateSupplierReply = function(supplier){
                    assert.equal(supplier.output.payload.message, 'Oops! something went wrong', 'is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get All Supplier', function() { 
        it('should get all supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should get all supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupllierReply);
                },
                thirdCreateSupllierReply = function(error){
                    assert.equal(error.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                    assert.equal(supplier[0].corporateName, supplierData.corporateName, 'Get all supplier, corporateName is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail get all supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should get all supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSupllierReply);
                },
                thirdCreateSupllierReply = function(error){
                    assert.equal(error.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(error){
                    assert.equal(error.output.payload.message, 'Not Found', 'Create supplier length is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
     });

    describe('Get  Supplier', function() { 
        it('should get supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should get supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSuplierReply);
                },
                thirdCreateSuplierReply = function(error){
                    assert.equal(error.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                        req.params = {};
                        req.params.id = supplier[0]._id;
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.getSupplierById(database, config)(req, fifthSupplierIdReply);
                },
                fifthSupplierIdReply = function(supplier){
                    assert.equal(supplier.corporateName, supplierData.corporateName, 'Supplier Corporate Name is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail to get supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should fail to get supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSuplierReply);
                },
                thirdCreateSuplierReply = function(error){
                    assert.equal(error.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                        req.params = {};
                        req.params.id = 500000;
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.getSupplierById(database, config)(req, fifthSupplierIdReply);
                },
                fifthSupplierIdReply = function(error){
                    assert.equal(error.output.payload.message, 'Not Found', 'Supplier Id is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Update  Supplier', function() { 
        it('should update supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should update supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSuplierReply);
                },
                thirdCreateSuplierReply = function(supplier){
                    assert.equal(supplier.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                    assert.equal(supplier[0].firstname, supplierData.firstname, 'Get Supplier firstname is not what is expected');
                        req.payload = supplier[0];
                        req.params = {};
                        req.params.id = supplier[0]._id;
                        req.payload.phone = '1236589740';
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.updateSupplier(database, config)(req, fifthUpdateSupplierReply);
                },
                fifthUpdateSupplierReply = function(supplier){
                    assert.equal(supplier.phone, '1236589740', 'Update Supplier phone is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail update supplier', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should fail update supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSuplierReply);
                },
                thirdCreateSuplierReply = function(supplier){
                    assert.equal(supplier.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                    assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                    assert.equal(supplier[0].firstname, supplierData.firstname, 'Get Supplier firstname is not what is expected');
                        req.payload = supplier[0];
                        req.params = {};
                        req.params.id = supplier[0]._id;
                        req.payload.phone = '';
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.updateSupplier(database, config)(req, fifthUpdateSupplierReply);
                },
                fifthUpdateSupplierReply = function(supplier){
                    assert.equal(supplier.isBoom, true, 'update supplier by Id failue error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get  Supplier Supplier Manager and Supplier User', function() { 
        it('should get supplier supplier manager and supplier user', function(done) {
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
                            logger.error({filePath: ___filename}, {testCaseName: 'should fail update supplier'} + err.message);
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
                    getSupplierController.createSupplier(database, config, emailServiceForSupplier)(req, thirdCreateSuplierReply);
                },
                 thirdCreateSuplierReply = function(supplier){
                    assert.equal(supplier.output.payload.message, 'Oops! something went wrong', 'Supplier creation status is not what is expected');
                     assert.isFalse(emailServiceForSupplier.hasBeenCalled(), 'SentMail has been called');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getSupplierController.getAllSupplier(database, config)(req, fourthSupplierReply);
                },
                fourthSupplierReply = function(supplier){
                    assert.equal(supplier[0].firstname, supplierData.firstname, 'Get Supplier firstname is not what is expected');
                        req.payload = supplier[0];
                        req.params = {};
                        req.params.id = supplier[0]._id;
                        req.headers = {};
                        req.headers.authorization = 'Bearer ' + authToken;
                        getSupplierController.getSupplier(database, config)(req, fifthSupplierReply);
                },
                fifthSupplierReply = function(supplier){
                    assert.equal(supplier[0].supplier.corporateName, supplierData.corporateName, 'Supplier Corporate Name is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });
});