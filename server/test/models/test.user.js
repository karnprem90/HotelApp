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
    logger = require('../../config/logger').logger,
   testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    Helper = require('../../Utility/helper'),
    config = require('../../config/config')[env],
    db;

describe('User Model Tests', function() {
    var database,
        User,
        user = testCommon.commonUserData();
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

    describe(' Create User', function() {
        it('should fail to createUser user with invalid details', function(done) {
            var result = {};
                Helper.updateHelper(user, result);
                result.username = 'Gaurav';
            User.createUser(result, function(error) {
                if (error) {
                    assert.equal(error.message, 'Validation failed', 'is expected');
                    done();
                } 
            });
        });

        it('createUser user', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'createUser user'}, error);
                } else {
                    assert.equal(result.username, user.username, 'is not expected');
                    done();
                }
            });
        });
    });

    describe('Get User By Id', function() {
        it('should get user by id', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get user by id'}, error);
                } else {
                    User.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get user by id'}, err);
                        } else {
                            assert.equal(res.username, user.username, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get User By Scope', function() {
        it('should user get by username', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should user get by username'}, error);
                } else {
                    User.getByUserName(result.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should user get by username'}, err);
                        } else {
                            assert.equal(res.username, user.username, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

         it('should fail to get by username', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get by username'}, error);
                } else {
                    result.username= 899;
                    User.getByUserName(result.username, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get by username'}, err);
                        } else {
                            assert.equal(res, null, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('Get User By Scope', function() {
        it('should get user by scope ', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should get user by scope'}, error);
                } else {
                    User.getByScope(result.scope, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get user by scope'}, err);
                        } else {
                            assert.equal(res[0].scope, user.scope, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get user by scope ', function(done) {
            User.createUser(user, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should fail to get user by scope'}, error);
                } else {
                    result.scope = 'afafa';
                    User.getByScope(result.scope, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get user by scope'}, err);
                        } else {
                            assert.equal(res.length, 0, 'is not expected');
                            done();
                        }
                    });
                }
            });
        });
    });   
});
