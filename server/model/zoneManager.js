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
    Address = require('./address').Address,
    constants = require('../Utility/constants').constants;
var getModel;

/**
 * @module Logistic Agent
 * @description contain the details of Logistic Agent
*/
getModel = function(database){
  autoIncrement.initialize(database.connection);
  if(typeof database.ZoneManager === 'undefined'){
      var ZoneManagerSchema = new database.Schema({

        /** 
          ZoneManager Id. It can only contain string, is required field and should be unique.
        */

        _id: {
            type: String,
            unique: true,
            required: true
        },

        /** 
          Prefix. It can only contain string, and is required field.
        */

        prefix: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          First Name. It can only contain string, and is required field.
        */

        firstname: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Last Name. It can only contain string, and is required field.
        */

        lastname: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Phone. It can only contain string, and is required field.
        */

        phone: {
            type: String,
            required: true,
            validate: [validator.matches(constants.phoneRegex)]
        },

        /** 
          Email. It can only contain string, and is required field.
        */

        email: {
            type: String,
            unique: true,
            required: true,
            validate: [validator.matches(constants.eMailRegex)]
        },

         /** 
          Date Of Creation. It can only contain date, is required field..
        */

         dateOfCreation: {
            type: Date
        },

        /** 
          Prefered Language. It can only contain string.
        */

        preferedLanguage: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Zone. It can only contain string, and is required field.
        */

        zone: {
            type: String,
            ref: database.Zone,
            required: true,
            unique: true
        },

        /** 
          IsActive. It contain boolean for active user.
        */

        isActive: {
          type: Boolean,
          default: true
        },

        homeAddress: Address,

        officeAddress: Address
      });
    /** 
      getById. return the zonemanager object with the match their id from a userId.
      @param userId: userId of the user.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.getById = function(userId, callback) {
        this.findOne({
            _id: userId
        }).exec(callback);
    };

    /** 
      getById. return the zonemanager object with the match their id from a userId.
      @param userId: userId of the user.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.getByIdBasic = function(userId, callback) {
        this.findOne({
            _id: userId
        }).exec(callback);
    };

    /** 
      getByZone. return the zonemanager object with the match their id from a userId.
      @param userId: userId of the user.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.getByZone = function(zoneId, callback) {
        this.find({
            zone: zoneId
        }, callback);
    };

    /** 
      getAll. return the zonemanager object with the match their id from a userId.
      @param userId: userId of the user.
      @param callback: callback of this form.
    */

    ZoneManagerSchema.statics.getAllZoneManager = function(callback) {
        this.find({}, callback);
    };

    /** 
      saveLogisticAgent. save logisticagent with their request data.
      @param logisticAgent: contains value of requested data.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.createZoneManager = function(data, callback) {
        var zoneManager = new this(data);
        zoneManager.save(callback);
    };

    /** 
      update. save logisticagent with their request data.
      @param logisticAgent: contains value of requested data.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.updateZoneManager = function(zoneManager, callback) {
        zoneManager.save(callback);
    };

    /** 
      Remove. save zonemanager with their request data.
      @param zonemanager: contains value of requested data.
      @param callback: callback of this form.
    */
    ZoneManagerSchema.statics.removeZoneManager = function(userId, callback) {
        this.findOne({
            _id: userId
        }).remove(callback);
    };
    
    database.ZoneManager = database.model('zonemanager' , ZoneManagerSchema);
    ZoneManagerSchema.plugin(autoIncrement.plugin, {
      model: 'zoneManager',
      field: '_id'
    });
  }
    return database.ZoneManager;
};




/** export schema */
module.exports.getModel = getModel;