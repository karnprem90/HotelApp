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
var Boom = require('boom'),
    Jwt = require('jsonwebtoken'),
    getTabletModel = require('../model/tablet').getModel,
    Mapper = require('../Utility/mapper'),
    logger = require('../config/logger').logger,
    Async = require('async'),
    constants = require('../Utility/constants').constants;


//create Tablet

exports.createTablet= function(database, config, EmailService) {
    return function(request, reply) {
        var Tablet = getTabletModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            var tabletData = Mapper.tablet(request.payload);
            Async.each(tabletData, function (tablet, callback) {
                if(tablet){
                    Tablet.createTablet(tablet, function(err) {
                        if(!err){
                            callback();
                        }
                       else{
                            callback();
                        }   
                    });
                }
            },
            function(err){
                if( err ) {
                  logger.error({filePath: __dirname}, {functionName: 'createTablet'}, err);
                  reply(Boom.forbidden(err)); //HTTP 403
                } else {
                  reply('Successfull');
                }
            });
            
        });
    };
};

//get all tablet created by Administrator

/**
   GET: /getTabletList
 */
exports.getTabletList = function(database, config) {
    return function(request, reply) {
        var Tablet = getTabletModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function() {
            Tablet.getTabletList(function (err, tablet) {
                if (!err) {
                    if (tablet === null) {
                        logger.warn({filePath: __filename}, {functionName: 'getTabletList'}, 'Tablet not found.'); 
                        reply(Boom.notFound('Not Found')); //HTTP 404
                    }
                    else{
                        reply(tablet);//HTTP 200
                    } 
                } else {
                    logger.error({filePath: __filename}, {functionName: 'getTabletList'}, 'error in get all tablet');
                    reply(Boom.badImplementation(err)); // 500 error
                }
            });
        });

    };
};
