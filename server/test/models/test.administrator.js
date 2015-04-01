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
    getAdministratorModel = require('../../model/administrator.js').getModel,
    testCommon = require('../test.commonHelper'),
    logger = require('../../config/logger').logger,
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Administrator Model Tests', function() {
    var database,
        Administrator,
        administrator = testCommon.commonAdministrator();

    before(function(done) {
        mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error'));
        db.once('open', function callback() {
            Administrator = getAdministratorModel(mongoose, db);
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
    
    describe('Administrator Model Register', function() { 
        it('should create admin', function(done) {        
            Administrator.createAdmin(administrator, function(error, result) {
                if (error) {
                    logger.error(error);
                } else {
                    assert.equal(result.alertEmail[0], administrator.alertEmail[0], 'Administrator creation, alertEmail is not what is expected');
                    done();
                }
            });
        });

        it('should fail to create administrator with invalid details', function(done) {
            var result = JSON.parse(JSON.stringify(administrator));
            result.alertEmail = ['dgjjgj'];
            Administrator.createAdmin(result, function(error) {
                    assert.equal(error.message, 'Validation failed', 'Administrator creation failure, error message is not what is expected');
                    done();
            });
        });
    });
        
    describe('Administrator Update', function() {
        it('should update by id', function(done) {
            Administrator.createAdmin(administrator, function(error, result) {
                if (error) {
                    logger.error({filePath: __filename}, {testCaseName: 'should update by id'} + error.message);
                } else {
                    result.alertEmail[0] = "mukund@cronj.com"; 
                    Administrator.updateAdmin(result, function(err, result) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should update by id'} + err.message);
                        } else {
                            assert.equal(result.alertEmail[0], 'mukund@cronj.com', 'Administrator update, alertEmail is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to  update administrator with invalid details', function(done) {
            Administrator.createAdmin(administrator, function(error, result) {
                if (error) {
                    logger.error(error);
                }
                else {
                    result.alertEmail = ['9874abc569870'];
                    Administrator.updateAdmin(result, function(err) {
                        assert.equal(err.message, 'Validation failed', 'Administrator update failure, error message is not what is expected');
                        done();
                    });
                }
            });
        });
    }); 

    describe('Get Administrator', function() {
        it('should get by id', function(done) {        
            Administrator.createAdmin(administrator, function(error, result) {
                if (error) {
                    logger.error(error.message);
                } else {
                    Administrator.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should get by id'} , 'User not found.');
                        } else {
                            assert.equal(res.alertEmail[0], administrator.alertEmail[0], 'Administrator Get by Id, alertEmail is not what is expected');
                            done();
                        }
                    });
                }
            });
        });

        it('should fail to get administrator by id', function(done) {        
            Administrator.createAdmin(administrator, function(error, result) {
                if (error) {
                    logger.error(error.message);
                } else {
                    result._id = 500010;
                    Administrator.getById(result._id, function(err, res) {
                        if (err) {
                            logger.error({filePath: __filename}, {testCaseName: 'should fail to get administrator by id'} , 'User not found.');
                        } else {
                            assert.equal(res, null, 'Administrator Get by Id failure, error is not what is expected');
                            done();
                        }
                    });
                }
            });
        });
    });
});