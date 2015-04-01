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
    Helper = require('../../Utility/helper'),
    env = process.env.NODE_ENV || 'test',
    config = require('../../config/config')[env],
    db;

describe('Common Controller Test', function() {
    var database,
        User;
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
        done();
    });

    it('get country list', function(done) {
        var req = {},
            reply;

        reply = function(countrylist) {
            assert.equal(countrylist[0].name, 'Afghanistan', 'is expected');
            done();
        };

        Helper.getCountryList()(req, reply);
    });

    it('get language list', function(done) {
        var req = {},
            reply;

        reply = function(languagelist) {
            assert.equal(languagelist[0].language, 'Afar', 'is expected');
            done();
        };

        Helper.getLanguageList()(req, reply);
    });
});