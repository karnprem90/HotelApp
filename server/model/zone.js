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
var autoIncrement = require('mongoose-auto-increment'),
    validator = require('mongoose-validators'),
    constants = require('../Utility/constants').constants;
var getModel;
/**
 * @module  Zone
 * @description contain the details of Zone and Zone Manager
*/

getModel = function(database){
  autoIncrement.initialize(database.connection);
  if(typeof database.Zone === 'undefined'){
    var ZoneSchema = new database.Schema({

      /** 
        Zone Id. It can only contain string, is required field and should be unique.
      */

      _id: {
          type: String,
          unique: true,
          required: true
      },

      /** 
        Zone Name. It can only contain string, is required field.
      */

      zoneName: {
          type: String,
          required: true,
          validate:[validator.matches(constants.nameRegex)]
      },

      /** 
          IsActive. It contain boolean for active user.
      */

      isActive: {
          type: Boolean,
          default: true
      },

      /** 
        Date Of Creation. It can only contain date, is required field..
      */

      dateOfCreation: {
          type: Date
      }

    });

      /** 
        getById. return the zone object with the match their id from a userId.
        @param userId: userId of the user.
        @param callback: callback of this form.
      */
      ZoneSchema.statics.getById = function(userId, callback) {
          this.findOne({
              _id: userId
          }, callback);
      };

      /** 
        getAll. return the zone object with the match their id from a userId.
        @param userId: userId of the user.
        @param callback: callback of this form.
      */
      ZoneSchema.statics.getAllZone = function(callback) {
          this.find({}, callback);
      };

      /** 
        saveZone. save zone with their request data.
        @param zone: contains value of requested data.
        @param callback: callback of this form.
      */
      ZoneSchema.statics.createZone = function(data, callback) {
          var zone = new this(data);
          zone.save(callback);
      };

      /** 
        saveZone. save zone with their request data.
        @param zone: contains value of requested data.
        @param callback: callback of this form.
      */
      ZoneSchema.statics.updateZone = function(zone, callback) {
          zone.save(callback);
      };

      database.Zone = database.model('zone',ZoneSchema);
      ZoneSchema.plugin(autoIncrement.plugin, {
        model: 'zone',
        field: '_id'
      });
  }
      return database.Zone;
};





/** export schema */
module.exports.getModel = getModel;