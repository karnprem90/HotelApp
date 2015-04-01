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

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

var Hapi = require('hapi'),
    Routes = require('./routes'),
    Moment = require('moment'),
    mongoose = require('mongoose');


var app = {};
app.config = config;

var privateKey = app.config.key.privateKey;
var ttl = app.config.key.tokenExpiry;

var server = Hapi.createServer(app.config.server.host, app.config.server.port, { cors: true });

// Validate function to be injected 
var validate = function(token, callback) {
    // Check token timestamp
    var diff = Moment().diff(Moment(token.iat * 1000));
    if (diff > ttl) {
        return callback(null, false);
    }
    callback(null, true, token);
};
// Plugins
mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);  
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'DB connection error'));
    db.once('open', function callback() {  
    console.log("Connection with database succeeded.");
        server.pack.register([{
        plugin: require('hapi-auth-jwt')
        }], function() {
            server.auth.strategy('token', 'jwt', {
                validateFunc: validate,
                key: privateKey
        });

    server.route(Routes.endpoints(mongoose, config));//, db));
});

server.start(function() {
    console.log('Server started ', server.info.uri);
});
});