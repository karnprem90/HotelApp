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
var validator = require('mongoose-validators'),
    constants = require('../Utility/constants').constants;
     
var getModel;

/**
 * @module  User
 * @description contain the details of User
*/

getModel = function(database){
  if(typeof database.User === 'undefined'){
    var UserSchema = new database.Schema({

      /** 
        User ID. It can only contain string, is required and unique field which is indexed.
      */
      userId: {
          type: String,
          required: true
      },

      /**
        User Name. It can only contain string, is required field and should be unique.
      */
      username: {
          type: String,
          unique: true,
          required: true,
          validate: [validator.matches(constants.eMailRegex)]
      },

      /** 
        Password. It stores hashed password, is required field.
      */
      password: {
          type: String,
          required: true
      },

      /** 
          IsActive. It contain boolean for active user.
      */

      isActive: {
        type: Boolean,
        default: true
      },

      /** 
        Scope. It can only contain string, is required field, and should have value from enum array.
      */
      scope: {
          type: String,
          enum: ['Admin', 'Customer', 'SupplierManager', 'SupplierUser', 'LogisticAgent', 'ZoneManager', 'HotelManager', 'HotelUser', 'ExecutiveManager'],
          required: true
      }
    });


        /** 
          getByName. return the user object with the match their username from a username.
          @param username: username of the user.
          @param callback: callback of this form.
        */
        UserSchema.statics.getByUserName = function(username, callback) {
            this.findOne({
                username: username
            }, callback);
        };

        /** 
          getById. return the user object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        UserSchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }, callback);
        };

        /** 
          getByScope. return the user object with the match their scope from a findByScope.
          @param scope: scope of the user.
          @param callback: callback of this form.
        */
        UserSchema.statics.getByScope = function(scope, callback) {
            this.find({
                scope: scope
            }, callback);
        };

        /** 
          create. create user with their request data.
          @param data: contains value of requested data.
          @param callback: callback of this form.
        */
        UserSchema.statics.createUser = function(data, callback) {
            var user = new this(data);
            user.save(callback);
        };

        /** 
          update. save admin with their request data.
          @param administrator: contains value of requested data.
          @param callback: callback of this form.
        */
        UserSchema.statics.updateUser = function(user, callback) {
            user.save(callback);
        };

        /** 
          remove. return the zone object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        UserSchema.statics.removeUser = function(userId, callback) {
            this.find({
                _id: userId
            }).remove(callback);
        };
         
         database.User = database.model('user' ,UserSchema);
  }
         return database.User;
};


module.exports.getModel = getModel;