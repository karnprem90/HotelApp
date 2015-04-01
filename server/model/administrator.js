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
 
/**
 * @module  Administrator
 * @description contain the details of Administrator
 */
var autoIncrement = require('mongoose-auto-increment'),
    validator = require('mongoose-validators'),
    constants = require('../Utility/constants').constants;
var getModel;
/**
  * @module  Administrator
  * @description contain the details of Administrator  
*/

getModel = function(database){
    autoIncrement.initialize(database.connection);
  if(typeof database.AdministratorModel === 'undefined'){
      var AdministratorSchema = new database.Schema({

          /** 
            Admin Id. It can only contain string, is required field and should be unique.
          */

          _id: {
              type: String,
              unique: true,
              required: true
          },

          
          /** 
            Alert Email. Stores one or more string type.
          */

          alertEmail: [{
              type: String
          }],
          /** 
            Alert Phone. Stores one or more string type.
          */

          alertPhone: [{
              type: String
          }]
      });

          /** 
            Alert Email. Check validation for array object.
          */
          AdministratorSchema.path('alertEmail').validate(function(data){
               for(var i = 0; i < data.length; i++){
                    if(!constants.eMailRegex.test(data[i])){
                       return 0;
                    }
              }
              return 1;
          }, 'invalid alert email');

          /** 
            Alert Phone. Check validation for array object.
          */
          AdministratorSchema.path('alertPhone').validate(function(data){
               for(var i = 0; i < data.length; i++){
                    if(!constants.phoneRegex.test(data[i])){
                       return 0;
                    }
              }
              return 1;
          }, 'invalid alert phone');

        /** 
          saveAdmin. save admin with their request data.
          @param administrator: contains value of requested data.
          @param callback: callback of this form.
        */
          AdministratorSchema.statics.createAdmin= function(data, callback) {
              var administrator = new this(data);
              administrator.save(callback);
          };

          /** 
            update. save admin with their request data.
            @param administrator: contains value of requested data.
            @param callback: callback of this form.
          */
          AdministratorSchema.statics.updateAdmin = function(administrator, callback) {
              administrator.save(callback);
          };

          /** 
            getById. return the admin object with the match their userId from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          AdministratorSchema.statics.getById = function(userId, callback) {
              this.findOne({
                  _id: userId
              }, callback);
          };

          /** 
            remove. return the zone object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          AdministratorSchema.statics.removeAdmin = function(userId, callback) {
              this.find({
                  _id: userId
              }).remove(callback);
          };
        
          database.AdministratorModel = database.model('administrator', AdministratorSchema);
          AdministratorSchema.plugin(autoIncrement.plugin, {
          model: 'administrator',
          field: '_id'
         });
  }
      return database.AdministratorModel;
};




/** export schema */
module.exports.getModel = getModel;