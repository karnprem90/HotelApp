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
    getZoneManagerController = require('../../controller/zoneManager'),
    getAdministratorController = require('../../controller/administrator'),
    getCustomerController = require('../../controller/customer'),
    getExecutiveManagerController = require('../../controller/executiveManager'),
    getLogisticAgentController = require('../../controller/logisticAgent'),
    getHotelController = require('../../controller/hotel'),
    getSupplierController = require('../../controller/supplier'),
    getUserModel = require('../../model/user.js').getModel,
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    Helper = require('../../Utility/helper'),
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db,
    MockEmailService = testCommon.MockEmailService;

describe('Login Controller Tests', function() {
    var database,
        zoneManagerData = testCommon.commonzoneManagerData(),
        adminLoginData = testCommon.commonAdministratorLogin(),
        customerData = testCommon.commonCustomerData(),
        executiveManagerData = testCommon.commonExecutiveManagerData(),
        logisticAgentData = testCommon.commonLogisticAgentData(),
        hotelData = testCommon.commonHotelData(),
        hotelManagerData = testCommon.commonhotelManagerData(),
        hotelUserData = testCommon.commonhotelUserData(),
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

    describe('Administrator Login ', function() {
        it('should successfully login', function(done) {
            var req = {},
                emailServiceForAdmin = new MockEmailService([{ manager:adminLoginData,scope:'Admin'}]),
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    assert.isTrue(emailServiceForAdmin.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailServiceForAdmin)(req, firstCreateAdminReply);
        });

        it('should login fail due to invalid username', function(done) {
            var req = {},
                emailServiceForAdmin = new MockEmailService([{ manager:adminLoginData,scope:'Admin'}]),
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    assert.isTrue(emailServiceForAdmin.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    req.payload.username = 'sushant@cronj.com';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'Administrator login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailServiceForAdmin)(req, firstCreateAdminReply);
        });

        it('should login fail due to invalid password', function(done) {
            var req = {},
                emailServiceForAdmin = new MockEmailService([{ manager:adminLoginData,scope:'Admin'}]),
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    assert.isTrue(emailServiceForAdmin.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    req.payload.password = 'password';

                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'Administrator login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailServiceForAdmin)(req, firstCreateAdminReply);
        });
    });

    describe('Customer Login', function() {
        it('should login customer', function(done) {
            var req = {},
                emailServiceForCustomer = new MockEmailService([{ manager:customerData,scope:'Customer'}]),
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(emailServiceForCustomer.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = customerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login customer'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, customerData.email, 'Customer login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceForCustomer)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                emailServiceForCustomer= new MockEmailService([{ manager:customerData,scope:'Customer'}]),
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(emailServiceForCustomer.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = customerData.email;
                    req.payload.password = 'hm1234';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Customer login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceForCustomer)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                emailServiceForCustomer = new MockEmailService([{ manager:customerData,scope:'Customer'}]),
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(emailServiceForCustomer.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = customerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login customer'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username = "karan@cronj.com";
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Customer login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceForCustomer)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                emailServiceForCustomer = new MockEmailService([{ manager:customerData,scope:'Customer'}]),
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(emailServiceForCustomer.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'karan@cronj.com';
                    req.payload.password = 'hm1234';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Customer login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceForCustomer)(req, firstCreateCustomerReply);
        });

    });
    describe('ZoneManager Login', function() {
        it('should login zonemanager', function(done) {
            var req = {},
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login Zonemanager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zonemanager login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    req.payload.password = 'hm1234';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zonemanager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login customer'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username = "karan@cronj.com";
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zonemanager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'karan@cronj.com';
                    req.payload.password = 'hm1234';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zonemanager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

    });

    describe('ExecutiveManager Login', function() {
        it('should login executivemanager', function(done) {
            var req = {},
                emailServiceForEM = new MockEmailService([{ manager:executiveManagerData,scope:'ExecutiveManager'}]),
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForEM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login executivemanager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceForEM)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                emailServiceForEM = new MockEmailService([{ manager:executiveManagerData,scope:'ExecutiveManager'}]),
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForEM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;
                    req.payload.password = 'em1234';
                    LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);

                },
                secondLoginExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Executive Manager login failure error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceForEM)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                emailServiceForEM = new MockEmailService([{ manager:executiveManagerData,scope:'ExecutiveManager'}]),
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForEM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login executivemanager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username = 'karan@cronj.com';
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Executive Manager login failure error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceForEM)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                emailServiceForEM = new MockEmailService([{ manager:executiveManagerData,scope:'ExecutiveManager'}]),
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForEM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'karan@cronj.com';
                    req.payload.password = 'password123';

                    LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                },
                secondLoginExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Executive Manager login failure error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceForEM)(req, firstCreateExecutiveManagerReply);
        });
    });

    describe('LogisticAgent Login', function() {
        it('should login logisticagent', function(done) {
            var req = {},
                emailServiceForLA = new MockEmailService([{ manager:logisticAgentData,scope:'LogisticAgent'}]),
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(emailServiceForLA.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login Logistic Agent'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, logisticAgentData.email, 'Logistic Agent login username is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailServiceForLA)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                emailServiceForLA = new MockEmailService([{ manager:logisticAgentData,scope:'LogisticAgent'}]),
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(emailServiceForLA.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.password = 'password';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'LogisticAgent login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailServiceForLA)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                emailServiceForLA = new MockEmailService([{ manager:logisticAgentData,scope:'LogisticAgent'}]),
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(emailServiceForLA.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'sushant@cronj.com';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'LogisticAgent login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailServiceForLA)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                emailServiceForLA = new MockEmailService([{ manager:logisticAgentData,scope:'LogisticAgent'}]),
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(emailServiceForLA.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'sushant@cronj.com';
                    req.payload.password = 'password';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'LogisticAgent login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailServiceForLA)(req, firstCreateLogisticAgentReply);
        });

    });

    describe('Login HotelManager', function() {
        it('should login hotel manager', function(done) {
            var req = {},
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
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
                    req.payload = {};
                    req.payload.username = hotelManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(user) {
                    assert.equal(user.username, hotelManagerData.email, 'Hotel Manager login username is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login hotel manager with invalid password', function(done) {
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
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
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
                    req.payload = {};
                    req.payload.username = hotelManagerData.email;
                    req.payload.password = 'password123';
                    LoginUser.login(database, config)(req, fourthLoginReply);
                },
                fourthLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Hotel Manager login failure error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login hotel manager with invalid username', function(done) {
            var req = {},
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
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
                    req.payload = {};
                    req.payload.username = hotelManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.username = 'karan@cronj.com';
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fourthLoginReply);
                        }
                    });
                },
                fourthLoginReply = function(status) {
                    assert.equal(status.output.payload.message, 'Invalid User Name and Password', 'Hotel Manager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login hotel manager with invalid username and password', function(done) {
            var req = {},
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                                testCaseName: 'should login hotel manager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
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
                    req.payload = {};
                    req.payload.username = 'karan@cronj.com';
                    req.payload.password = 'password123';
                    LoginUser.login(database, config)(req, fourthLoginReply);

                },
                fourthLoginReply = function(status) {
                    assert.equal(status.output.payload.message, 'Invalid User Name and Password', 'Hotel Manager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);

        });
    });
    describe('Login  HotelUser', function() { 
        it('should login hotel user', function(done) {
            var req = {},
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                emailServiceForHotel = new MockEmailService([{ manager:hotelManagerData,scope:'HotelManager'},{manager:hotelUserData[0], scope:'HotelUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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

     describe('Login  SupplierManager', function() { 
    it('should login supplier manager', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier manager'} + err.message);
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
                    req.payload.username = supplierManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier manager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fifthLoginReply);
                        }
                    });
                },
                fifthLoginReply = function(user){
                    assert.equal(user.username, supplierManagerData.email, 'Supplier email is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
        
        it('should fail login supplier manager due to invalid password', function(done) {
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
                            logger.error({filePath: __filename}, {testCaseName: 'should fail login supplier manager due to invalid password'} + err.message);
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
                    req.payload.username = supplierManagerData.email;
                    req.payload.password = 'sm1234';
                    LoginUser.login(database, config)(req, fifthLoginReply);
                },
                fifthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier Manager login failure error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login supplier manager due to invalid username', function(done) {
            var req = {},
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail login supplier manager due to invalid username'} + err.message);
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
                    req.payload.username = supplierManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail login supplier manager due to invalid username'} + err.message);
                        } else {
                            req.payload.username = "sushant@cronj.com";
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, fifthLoginReply);
                        }
                    });
                },
                fifthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier Manager login failure error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });

        it('should fail login supplier manager due to invalid password and username', function(done) {
            var req = {},
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(emailServiceForZM.hasBeenCalled(), 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail login supplier manager due to invalid password and username'} + err.message);
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
                    req.payload.username = "sushant@cronj.com";
                    req.payload.password = 'sm1234';
                    LoginUser.login(database, config)(req, fourthLoginReply);
                },
                fourthLoginReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Supplier Manager login failure error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceForZM)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Login  SupplierUser', function() { 
        it('should login supplier user', function(done) {
            var req = {},
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
                emailServiceForSupplier = new MockEmailService([{ manager:supplierManagerData,scope:'SupplierManager'},{manager:supplierUserData[0], scope:'SupplierUser'}]),
                emailServiceForZM = new MockEmailService([{ manager:zoneManagerData,scope:'ZoneManager'}]),
                authToken,
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
});