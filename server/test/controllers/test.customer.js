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
    getCustomerController = require('../../controller/customer'),
    testCommon = require('../test.commonHelper'),
    getUserModel = require('../../model/user.js').getModel,
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('customer controller tests', function() {
    var database,
        customerData = testCommon.commonCustomerData(),
        sentEmailCalled = false,
        emailService = {
            sentMail: function(user, email, config){
                assert.equal(user.username, customerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'Customer', 'scope is not what is expected');
                assert.equal(email, customerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            }
        },
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
            sentEmailCalled = false;
            done();
        });
    });

    describe('Customer Registration', function() {
        it('should register new customer', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));

            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should stop register new customer', function(done) {

            var req = {},
                firstCreateCustomerReply = function(error) {
                    assert.equal(error.message, 'Validation failed', 'Customer creation error message is not what is expected');
                    assert.isFalse(sentEmailCalled, 'SentMail has been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));
            req.payload.firstname = '';

            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });
    });

    describe('Customer Login', function() {
        it('should login customer', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
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
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });
    });

    describe('Get Customer', function() {
        it('should get customer', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getCustomerController.getCustomer(database, config)(req, thirdGetCustomerReply);
                },
                thirdGetCustomerReply = function(customer) {
                    assert.equal(customer.firstname, customerData.firstname, 'Get Customer firstname is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should fail to get customer', function(done) {
            var req = {},
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                    var req = {};
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();

                    getCustomerController.getCustomer(database, config)(req, thirdGetCustomerReply);
                },
                thirdGetCustomerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get Customer failue error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });
    });

    describe('Get All Customer', function() {
        it('should get all customer list', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCustomerController.getAllCustomer(database, config)(req, thirdGetCustomerReply);

                },
                thirdGetCustomerReply = function(customers) {
                    assert.equal(customers[0].firstname, customerData.firstname, 'Get Customer firstname is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });
    });


    describe('Update Customer', function() {
        it('should Successfully update customer', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCustomerController.getCustomer(database, config)(req, thirdGetCustomerReply);

                },
                thirdGetCustomerReply = function(customer) {
                    assert.equal(customer.firstname, customerData.firstname, 'Get Customer firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(customer));
                    req.payload.preferedLanguage = 'addadd';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCustomerController.updateCustomer(database, config)(req, fourthUpdateCustomerReply);
                },
                fourthUpdateCustomerReply = function(customer) {
                    assert.equal(customer.preferedLanguage, 'addadd', 'Update preferedLanguage firstname is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });

        it('should fail to update customer', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCustomerController.getCustomer(database, config)(req, thirdGetCustomerReply);

                },
                thirdGetCustomerReply = function(customer) {
                    assert.equal(customer.firstname, customerData.firstname, 'Get Customer firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(customer));
                    req.payload.preferedLanguage = '';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCustomerController.updateCustomer(database, config)(req, fourthUpdateCustomerReply);
                },
                fourthUpdateCustomerReply = function(error) {
                    assert.equal(error.output.payload.message, 'ValidationError: Path `preferedLanguage` is required.', 'Update Customer error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailService)(req, firstCreateCustomerReply);
        });
    });
});