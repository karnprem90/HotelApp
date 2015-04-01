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
    getZoneModel = require('../model/zone').getModel,
    Helper = require('../Utility/helper'),
    logger = require('../config/logger').logger;


//to create Zone

/**
   POST: /createZone
   Input: request.payload is the zone data to create zone
 */

exports.createZone = function(database) {
    return function(request, reply) {
        var Zone = getZoneModel(database);
        Zone.createZone(request.payload, function(err, result) {
            if (err) {
                logger.error({filePath: __filename}, {functionName: 'createZone'}, 'error in create zone');
                return reply(err); // HTTP 403
            } 

            reply(result); //HTTP 200 
        });
    };
};

//to get Zone List

/**
   GET: /getZoneList
 */

exports.getZoneList = function(database) {
    return function(request, reply) {
        var Zone = getZoneModel(database);
        Zone.getAllZone(function(err, user) {
            if (!err) {
                if (user === null) {
                    logger.error({filePath: __filename}, {functionName: 'getZoneList'}, 'No such Zone exist.');
                    reply(Boom.notFound('Not Found')); // HTTP 404
                }
                else{
                    reply(user); //HTTP 200
                }
            } else {
                logger.error({filePath: __filename}, {functionName: 'getZoneList'}, 'error in get zone list');
                reply(Boom.badImplementation(err)); // HTTP 500
            }
        });
    };
};

//to update Zone

/**
   PUT: /updateZoneName
   Input: request.payload is the zone data to update zone name
 */

exports.updateZoneName = function(database, config) {
    return function(request, reply) {
        var Zone = getZoneModel(database);
        Jwt.verify(request.headers.authorization.split(' ')[1], config.key.privateKey, function(err, decoded) {
            Zone.getById(decoded.zone, function(err, zone) {
                if (zone === null) {
                    logger.error({filePath: __filename}, {functionName: 'updateZoneName'}, 'No such zone exist');
                    return reply(Boom.forbidden('No such zone exist')); // HTTP 403
                }
                Helper.updateHelper(request.payload, zone);
                Zone.updateZone(zone, function(err, zone) {
                    if (!err) {
                        reply(zone); // HTTP 200
                    } else {
                        logger.error({filePath: __filename}, {functionName: 'updateZoneName'}, 'error in update zone name');
                        reply(Boom.forbidden(err)); // HTTP 403

                    }
                });
            });
        });
    };
};
