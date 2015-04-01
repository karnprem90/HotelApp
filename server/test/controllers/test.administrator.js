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
    getAdministratorController = require('../../controller/administrator'),
    Login = require('../../controller/login'),
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    logger = require('../../config/logger').logger,
    constants = require('../../Utility/constants').constants,
    db;

describe('Administrator Controller Tests', function() {
    var database,
        sentEmailCalled = false,
        adminLoginData = testCommon.commonAdministratorLogin(),
        emailService = {
            sentMail: function(user, email, config){
                assert.equal(user.username, adminLoginData.username, 'username is not what is expected');
                assert.equal(user.scope, 'Admin', 'scope is not what is expected');
                assert.equal(email, adminLoginData.username, 'email is not what is expected');
                sentEmailCalled = true;
            }
        };

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
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

    describe('Administrator Registration', function() {

        it('should stop new admin registration when admin already exists', function(done) {
            var req = {},
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));

                    getAdministratorController.createAdmin(database, config, emailService)(req, secondCreateAdminReply);
                },
                secondCreateAdminReply = function(err) {
                    assert.equal(err.message, 'You are unauthorized to perform this operation', 'Administrator creation failure status is not what is expected');
                    assert.isFalse(sentEmailCalled, 'SentMail has been called even when the error occurred');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });

        it('should successfully register new admin', function(done) {
            var req = {},
                createAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, createAdminReply);
        });
    });

    describe('Administrator Login ', function() {

        it('should successfully login', function(done) {
            var req = {},
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });

        it('should login fail due to invalid username', function(done) {
            var req = {},
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    req.payload.username = 'sushant@cronj.com';

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'Administrator login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });

        it('should login fail due to invalid password', function(done) {
            var req = {},
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    req.payload.password = 'password';

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'Administrator login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });
    });

    describe('Administrator Get Details', function() {
        it('should successfully get admin details', function(done) {
            var req = {},
                authToken,
                firstCreateAdminReply = function(user) {
                    assert.equal(user, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    authToken = user.token;
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getAdministratorController.getAdmin(database, config)(req, thirdGetAdminreply);
                },
                thirdGetAdminreply = function(admin) {
                    assert.equal(admin.alertEmail[0], adminLoginData.alertEmail[0], 'Administrator alertEmail is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });

        it('should fail to get admin details', function(done) {
            var req = {},
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();

                    getAdministratorController.getAdmin(database, config)(req, thirdGetAdminreply);
                },
                thirdGetAdminreply = function(admin) {
                    assert.equal(admin.output.payload.message, 'Not Found', 'Get Administrator data is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });
    });

    describe('Administrator Update', function() {
        it('should Successfully update admin', function(done) {
            var req = {},
                authToken,
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    authToken = user.token;
                        req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getAdministratorController.getAdmin(database, config)(req, thirdGetAdminreply);
                },
                thirdGetAdminreply = function(admin) {
                    assert.equal(admin.alertEmail[0], adminLoginData.alertEmail[0], 'Administrator alertEmail is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(admin));
                    req.payload.alertPhone[0] = ["1236589740"];
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getAdministratorController.updateAdmin(database, config)(req, fourthUpdateAdminReply);
                },
                fourthUpdateAdminReply = function(admin) {
                    assert.equal(admin.alertPhone[0], ["1236589740"], 'Updated administrator alertEmail is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);
        });

        it('should fail admin updation', function(done) {

            var req = {},
                authToken,
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));

                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getAdministratorController.getAdmin(database, config)(req, thirdGetAdminreply);
                },
                thirdGetAdminreply = function(admin) {
                    assert.equal(admin.alertEmail[0], adminLoginData.alertEmail[0], 'Administrator alertEmail is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(admin));
                    req.payload.alertPhone[0] = ["abc"];
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getAdministratorController.updateAdmin(database, config)(req, fourthUpdateAdminReply);

                },
                fourthUpdateAdminReply = function(result) {
                    assert.equal(result.isBoom, true, 'Updated administrator failure error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailService)(req, firstCreateAdminReply);

        });
    });
});