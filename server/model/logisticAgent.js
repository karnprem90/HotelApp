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
  if(typeof database.LogisticAgent === 'undefined'){
    var LogisticAgentSchema = new database.Schema({

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
            Zones. It can only contain string, and is required field.
          */

          zones: [{
              type: String,
              ref: database.Zone,
              required: true
          }],

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
          },

          homeAddress: Address,

          officeAddress: Address
        });
          
           /** 
              Zones. Check validation for array object.
          */
          LogisticAgentSchema.path('zones').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i])){
                        return 0;
                    }
                }
                return 1;
          }, 'invalid alert zones');
          /** 
            getById. return the logisticagent object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.getById = function(userId, callback) {
              this.findOne({
                  _id: userId
              }, callback);
          };

          /** 
            getByZone. return the logisticagent object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.getByZone = function(zoneId, callback) {
              this.find({
                  zones: zoneId
              }, callback);
          };

          /** 
            getAll. return the logisticagent object with the match their id from a userId.
            @param userId: userId of the user.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.getAllLogisticAgent = function(callback) {
              this.find({}, callback);
          };


          /** 
            saveLogisticAgent. save logisticagent with their request data.
            @param logisticAgent: contains value of requested data.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.createLogisticAgent = function(data, callback) {
              var logisticAgent = new this(data);
              logisticAgent.save(callback);
          };

          /** 
            update. save logisticagent with their request data.
            @param logisticAgent: contains value of requested data.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.updateLogisticAgent = function(logisticAgent, callback) {
              logisticAgent.save(callback);
          };

          /** 
            remove. save logisticagent with their request data.
            @param logisticAgent: contains value of requested data.
            @param callback: callback of this form.
          */
          LogisticAgentSchema.statics.removeLogisticAgent = function(userId, callback) {
              this.findOne({
                  _id: userId
              }).remove(callback);
          };
           
           database.LogisticAgent = database.model('logisticAgent' , LogisticAgentSchema);
          LogisticAgentSchema.plugin(autoIncrement.plugin, {
              model: 'logisticAgent',
              field: '_id'
          });
  }
           return database.LogisticAgent;
};





module.exports.getModel = getModel;