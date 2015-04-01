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
    getUserModel = require('../../model/user.js').getModel,
    getUserController = require('../../controller/user'),
    getCustomerController = require('../../controller/customer'),
    testCommon = require('../test.commonHelper'),
    Login = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    constants = require('../../Utility/constants').constants,
    config = require('../../config/config')[env];


describe('User Controller Tests', function() {
    var database,
        User,
        oldPassword,
        db,
        customerData = testCommon.commonCustomerData(),
        sentEmailCalled = false,
        emailService = {
            sentPasswordMail: function(email, password, config){
                assert.equal(email, customerData.email, 'username is not what is expected');
                assert.isNotNull(password, 'password is Null');
                sentEmailCalled = true;
            }
        },
        emailServiceCustomer = {
            sentMail: function(user, email, config){
                assert.equal(user.username, customerData.email, 'username is not what is expected');
                assert.equal(user.scope, 'Customer', 'scope is not what is expected');
                assert.equal(email, customerData.email, 'email is not what is expected');
                sentEmailCalled = true;
            }
        };
    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            User = getUserModel(mongoose, db);
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

    describe('Update password', function() { 
        it('should  update password', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    req.payload = {};
                    req.payload.username = customerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update password'} + err.message);
                        } else {
                            req.payload.password = oldPassword = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, customerData.email, 'Customer login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.username = customerData.email;
                    req.payload.oldpassword = oldPassword;
                    req.payload.newpassword = 'customer'; 
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getUserController.update(database, config)(req, thirdPasswordReply);
                },
                thirdPasswordReply = function(user){
                    assert.equal(user, 'password Successfully updated', 'User password succesfull update message is not what is expected');
                    done();
                }
            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceCustomer)(req, firstCreateCustomerReply);
        });

        it('should fail to update password', function(done) {
            var req = {},
                authToken,
                firstCreateCustomerReply = function(status){
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    req.payload = {};
                    req.payload.username = customerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update password'} + err.message);
                        } else {
                            req.payload.password = oldPassword = CryptoPwd.decrypt(res.password, config);
                            Login.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user){
                    assert.equal(user.username, customerData.email, 'Customer login username is not what is expected');
                    authToken = user.token;
                    req.payload = {};
                    req.payload.username = customerData.email;
                    req.payload.oldpassword = "oldPassword";
                    req.payload.newpassword = 'customer'; 
                    req.headers = {};
                    req.headers.authorization = 'Bearer ' + authToken;
                    getUserController.update(database, config)(req, thirdPasswordReply);
                },
                thirdPasswordReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid old password entered', 'User password failure error message is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceCustomer)(req, firstCreateCustomerReply);
        });
    });

    describe('Resend Password', function() { 
        it('should resend password', function(done) {
            var req = {},
                firstPasswordReply = function(status){
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    req.payload = {};
                    req.payload.username = customerData.email;
                    getUserController.resendPassword(database, config, emailService)(req, secondPasswordReply);
                },
                secondPasswordReply = function(user){
                    assert.equal(user, 'Password is Successfully sent to an email address', 'is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceCustomer)(req, firstPasswordReply);
        });

        it('should fail to resend password', function(done) {
            var req = {},
                firstPasswordReply = function(status){
                    assert.equal(status, constants.successMessage, 'Customer creation status is not what is expected');
                    req.payload = {};
                    req.payload.username = '';
                    getUserController.resendPassword(database, config, emailService)(req, secondPasswordReply);
                },
                secondPasswordReply = function(error){
                    assert.equal(error.output.payload.message, 'Invalid User Name', 'User password resend failure error message is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(customerData));
            getCustomerController.createCustomer(database, config, emailServiceCustomer)(req, firstPasswordReply);
        });
    });
});