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
    getUserModel = require('../../model/user.js').getModel,
    Login = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('ZoneManager Controller Tests', function() {
    var database,
        zoneManagerData = testCommon.commonzoneManagerData(),
        User,
        sentEmailCalled = false,
        emailService = {
            sentMail: function(user, email, config){
                assert.equal(user.username, zoneManagerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'ZoneManager', 'scope is not what is expected');
                assert.equal(email, zoneManagerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            }
        };

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
            sentEmailCalled = false;
            done();
        });  
    });

    describe('ZoneManager Registration', function() { 
        it('should register new zonemanager', function(done) {
            var req = {},
            firstZoneCreateReply = function(status) {
                assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                done();
            };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstZoneCreateReply);
        });

        it('should stop register new zonemanager', function(done) {
            var req = {},
            firstZoneCreateReply = function(status) {
                assert.equal(status.message, 'Validation failed', 'Zone Manager creation status is not what is expected');
                assert.isFalse(sentEmailCalled, 'SentMail has been called');
                done();
            };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            req.payload.firstname = '';
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstZoneCreateReply);
        });
    });
    
   describe('ZoneManager Login', function() { 
        it('should login zonemanager', function(done) {
            var req = {},
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone manager login username is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    req.payload.password = 'hm1234';
                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zonemanager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should login zoneManager'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username = "karan@cronj.com";
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });

                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zone manager login failure error is not what is expected');
                    done();
                };

           req.payload = JSON.parse(JSON.stringify(zoneManagerData));
           getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
             var req = {},
                  firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                      assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'karan@cronj.com';
                    req.payload.password = 'hm1234';
                    Login.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Zonemanager login failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

    });

    describe('Get ZoneManager', function() { 
        it('should get zonemanager', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get zonemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getZoneManagerController.getZoneManager(database, config)(req, thirdZoneManagerReply);
                },
                thirdZoneManagerReply = function(zonemanager){
                    assert.equal(zonemanager.firstname, zoneManagerData.firstname, 'Get Zone Manager failue error is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });
        it('should fail to get zonemanager', function(done) {
            var req = {},
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get zonemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getZoneManagerController.getZoneManager(database, config)(req, thirdZoneManagerReply);
                },
                thirdZoneManagerReply = function(zonemanager){
                    assert.equal(zonemanager.output.payload.message, 'Not Found', 'Get Zone Manager failue error is not what is expected');
                    done();
                }
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });      
    });

   describe('Update ZoneManager', function() { 
        it('should Successfully update zonemanager', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should Successfully update zonemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getZoneManagerController.getZoneManager(database, config)(req, thirdCreateZoneManagerReply);
                },
                thirdCreateZoneManagerReply = function(zonemanager){
                    assert.equal(zonemanager.firstname, zoneManagerData.firstname, 'Get Zone Manager firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zonemanager));
                    req.payload.preferedLanguage ='addadd';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getZoneManagerController.updateZoneManager(database, config)(req, fourthCreateZoneManagerReply);
                },
                fourthCreateZoneManagerReply = function(zonemanager){
                    assert.equal(zonemanager.preferedLanguage, 'addadd', 'Update preferedLanguage firstname is not what is expected');
                    done(); 
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });
       it('should fail to update zonemanager', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should Successfully update zonemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getZoneManagerController.getZoneManager(database, config)(req, thirdCreateZoneManagerReply);
                },
                thirdCreateZoneManagerReply = function(zonemanager){
                    assert.equal(zonemanager.firstname, zoneManagerData.firstname, 'Get Zone Manager firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zonemanager));
                    req.payload.preferedLanguage ='';
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getZoneManagerController.updateZoneManager(database, config)(req, fourthCreateZoneManagerReply);
                },
                fourthCreateZoneManagerReply = function(error){
                    assert.equal(error.output.payload.message, 'ValidationError: Path `preferedLanguage` is required.', 'Update Zone Manager error message is not what is expected');
                    done(); 
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });      
    });
});