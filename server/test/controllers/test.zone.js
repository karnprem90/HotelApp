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
    getUserModel = require('../../model/user').getModel,
    getZoneManagerController = require('../../controller/zoneManager'),
    LoginUser = require('../../controller/login'),
    CryptoPwd = require('../../Utility/thvcryptolib'),
    getZoneController = require('../../controller/Zone'),
    logger = require('../../config/logger').logger,
    testCommon = require('../test.commonHelper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    constants = require('../../Utility/constants').constants,
    db;

describe('Zone Controller Tests', function() {
    var database,
        zoneData = testCommon.commonZone(),
        zoneManagerData = testCommon.commonzoneManagerData(),
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


    describe('Create Zone', function() {
        it('should create  zone', function(done) {
            var req = {},
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
                                testCaseName: 'should create zone'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zoneData));
                    getZoneController.createZone(database, config)(req, thirdCreateZoneReply);
                },
                thirdCreateZoneReply = function(zone) {
                    assert.equal(zone.zoneName, zoneData.zoneName, 'Zone creation zonename is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneManagerReply);
        });

        it('should fail to create zone', function(done) {
            var req = {},
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
                                testCaseName: 'should fail to create zone'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginZoneManagerReply);
                        }
                    });
                },
                secondLoginZoneManagerReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.payload = '';
                    getZoneController.createZone(database, config)(req, thirdCreateZoneReply);
                },
                thirdCreateZoneReply = function(zone) {
                    assert.equal(zone.message, 'Validation failed', 'Zone creation zonename is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstCreateZoneManagerReply);
        });
    });

    describe('Get Zone List', function() {
        it('get zone list', function(done) {
            var req = {},
                firstZoneListReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'get zone list'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    req.payload = JSON.parse(JSON.stringify(zoneData));
                    getZoneController.createZone(database, config)(req, thirdCreateZoneReply);
                },
                thirdCreateZoneReply = function(zone) {
                    assert.equal(zone.zoneName, zoneData.zoneName, 'Create zone name is not what is expected');
                    getZoneController.getZoneList(database)(req, fourthGetZoneListReply);
                },
                fourthGetZoneListReply = function(zone) {
                    assert.equal(zone[0].zoneName, zoneData.zoneName, 'get zone list, zone name is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstZoneListReply);
        });

        it('should fail get zone list', function(done) {
            var req = {},
                firstZoneListReply = function(status) {
                    assert.equal(status, constants.successMessage, 'Zone Manager creation status is not what is expected');
                    assert.isTrue(sentEmailCalled, 'SentMail has not been called');
                    req.payload = {};
                    req.payload.username = zoneManagerData.email;
                    User.getByUserName(req.payload.username, function(err, res) {
                        if (err) {
                            logger.error({
                                filePath: __filename
                            }, {
                                testCaseName: 'should fail get zone list'
                            } + err.message);
                        } else {
                            req.payload.password = CryptoPwd.decrypt(res.password, config);
                            LoginUser.login(database, config)(req, secondLoginReply);
                        }
                    });
                },
                secondLoginReply = function(user) {
                    assert.equal(user.username, zoneManagerData.email, 'Zone Manager login username is not what is expected');
                    getZoneController.getZoneList(database)(req, thirdCreateZoneReply);
                },
                thirdCreateZoneReply = function(zone) {
                    assert.equal(zone.length, 0, 'Create zone length is not what is expected');
                    done();
                };
            req.payload = JSON.parse(JSON.stringify(zoneManagerData));
            getZoneManagerController.createZoneManager(database, config, emailServiceZoneManager)(req, firstZoneListReply);
        });
    });
});