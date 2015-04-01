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
    autoIncrement = require('mongoose-auto-increment'),
    constants = require('../Utility/constants').constants;
var getModel;
/**
 * @module  Tablet
 * @description contain the details of Executive Manager
 */

getModel = function  (database) {
  autoIncrement.initialize(database.connection);
    if(typeof database.Tablet == 'undefined'){
        var TabletSchema = new database.Schema({

            /** 
              Tablet Id. It can only contain string, is required field and should be unique.
            */

            _id: {
                type: String,
                unique: true,
                required: true
            },

            /** 
              MacAddress. It can only contain string, and is required field.
            */

            macAddress: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Fabricant. It can only contain string, and is required field.
            */

            fabricant: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Model. It can only contain string, and is required field.
            */

            model: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              SerialNumber. It can only contain string, and is required field.
            */

            serialNumber: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              PartNumber. It can only contain string, and is required field.
            */

            partNumber: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              OSVersion. It can only contain string.
            */

            osVersion: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              SoftwareVersion. It can only contain string.
            */

            softwareVersion: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              BatchProd. It can only contain string.
            */

            batchProd: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },
           

            /** 
              WarrantyBeginning. It can only contain date.
            */

            warrantyBeginning: {
                type: Date
            },

            /** 
              WarrantyDuration. It can only contain string.
            */

            warrantyDuration: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },


            /** 
              PointDeliveryDate. It can only contain date.
            */

            pointDeliveryDate: {
                type: Date
            },


            /** 
              FunctionalStatus. It can only contain string.
            */

            functionalStatus: {
                type: String,
                enum: ['OK', 'OK-' , 'N-OK' , 'HS' , 'NA']
            },

             /** 
              LifeCycle Status. It can only contain string and enum value.
            */

            lifecycleStatus: {
                type: String,
                enum: ['InStock', 'Reserved' , 'Shipment' , 'Deployed' , 'EndOfLife']
            },
         
             /** 
              OwnerShip. It can only contain date.
            */

            ownerShip: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

             /** 
              AccountIncharge. It can only contain string.
            */

            accountIncharge: {
                type: String,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Date Of Creation. It can only contain date, is required field..
            */

             dateOfCreation: {
                type: Date
            }
        });

        /** 
          saveTablet. save HotelManager with their request data.
          @param supplierUser: contains value of requested data.
          @param callback: callback of this form.
        */

        TabletSchema.statics.createTablet = function(data, callback) {
          var tabletData = new this(data);
          tabletData.save(callback);
        };

        /** 
          getAll. return the tablet object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        TabletSchema.statics.getTabletList = function(callback) {
            this.find({}, callback);
        };
            database.Tablet = database.model('tablet' , TabletSchema);
            TabletSchema.plugin(autoIncrement.plugin, {
              model: 'tablet',
              field: '_id'
            });
    }
           return database.Tablet;
}



module.exports.getModel = getModel; 