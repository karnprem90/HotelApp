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
    getSubCategoryController = require('../../controller/subCategory'),
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

describe('Sub-category Controller Tests', function() {
    var database,
        zoneManagerData = testCommon.commonzoneManagerData(),
        subCategoryData = testCommon.commonSubCategoryData(),
        User,
        sentEmailCalled = false,
        emailServiceZoneManager = {
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

    describe('Create SubCategory', function() { 
        it('should create subcategory', function(done) {
            var req = {},
                firstCreateZoneMananagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should create subcategory'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
            },
            secondLoginZoneManagerReply = function(user) {
                assert.equal(user.username, zoneManagerData.email, 'Zonemanager login username is not what is expected');
                req.payload = JSON.parse(JSON.stringify(subCategoryData));
                getSubCategoryController.createSubCategory(database, config)(req, thirdCreateSubCategory);
            },
            thirdCreateSubCategory = function(subcategory) {
                assert.equal(subcategory.subCategoryName[0].name, subCategoryData.subCategoryName[0].name, 'Category creation subCategory name is not what is expected');
                done();
            };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneMananagerReply);
        });

        it('should fail to create subcategory', function(done) {
            var req = {},
                firstCreateZoneMananagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should create subcategory'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
            },
            secondLoginZoneManagerReply = function(user) {
                assert.equal(user.username, zoneManagerData.email, 'Zonemanager login username is not what is expected');
                req.payload = JSON.parse(JSON.stringify(subCategoryData));
                req.payload.subCategoryName[0].name = "&hgfgfg566";

                getSubCategoryController.createSubCategory(database, config)(req, thirdCreateSubCategory);
            },
            thirdCreateSubCategory = function(error) {
                assert.equal(error.message, 'Validation failed', 'Category creation failure error is not what is expected');
                done();
            };
            
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneMananagerReply);
        });
    });

    describe('Get SubCategory', function() { 
        it('should get subcategory', function(done) {
            var req = {},
                authToken,
                firstCreateZoneMananagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should create subcategory'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zonemanager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(subCategoryData));

                    getSubCategoryController.createSubCategory(database, config)(req, thirdCreateSubCategory);
                },
                thirdCreateSubCategory = function(subcategory) {
                    assert.equal(subcategory.subCategoryName[0].name, subCategoryData.subCategoryName[0].name, 'Category creation subCategory name is not what is expected');
                    req.params = {};
                    req.params.id = subcategory._id;
                    
                    req.headers = {};
                    req.headers.authorization = "Bearer " + authToken;
                    getSubCategoryController.getSubCategorybyId(database, config)(req,fifthGetSubCategory);
                },
                fifthGetSubCategory = function(subcategory){
                    assert.equal(subcategory.subCategoryName[0].name, subCategoryData.subCategoryName[0].name, "Get subCategory name is not what is expected");
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneMananagerReply);
        });
        
        it('should fail to get subcategory', function(done) {
            var req = {},
                authToken,
                firstCreateZoneMananagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zonemanager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should create subcategory'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zonemanager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(subCategoryData));

                    getSubCategoryController.createSubCategory(database, config)(req, thirdCreateSubCategory);
                },
                thirdCreateSubCategory = function(subcategory) {
                    assert.equal(subcategory.subCategoryName[0].name, subCategoryData.subCategoryName[0].name, 'Category creation subCategory name is not what is expected');
                    req.params = {};
                    req.params.id = 89878;
                    
                    req.headers = {};
                    req.headers.authorization = "Bearer " + authToken;
                    getSubCategoryController.getSubCategorybyId(database, config)(req,fifthGetSubCategory);
                },
                fifthGetSubCategory = function(error){
                    assert.equal(error.output.payload.message, 'Not Found', "Get subCategory failure error is not what is expected");
                    done();
                };

            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneMananagerReply);
        });

    });

});