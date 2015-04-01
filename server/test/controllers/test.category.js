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
    getCategoryController = require('../../controller/category'),
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    getZoneManagerController = require('../../controller/zoneManager'),
    getUserModel = require('../../model/user.js').getModel,
    CryptoPwd = require('../../Utility/thvcryptolib'),
    LoginUser = require('../../controller/login'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('category controller Tests', function() {
    var database,
        zoneManagerData = testCommon.commonzoneManagerData(),
        categoryData = testCommon.commonCategoryData(),
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

    describe('Create Category', function() {
        it('should create category', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should fail to create category'
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
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    req.payload = JSON.parse(JSON.stringify(categoryData));

                    getCategoryController.createCategory(database, config)(req, thirdCreateCategoryReply);
                },
                thirdCreateCategoryReply = function(category) {
                    assert.equal(category.categoryNames[0].name, categoryData.categoryNames[0].name, 'Category creation name is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

        it('should fail to create category', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should fail to create category'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(categoryData));
                    req.payload.categoryNames[0].name = undefined;
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCategoryController.createCategory(database, config)(req, thirdCreateCategoryReply);
                },
                thirdCreateCategoryReply = function(category) {
                    assert.equal(category.message, 'Validation failed', 'Category creation failure error is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get Category List', function() {
        it('should get categorylist', function(done) {
            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should fail to create category'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(categoryData));
                    authToken = user.token;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCategoryController.createCategory(database, config)(req, thirdCreateCategoryReply);
                },
                thirdCreateCategoryReply = function(category) {
                    assert.equal(category.categoryNames[0].name, categoryData.categoryNames[0].name, 'Category creation name is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCategoryController.getAllCategory(database, config)(req, fourthGetAllCategoryReply);
                },
                fourthGetAllCategoryReply = function(category) {
                    assert.equal(category[0].categoryNames[0].name, categoryData.categoryNames[0].name, 'Get All Category data is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });

        it('should fail to get category list', function(done) {

            var req = {},
                authToken,
                firstCreateZoneManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;

                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should fail to create category'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);

                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;

                    getCategoryController.getAllCategory(database, config)(req, thirdGetAllCategoryReply);
                },
                thirdGetAllCategoryReply = function(category) {
                    assert.equal(category.length, 0, 'Should fail to get all Category data is not what is expected');
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailService)(req, firstCreateZoneManagerReply);
        });
    });

});