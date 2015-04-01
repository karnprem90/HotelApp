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
 * @module Hotel User
 * @description contain the details of Hotel User
 */
getModel = function(database){
  autoIncrement.initialize(database.connection);
  if(typeof database.HotelUser === 'undefined'){
      var HotelUserSchema = new database.Schema({

        /** 
          Hotel User Id. It can only contain string, is required field and should be unique.
        */

        _id: {
            type: String,
            unique: true,
            required: true
        },

        /** 
          Prefix. It can only contain string.
        */

        prefix: {
            type: String,
            required: true,

        },

        /** 
          First Name. It can only contain string.
        */

        firstname: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Last Name. It can only contain string.
        */

        lastname: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Title Or Designation. It can only contain string.
        */

        title: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Phone. It can only contain string.
        */

        phone: {
            type: String,
            required: true,
            validate: [validator.matches(constants.phoneRegex)]
        },

        /** 
          Email. It can only contain string.
        */

        email: {
            type: String,
            unique: true,
            required: true,
            validate: [validator.matches(constants.eMailRegex)]
        },


        /** 
          Zone. It can only contain string, and is required field.
        */

        zone: {
            type: String,
            ref: database.Zone,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Hotel. It can only contain string, and is required field.
        */

        hotel: {
            type: String,
            ref: database.Hotel,
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

        
        /** 
        Prefered Language. It can only contain string.
       */

        preferedLanguage: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        }
    });

        /** 
          getById. return the hotel user object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }, callback);
        };

        /** 
          saveHotelUser. save HotelUser with their request data.
          @param hotelManager: contains value of requested data.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.createHotelUser = function(data, callback) {
            var hotelUser = new this(data);
            hotelUser.save(callback);
        };

        /** 
          getByZoneId. return the hotel manager object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.getHotelUserListByZone = function(zoneId, callback) {
            this.find({
                zone: zoneId
            }, callback);
        };

        /** 
          getByZoneIdHotelId. return the hotelmanager object with the match their zoneId and hotelId.
          @param zoneId: zoneId of the hotel.
          @param hotelId: hotelId of the hotel.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.getByZoneIdHotelId = function(zoneId, hotelId, callback) {
            this.findOne({
                'zone': zoneId,
                'hotel': hotelId
            }, callback);
        };

        /** 
          getAll. return the zone object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.getAllHotelUser = function(hotelId,callback) {
            this.find({
                hotel:hotelId
            }, callback);
        };
        /** 
          update. save HotelUser with their request data.
          @param hotelManager: contains value of requested data.
          @param callback: callback of this form.
        */
        HotelUserSchema.statics.updateHotelUser = function(hotelUser, callback) {
            hotelUser.save(callback);
        };
        
         database.HotelUser = database.model('hotelUser', HotelUserSchema);
        HotelUserSchema.plugin(autoIncrement.plugin, {
          model: 'hotelUser',
          field: '_id'
        });

  }
        return database.HotelUser;
};





/** export schema */
module.exports.getModel = getModel;