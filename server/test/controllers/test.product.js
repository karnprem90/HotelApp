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
    getProductController = require('../../controller/product'),
    getUserModel = require('../../model/user.js').getModel,
    getZoneManagerController = require('../../controller/zoneManager'),
    getExecutiveManagerController = require('../../controller/executiveManager'),
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('product Controller Tests', function() {
    var database,
        productData = testCommon.commonProductData(),
        zoneManagerData = testCommon.commonzoneManagerData(),
        executiveManagerData = testCommon.commonExecutiveManagerData(),
        User,
        sentEmailCalled = false,
        emailService = {
            managerData : zoneManagerData,
            sentMail: function(user, email, config){
                assert.equal(user.username, emailService.managerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'ExecutiveManager', 'scope is not what is expected');
                assert.equal(email, emailService.managerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            },
            sentProductMail: function(product, email, config){
                assert.equal(product.supplierId, productData.supplierId, 'supplierID is not what is expected');
                assert.equal(product.name, productData.name, 'name is not what is expected');
                assert.equal(product.costPrice, productData.costPrice, 'costPrice is not what is expected');
                assert.equal(product.retailPrice, productData.retailPrice, 'retailPrice is not what is expected');
                assert.isDefined(email, 'No executive email address has been found in all executive manager');
                assert.equal(email,executiveManagerData.email,  'executive email address is not what is expected');
                sentEmailCalled = true;
            }
        },
        emailServiceZoneManager = {
            sentMail: function(user, email, config){
                assert.equal(user.username, zoneManagerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'ZoneManager', 'scope is not what is expected');
                assert.equal(email, zoneManagerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            }
        },
        emailServiceExecutiveManager = {
             managerData : executiveManagerData,
            sentMail: function(user, email, config){
                assert.equal(user.username, emailServiceExecutiveManager.managerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'ExecutiveManager', 'scope is not what is expected');
                assert.equal(email, emailServiceExecutiveManager.managerData.email, 'email is not what is expected');
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
            emailService.managerData = zoneManagerData;
            done();
        });
    });

    describe('Create Product', function() { 
        it('should create product', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceExecutiveManager)(req, firstCreateExecutiveManagerReply);

        });

        it('should fail to create product due to missing retail price', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));
                    delete req.payload.retailPrice;         
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid request', 'Product creation failure error message is not what expected');
                    assert.isFalse(sentEmailCalled, 'SentMail has been called');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceExecutiveManager)(req, firstCreateExecutiveManagerReply);
        });      
    });

    describe('Get All ProductList', function() { 
        it('should get productlist', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    getProductController.getProductList(database)(req, fifthGetProductListReply);
                },
                fifthGetProductListReply = function(product){
                    assert.equal(product[0].name, productData.name, 'Get Product List, name is not what expected');
                    done();
                };
        
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceExecutiveManager)(req, firstCreateExecutiveManagerReply);
        });    
    });

    describe('Get Product', function() { 
        it('should get product', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    getProductController.getProductList(database)(req, fifthGetProductListReply);
                },
                fifthGetProductListReply = function(product){
                    assert.equal(product[0].name, productData.name, 'Get Product List, name is not what expected');
                    req.params = {};
                    req.params.id = product[0]._id;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.getProduct(database, config)(req, sixthGetProductReply);
                },
                sixthGetProductReply = function(product){
                    assert.equal(product.name, productData.name, 'Get Product, name is not what expected');
                    done();
                };
            
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceExecutiveManager)(req, firstCreateExecutiveManagerReply);
        });  

        it('should fail to get product', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    getProductController.getProductList(database)(req, fifthGetProductListReply);
                },
                fifthGetProductListReply = function(product){
                    assert.equal(product[0].name, productData.name, 'Get Product List, name is not what expected');
                    req.params = {};
                    req.params.id = 60001;
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.getProduct(database, config)(req, sixthGetProductReply);
                },
                sixthGetProductReply = function(error){
                    assert.equal(error.output.payload.message, 'Not Found', 'Get Product failue error message is not what expected');
                    done();
                };
            
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            getExecutiveManagerController.createExecutiveManager(database, config, emailServiceExecutiveManager)(req, firstCreateExecutiveManagerReply);
        });  
    });

    describe('Update Product', function() { 
        it('should update product', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status){
                    emailService.managerData = zoneManagerData;
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    getProductController.getProductList(database)(req, fifthGetProductListReply);
                },
                fifthGetProductListReply = function(product){
                    assert.equal(product[0].name, productData.name, 'Get Product List, name is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            emailService.managerData = executiveManagerData;
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
            
        }); 

        it('should fail to  update product', function(done) {
            var req = {},
                authToken,
                firstCreateExecutiveManagerReply = function(status){
                    emailService.managerData = zoneManagerData;
                    assert.equal(status, constants.successMessage, 'Executive Manager creation status is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zoneManagerData));
                    getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, secondCreateZoneManagerReply);
                },
                secondCreateZoneManagerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    sentEmailCalled = false;
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should login supplier user'} + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, thirdLoginReply);
                        }
                    });
                },
                thirdLoginReply = function(user){
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    authToken = user.token;
                    req.payload = JSON.parse(JSON.stringify(productData));            
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    emailService.managerData = executiveManagerData;
                    getProductController.createProduct(database, config, emailService)(req, fourthCreateProductReply);
                
                },
                fourthCreateProductReply = function(status){
                    assert.equal(status, constants.successMessage, 'Product creation message is not what expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    getProductController.getProductList(database)(req, fifthGetProductListReply);
                },
                fifthGetProductListReply = function(product){
                    assert.equal(product[0].name, productData.name, 'Get Product List, name is not what expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(executiveManagerData));
            emailService.managerData = executiveManagerData;
            getExecutiveManagerController.createExecutiveManager(database, config, emailService)(req, firstCreateExecutiveManagerReply);
            
        });  
    });
    
});