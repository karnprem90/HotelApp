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
    getLogisticAgentController = require('../../controller/logisticAgent'),
    getUserModel = require('../../model/user.js').getModel,
    logger = require('../../config/logger').logger,
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('Logistic Agent Controller Tests', function() {
    var database,
        User,
        logisticAgentData = testCommon.commonLogisticAgentData(),
        sentEmailCalled = false,
        emailService = {
            sentMail: function(user, email, config){
                assert.equal(user.username, logisticAgentData.email, 'username is not what is expected');
                assert.equal(user.scope, 'LogisticAgent', 'scope is not what is expected');
                assert.equal(email, logisticAgentData.email, 'email is not what is expected');
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

    describe('LogisticAgent Registration', function() { 
        it('should register new logisticagent', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

        it('should stop register new logisticagent', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(error) {
                    assert.equal(error.message, 'Validation failed', 'Logistic agent creation failue error message is not what is expected');
                    assert.isFalse(sentEmailCalled, 'SentMail has been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            req.payload.firstname = '';
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });
    });
    
    describe('LogisticAgent Login', function() {
        it('should login logisticagent', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({ filePath: __filename }, { testCaseName: 'should login Logistic Agent' } + err.message);
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
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.password = 'password';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'LogisticAgent login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = 'sushant@cronj.com';
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.output.payload.message, 'Invalid User Name and Password', 'LogisticAgent login failure message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'LogisticAgent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

    });

    describe('Get LogisticAgent', function() { 
        it('should get logisticagent', function(done) {
            var req = {},
                authToken,
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({ filePath: __filename }, { testCaseName: 'should login Logistic Agent' } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, logisticAgentData.email, 'Logistic Agent login username is not what is expected');
                    authToken = user.token;
                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getLogisticAgentController.getLogisticAgent(database, config)(req, thirdGetLogisticAgentReply);
                },
                thirdGetLogisticAgentReply = function(logisticagent) {
                    assert.equal(logisticagent.firstname, logisticAgentData.firstname, 'Get Logistic Agent firstname is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });

        it('should fail to get logisticagent', function(done) {
            var req = {},
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({ filePath: __filename }, { testCaseName: 'should login Logistic Agent' } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, logisticAgentData.email, 'Logistic Agent login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getLogisticAgentController.getLogisticAgent(database, config)(req, thirdGetLogisticAgentReply);
                },
                thirdGetLogisticAgentReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get Logistic failue error message is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });      
    });

   describe('Update LogisticAgent', function() { 
        it('should Successfully update logisticagent', function(done) {
          var req = {},
                authToken,
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({ filePath: __filename }, { testCaseName: 'should login Logistic Agent' } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, logisticAgentData.email, 'Logistic Agent login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getLogisticAgentController.getLogisticAgent(database, config)(req, thirdGetLogisticAgentReply);
                },
                thirdGetLogisticAgentReply = function(logisticagent) {
                    assert.equal(logisticagent.firstname, logisticAgentData.firstname, 'Get Logistic Agent firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(logisticagent));
                    req.payload.preferedLanguage ='addadd';                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getLogisticAgentController.updateLogisticAgent(database, config)(req, updateLogisticAgentReply);
                },
                updateLogisticAgentReply = function(logisticagent) {
                    assert.equal(logisticagent.preferedLanguage, 'addadd' , 'Update Logistic Agent preferedLanguage is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
      });

       it('should fail to update logisticagent', function(done) {

            var req = {},
                authToken,
                firstCreateLogisticAgentReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Logistic Agent creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = logisticAgentData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({ filePath: __filename }, { testCaseName: 'should login Logistic Agent' } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, logisticAgentData.email, 'Logistic Agent login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getLogisticAgentController.getLogisticAgent(database, config)(req, thirdGetLogisticAgentReply);
                },
                thirdGetLogisticAgentReply = function(logisticagent) {
                    assert.equal(logisticagent.firstname, logisticAgentData.firstname, 'Get Logistic Agent firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(logisticagent));
                    req.payload.preferedLanguage ='';                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getLogisticAgentController.updateLogisticAgent(database, config)(req, updateLogisticAgentReply);
                },
                updateLogisticAgentReply = function(error) {
                    assert.equal(error.isBoom, true , 'Update Logistic Agent failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(logisticAgentData));
            getLogisticAgentController.createLogisticAgent(database, config, emailService)(req, firstCreateLogisticAgentReply);
        });      
    });
});