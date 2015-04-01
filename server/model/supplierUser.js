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
 * @module Hotel Manager
 * @description contain the details of Hotel Manager
*/

getModel = function(database){
  autoIncrement.initialize(database.connection);
  if(typeof database.SupplierUser === 'undefined'){
      var SupplierUserSchema = new database.Schema({

        /** 
          Supplier Manager Id. It can only contain string, is required field and should be unique.
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
          supplier. It can only contain string, and is required field.
        */

        supplier: {
            type: String,
            ref: database.Supplier,
            required: true
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
          getById. return the hotel manager object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        SupplierUserSchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }).populate('supplier').exec(callback);
        };

        SupplierUserSchema.statics.getBySupplier = function(supplier, callback) {
            this.find({
                supplier: supplier
            }).exec(callback);
        };

        /** 
          getById. return the hotel manager object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        SupplierUserSchema.statics.getByIdBasic = function(userId, callback) {
            this.findOne({
                _id: userId
            }).exec(callback);
        };

        /** 
          saveSupplierUser. save HotelManager with their request data.
          @param supplierUser: contains value of requested data.
          @param callback: callback of this form.
        */
        SupplierUserSchema.statics.createSupplierUser = function(data, callback) {
          var supplierUser = new this(data);
          supplierUser.save(callback);
        };

        /** 
          update with their request data.
          @param supplierUser: contains value of requested data.
          @param callback: callback of this form.
        */
        SupplierUserSchema.statics.updateSupplierUser = function(supplierUser, callback) {
            supplierUser.save(callback);
        };

        /** 
          remove. return the zone object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        SupplierUserSchema.statics.removeSupplierUser = function(userId, callback) {
            this.find({
                _id: userId
            }).remove(callback);
        };
  
        database.SupplierUser = database.model('supplierUser', SupplierUserSchema);
        SupplierUserSchema.plugin(autoIncrement.plugin, {
          model: 'supplierUser',
          field: '_id'
        });
  }
        return database.SupplierUser;
};






/** export schema */
module.exports.getModel = getModel;