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
    constants = require('../Utility/constants').constants,
    Address = require('./address').Address;
var getModel;

/**
 * @module  Supplier
 * @description contain the details of Supplier
 */

getModel = function(database) {
    autoIncrement.initialize(database.connection);
    if (typeof database.Supplier === 'undefined') {
        var SupplierSchema = new database.Schema({

            /** 
              Supplier Id. It can only contain string, is required field and should be unique.
            */
            _id: {
                type: String,
                unique: true,
                required: true
            },

            supplierType: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Corporate Name. It can only contain string, is required field.
            */
            corporateName: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Zones. It can only contain string, and required field.
            */
            zones: [{
                type: String,
                ref: database.Zone,
                required: true
            }],

            /** 
              Legal form: Forme juridique. It can only contain string, is required field.
            */
            legalForm: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Siret. It can only contain string, is required field.
            */
            siret: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              n degree TVA. It can only contain string, is required field.
            */
            nDegreeTVAcode: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },


            address: Address,

            /** 
              Phone. It can only contain string, is required field.
            */
            phone: {
                type: String,
                required: true,
                validate: [validator.matches(constants.phoneRegex)]
            },

            workingTime: [{

                /** 
                  Day. It can only contain string.
                */
                day: [{
                    type: String,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                }],

                /** 
                  Opening time. It can only contain string, is required field.
                */
                openingTime: {
                    type: String
                },

                /** 
                  Closing time. It can only contain string, is required field.
                */
                closingTime: {
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
              Dayoff. It can only contain date.
            */
            dayOff: [{
                type: String
            }],

            exceptionalOpening: [{

                /** 
                  Time of opening. It can only contain string.
                */
                time: {
                    type: String
                },

                /** 
                  Date. It can only contain date.
                */
                date: {
                    type: String
                }

            }],

            /** 
              Date Of Creation. It can only contain date, is required field..
            */
            dateOfCreation: {
                type: Date
            }
        });

        SupplierSchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }, callback);
        };

        /** 
          getSupplierList. return the supplier object with the match their id from a userId.
          @param zoneId: zoneId of the user.
          @param callback: callback of this form.
        */
        SupplierSchema.statics.getSupplierByZone = function(zone, callback) {
            this.find({
                zones: zone
            }, callback);
        };

        /** 
          saveSupplier. save supplier with their request data.
          @param logisticAgent: contains value of requested data.
          @param callback: callback of this form.
        */
        SupplierSchema.statics.createSupplier = function(data, callback) {
            var supplier = new this(data);
            supplier.save(callback);
        };

        /** 
          update. save supplier with their request data.
          @param logisticAgent: contains value of requested data.
          @param callback: callback of this form.
        */
        SupplierSchema.statics.updateSupplier = function(supplier, callback) {
            supplier.save(callback);
        };

        /** 
          remove. return the zone object with the match their id from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        SupplierSchema.statics.removeSupplier = function(userId, callback) {
            this.find({
                _id: userId
            }).remove(callback);
        };

        database.Supplier = database.model('supplier', SupplierSchema);
        SupplierSchema.plugin(autoIncrement.plugin, {
            model: 'supplier',
            field: '_id'
        });

    }
    return database.Supplier;
};



// SupplierSchema.pre('save', function(next) {
//     this.dateOfCreation = new Date();
//     next();
// });



/** 
  getById. return the supplier object with the match their id from a userId.
  @param userId: userId of the user.
  @param callback: callback of this form.
*/


/** export schema */
module.exports.getModel = getModel;