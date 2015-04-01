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
    getExecutiveManagerController = require('../../controller/executiveManager'),
    getAdministratorController = require('../../controller/administrator'),
    getUserModel = require('../../model/user.js').getModel,
    LoginUser = require('../../controller/login'),
    getLogisticAgentModel = require('../../model/logisticAgent').getModel,
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('executiveManager Controller Tests', function() {
    var database,
        executiveManagerData = testCommon.commonExecutiveManagerData(),
        adminLoginData = testCommon.commonAdministratorLogin(),
        logisticagent = testCommon.commonLogisticAgentData(),
        LogisticAgent,
        User,
        sentEmailCalled = false,
        emailService = {
            sentMail: function(user, email, config){
                assert.equal(user.username, executiveManagerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'ExecutiveManager', 'scope is not what is expected');
                assert.equal(email, executiveManagerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            }
        },
        emailServiceforAdminCnx = {
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
            User = getUserModel(mongoose);
            LogisticAgent = getLogisticAgentModel(mongoose, db);
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

    describe('ExecutiveManager Registration', function() { 
        it('should register new executivemanager', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should stop register new executivemanager', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(error) {
                    assert.equal(error.message, 'Validation failed', 'Executive Manager creation failure error message is not what is expected');
                    assert.isFalse(sentEmailCalled, 'SentMail has been called');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            req.payload.firstname = '';
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });
    });
    
    describe('ExecutiveManager Login', function() { 
        it('should login executivemanager', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
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
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid password', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
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
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid username', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            req.payload.username ='karan@cronj.com';
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Executive Manager login failure error message is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should login failed due to invalid username and password', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username ='karan@cronj.com';
                    req.payload.password = 'password123';
                    
                    LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                },
                secondLoginExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Invalid User Name and Password', 'Executive Manager login failure error message is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });
    });

    describe('Get ExecutiveManager', function() { 
        it('should get executivemanager', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getExecutiveManager(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(executivemanager) {
                    assert.equal(executivemanager.firstname, executiveManagerData.firstname, 'Get Executive Manager firstname is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should fail to get executivemanager', function(done) {
            var req = {},
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + testCommon.invalidToken();
                    getExecutiveManagerController.getExecutiveManager(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get Executive Manager error message is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });      
    });

    describe('Get All ExecutiveManager', function() { 
        it('should get all executivemanager list', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getExecutiveManagerList(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(executivemanagers) {
                    assert.equal(executivemanagers[0].firstname, executiveManagerData.firstname, 'Get Executive Manager firstname is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        }); 

        it('should not get all executivemanager list', function(done) {
            var req = {},
                authToken,
                firstCreateAdminReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Administrator creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(adminLoginData));
                    LoginUser.login(database, config)(req, secondLoginReply);
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, adminLoginData.username, 'Administrator login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getExecutiveManagerList(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get Executive Manager error message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(adminLoginData));
            getAdministratorController.createAdmin(database, config, emailServiceforAdminCnx)(req, firstCreateAdminReply);
        });    
    });

    describe('Update ExecutiveManager', function() { 
        it('should Successfully update executivemanager', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getExecutiveManager(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(executivemanager) {
                    assert.equal(executivemanager.firstname, executiveManagerData.firstname, 'Get Executive Manager firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(executivemanager));
                    req.payload.preferedLanguage = 'addadd';
                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.updateExecutiveManager(database, config)(req, fourthUpdateExecutiveManagerReply);
                },
                fourthUpdateExecutiveManagerReply = function(executivemanager) {
                    assert.equal(executivemanager.preferedLanguage, 'addadd', 'Update Executive Manager preferedLanguage is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

       it('should fail to update executivemanager', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getExecutiveManager(database, config)(req, thirdGetExecutiveManagerReply);
                },
                thirdGetExecutiveManagerReply = function(executivemanager) {
                    assert.equal(executivemanager.firstname, executiveManagerData.firstname, 'Get Executive Manager firstname is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(executivemanager));
                    req.payload.preferedLanguage = '';
                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.updateExecutiveManager(database, config)(req, fourthUpdateExecutiveManagerReply);
                },
                fourthUpdateExecutiveManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'ValidationError: Path `preferedLanguage` is required.' , 'Update Executive Manager failure error message is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });      
    });    

    describe('Get All LogisticAgent And ZoneManager', function() { 
        it('should not get all Logistic Agent and ZoneManager', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getExecutiveManagerController.getAllLogisticAgentZoneManager(database)(req, thirdGetAllLogisticAgentZoneManagerReply);
                },
                thirdGetAllLogisticAgentZoneManagerReply = function(error) {
                    assert.equal(error.output.payload.message, 'Not Found', 'Get All Logistic Agents and Zone Managers List error message is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });

        it('should get all Logistic Agent and ZoneManager', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = executiveManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login executivemanager'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginExecutiveManagerReply);
                        }
                    });
                },
                secondLoginExecutiveManagerReply = function(user) {
                    assert.equal(user.username, executiveManagerData.email, 'Executive Manager login username is not what is expected');
                    authToken = user.token;                    
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    LogisticAgent.createLogisticAgent(logisticagent, function(error, result) {
                        if (error) {
                            logger.error({filePath: __filename}, {testCaseName: 'should create logisticagent'}, error);
                        } else {
                            getExecutiveManagerController.getAllLogisticAgentZoneManager(database)(req, thirdGetAllLogisticAgentZoneManagerReply);
                        }
                    });
                },
                thirdGetAllLogisticAgentZoneManagerReply = function(LogisticAgentsZoneManagers) {
                    assert.equal(LogisticAgentsZoneManagers.length, 1, 'Get All Logistic Agents and Zone Managers List is not what is expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
        });    
    });
});