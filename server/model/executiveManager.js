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
 * @module  Executive Manager
 * @description contain the details of Executive Manager
 */
getModel = function(database){
  autoIncrement.initialize(database.connection);
  if(typeof database.ExecutiveManager === 'undefined'){
      var ExecutiveManagerSchema = new database.Schema({

        /** 
          ExecutiveManager Id. It can only contain string, is required field and should be unique.
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
            required: true
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
          Prefered Language. It can only contain string.
        */

        preferedLanguage: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Date Of Creation. It can only contain date, is required field..
        */

         dateOfCreation: {
            type: Date
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
          saveExecutiveManager. save ExecutiveManager with their request data.
          @param executiveManager: contains value of requested data.
          @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.createExecutiveManager = function(data, callback) {
            var executiveManager = new this(data);
            executiveManager.save(callback);
        };

        /** 
          update. save ExecutiveManager with their request data.
          @param executiveManager: contains value of requested data.
          @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.updateExecutiveManager = function(executiveManager, callback) {
            executiveManager.save(callback);
        };


        /** 
          getById. return the executiveManager object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.getById = function(userId, callback) {
            this.findOne({
                '_id': userId
            }, callback);
        };


        /** 
          getAll. return the executiveManager object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.getAllExecutiveManager = function(callback) {
            this.find({}, callback);
        };

        /** 
          getAll. return the executiveManager object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.getAllEmailExecutiveManager = function(callback) {
            this.find({},{email:1}, callback);
        };

        /** 
            remove. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
        */
        ExecutiveManagerSchema.statics.removeExecutiveManager = function(userId, callback) {
            this.find({
                _id: userId
            }).remove(callback);
        };

        database.ExecutiveManager = database.model('executiveManager', ExecutiveManagerSchema);
        ExecutiveManagerSchema.plugin(autoIncrement.plugin, {
          model: 'executiveManager',
          field: '_id'
        });


  }

        return database.ExecutiveManager;
};




/** export schema */
module.exports.getModel = getModel;