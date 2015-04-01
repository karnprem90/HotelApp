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
var fs = require('fs'),
    logger = require('./logger').logger,
    file = '../server/secret/secret.json',
    config;

config = {

    development: {
        server: {

            host: '0.0.0.0',
            port: 8000
        },
        database: {
            host: '127.0.0.1',
            port: 27017,
            db: 'THVDevelopement',
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        },

        key: {
            privateKey: '37LvDSm4XvjYOh9Y',
            tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
        },
        email: {
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        }
    },

    production: {
        server: {

            host: '0.0.0.0',
            port: 8000
        },
        database: {
            host: '127.0.0.1',
            port: 27017,
            db: 'THVProduction',
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        },
        key: {
            privateKey: '37LvDSm4XvjYOh9Y',
            tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
        },
        email: {
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        }
    },

    test: {
        server: {

            host: '0.0.0.0',
            port: 8000
        },
        database: {
            host: '127.0.0.1',
            port: 27017,
            db: 'THVTest',
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        },
        key: {
            privateKey: '37LvDSm4XvjYOh9Y',
            tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
        },
        email: {
            username: 'should be filled by secret',
            password: 'should be filled by secret'
        }
    }
};

(function initConfigWithSecret(){
    //fs.readFile(file, 'utf8', function (err, secrets) {
    //    if (err) {
    //        throw(err);
    //    }
    var secrets = fs.readFileSync(file, 'utf8');
    if (secrets){

        secrets = JSON.parse(secrets);

        config.development.database.username = secrets.development.database.username;
        config.development.database.password = secrets.development.database.password;
        config.development.key.privateKey = secrets.development.key.privateKey;
        config.development.email.username = secrets.development.email.username;
        config.development.email.password = secrets.development.email.password;

        config.production.database.username = secrets.production.database.username;
        config.production.database.password = secrets.production.database.password;
        config.production.key.privateKey = secrets.production.key.privateKey;
        config.production.email.username = secrets.production.email.username;
        config.production.email.password = secrets.production.email.password;

        config.test.database.username = secrets.test.database.username;
        config.test.database.password = secrets.test.database.password;
        config.test.key.privateKey = secrets.test.key.privateKey;
        config.test.email.username = secrets.test.email.username;
        config.test.email.password = secrets.test.email.password;

        logger.info('config initialize with secret');
    }//);
})();




module.exports = config;