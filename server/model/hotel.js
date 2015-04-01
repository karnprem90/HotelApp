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
  if( typeof database.Hotel === 'undefined'){
    var HotelSchema = new database.Schema({

        /** 
          Hotel Id. It can only contain string, is required field and should be unique.
        */

        _id: {
            type: String,
            unique: true,
            required: true
        },

        /** 
          Hotel Name. It can only contain string.
        */

        name: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Zone. It can only contain string.
        */

        zone: {
            type: String,
            ref: database.Zone,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Unit. It can only contain string.
        */

        unit: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Building. It can only contain string.
        */

        building: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Street. It can only contain string.
        */

        street: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          City. It can only contain string.
        */

        city: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Region. It can only contain string.
        */

        region: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Country. It can only contain string.
        */

        country: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Address Code Or Postal Code. It can only contain string.
        */

        addressCode: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Phone. It can only contain string.
        */

        telephone: {
            type: String,
            required: true,
            validate: [validator.matches(constants.phoneRegex)]
        },

        /** 
          Fax. It can only contain string.
        */

        fax: {
            type: String,
            required: true,
            validate: [validator.matches(constants.phoneRegex)]
        },

        /** 
          Email. It can only contain string.
        */

        email: {
            type: String,
            required: true,
            validate: [validator.matches(constants.eMailRegex)]
        },

        /** 
          Category. It can only contain string.
        */

        category: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Rooms.These are the list of rooms hotel has. It can only contain string.
        */

        rooms: {
            type: [String],
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Business Value. It can only contain string.
        */

        businessValue: {
            type: Number
        },



        /** 
          Contracted Rooms. It can only contain string.
        */

        contractedRooms: [{

            /** 
              Room number which is covered under contract. It can only contain string.
            */

            room: {
                type: String
            },

            /** 
              Tablet Id of installed tablet in a room. It can only contain string.
            */

            tabletId: {
                type: String,
                ref: database.Tablet
            },

            /** 
              Tablet Status of installed tablet in a room. It can only contain string.
            */

            tabletStatus: {
                type: String
            }
        }],

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
              Contractedrooms room. Check validation for array object.
          */
          HotelSchema.path('contractedRooms').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].room)){
                        return 0;
                    }
                }
                return 1;
          }, 'invalid alert Contractedrooms room');

          /** 
              Contractedrooms tabletStatus. Check validation for array object.
          */
          HotelSchema.path('contractedRooms').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].tabletStatus)){
                        return 0;
                    }
                }
                return 1;
          }, 'invalid alert Contractedrooms tabletStatus');

          /** 
            getById. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          HotelSchema.statics.getById = function(userId, callback) {
              this.findOne({
                  _id: userId
              }, callback);
          };

          /** 
            remove. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          HotelSchema.statics.removeHotel = function(userId, callback) {
              this.find({
                  _id: userId
              }).remove(callback);
          };

          /** 
            getByZone. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          HotelSchema.statics.getByZone = function(zone, callback) {
              this.find({
                  zone: zone
              }, callback);
          };


          /** 
            getAll. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          // HotelSchema.statics.getAll = function(callback) {
          //     this.find({}, callback);
          // };


          /** 
            saveZone. save zone with their request data.
            @param zone: contains value of requested data.
            @param callback: callback of this form.
          */
          HotelSchema.statics.createHotel = function(data, callback) {
              var hotel = new this(data);
              hotel.save(callback);
          };

          /** 
            saveZone. save zone with their request data.
            @param zone: contains value of requested data.
            @param callback: callback of this form.
          */
          HotelSchema.statics.updateHotel = function(hotel, callback) {
              hotel.save(callback);
          };

          database.Hotel = database.model('hotel' , HotelSchema);
          HotelSchema.plugin(autoIncrement.plugin, {
            model: 'hotel',
            field: '_id'
          });

  }
          return database.Hotel;
};







/** export schema */
module.exports.getModel = getModel;
   