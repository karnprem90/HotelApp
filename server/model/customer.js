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
 * @module Customer
 * @description contain the details of Customer
 */

getModel = function (database){
  autoIncrement.initialize(database.connection);
  if(typeof database.CustomerModel === 'undefined'){
      var CustomerSchema = new database.Schema({

        /** 
          Customer Id. It can only contain string, is required field and should be unique.
        */

        _id: {
            type: String,
            unique: true,
            required: true
        },

        /** 
          Prefix. It can only contain string, is required field.
        */

        prefix: {
            type: String,
            required: true
        },

        /** 
          First Name. It can only contain string, is required field.
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
            validate:[validator.matches(constants.nameRegex)]
        },

        /** 
          Gender. It can only contain string, is required field.
        */

        gender: {
            type: String,
            enum: ['Male', 'Female', 'Others'],
            required: true
        },

        /** 
          Phone. It can only contain string and is required field.
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
          Date of birth. It can only contain string.
        */

        dob: {
            type: String
        },

        /** 
          Nationality. It can only contain string.
        */

        nationality: {
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
          Address. It stores address information.
        */

        address: Address,

        /** 
          Prefered Langugae. It can only contain string and is rquired field.
        */

        preferedLanguage: {
            type: String,
            required: true,
            validate:[validator.matches(constants.nameRegex)]
        },
        /** 
          Business Value. It can only contain string.
        */

        businessValue: {
            type: Number,
        },
            
        /** 
          History. It stores the information about previous stay.
        */

        history: [{

            /** 
              Stay Start Date. It only containd date type.
            */

            stayStartDate: {
                type: String
            },

            /** 
              Stay End Date. It only containd date type.
            */

            stayEndDate: {
                type: String
            },

            /** 
              Zone Id. It can only contain string.
            */

            zoneId: {
                type: String,
                ref: database.Zone
            },

            /** 
              Hotel Id. It can only contain string.
            */

            hotelId: {
                type: String
            },

            /** 
              Room. It can only contain string.
            */

            room: {
                type: String
            }

        }],

        currentStay: {

            /** 
              Stay Start Date. It only containd date type.
            */

            stayStartDate: {
                type: Date
            },

            /** 
              Expected Stay Start Date. It only containd date type.
            */

            expectedStayEndDate: {
                type: Date
            },

            /** 
              Zone Id. It can only contain string and reference to zone.
            */

            zoneId: {
                type: String,
                ref: database.Zone,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Hotel Id. It can only contain string.
            */

            hotelId: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Room. It can only contain string.
            */

            room: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Cart. It contain array of product id.
            */

            cart: {
                type: [String],
                ref: database.Product
            },

            /** 
              Cart. It contain boolean for active user.
            */

            isActive: {
              type: Boolean,
              default: true
            }
          }
      });
            /** 
                History zone id. Check validation for array object.
            */
            CustomerSchema.path('history').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].zoneId)){
                        return 0;
                    }
                }
                return 1;
            }, 'invalid alert history zoneid');

            /** 
                History hotelId. Check validation for array object.
            */
            CustomerSchema.path('history').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].hotelId)){
                        return 0;
                    }
                }
                return 1;
            }, 'invalid alert history hotelId');

            /** 
                History room. Check validation for array object.
            */
            CustomerSchema.path('history').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].room)){
                        return 0;
                    }
                }
                return 1;
            }, 'invalid alert history room');
            
            /** 
              getById. return the customer object with the match their userId from a userId.
              @param userId: userId of the user.
              @param callback: callback of this form.
            */
            CustomerSchema.statics.getById = function(userId, callback) {
                this.findOne({
                    '_id': userId
                }, callback);
            };

            /** 
              getById. return the customer object with the match their userId from a userId.
              @param userId: userId of the user.
              @param callback: callback of this form.
            */
            CustomerSchema.statics.getAllCustomer = function(callback) {
                this.find({}, callback);
            };

            /** 
              save. save Customer with their request data.
              @param customer: contains value of requested data.
              @param callback: callback of this form.
            */
            CustomerSchema.statics.createCustomer = function(data, callback) {
                var customer = new this(data);
                customer.save(callback);
            };

            /** 
              update. update Customer with their request data.
              @param customer: contains value of requested data.
              @param callback: callback of this form.
            */
            CustomerSchema.statics.updateCustomer = function(customer, callback) {
                customer.save(callback);
            };

            /** 
              Remove  customer with their request data.
              @param customer: contains value of requested data.
              @param callback: callback of this form.
            */
            CustomerSchema.statics.removeCustomer = function(userId, callback) {
                this.findOne({
                    _id: userId
                }).remove(callback);
            };

            

            database.CustomerModel = database.model('customer', CustomerSchema); 
            CustomerSchema.plugin(autoIncrement.plugin, {
              model: 'customer',
              field: '_id'
            });

  }
            return database.CustomerModel;
};

            


/** export schema */
module.exports.getModel = getModel;