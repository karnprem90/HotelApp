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
 * @module  Category
 * @description contain the details of Category
 */

getModel = function(database) {
    autoIncrement.initialize(database.connection);
    if (typeof database.SubCategory === 'undefined') {

        var SubCategorySchema = new database.Schema({
            _id: {
                type: String,
                unique: true,
                required: true
            },

            subCategoryName: [{

                name: {
                    type: String,
                    required: true
                },

                language: {
                    type: String,
                    required: true
                }
            }],

            category: {
                type: String,
                required: true,
                ref: database.CategoryModel
            },

            dateOfCreation: {
                type: Date
            },

            
          /** 
            Is Active. It can only contain Boolean.
          */
          isActive: {
              type: Boolean,
              default: true
          }
          
        });

         /** 
              subCategoryName name. Check validation for array object.
          */
          SubCategorySchema.path('subCategoryName').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].name)){
                        return 0;
                    }
                }
                return 1;
          }, 'invalid alert subCategoryName name');

         /** 
              subCategoryName language. Check validation for array object.
          */
          SubCategorySchema.path('subCategoryName').validate(function(data){
                for(var i = 0; i < data.length; i++){
                    if(!constants.nameRegex.test(data[i].language)){
                        return 0;
                    }
                }
                return 1;
          }, 'invalid alert subCategoryName language');

        /**

          getById. return the category object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        SubCategorySchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }, callback);
        };

        /**

          getAllCategory. return the category object .
          @param callback: callback of this form.
        */

        SubCategorySchema.statics.getAllSubCategory = function(callback) {
            this.find({}, callback);
        };

        SubCategorySchema.statics.getByCategory = function(category, callback) {
            this.find({
                category: category
            }, callback);
        };

        SubCategorySchema.statics.updateSubCategory = function(subcategory, callback) {
            subcategory.save(callback);
        };
        /** 
          update. save category with their request data.
          @param category: contains value of requested data.
          @param callback: callback of this form.
        */
        // CategorySchema.statics.update = function(category, callback) {
        //     category.save(callback);
        // };

        /** 
          saveCategory. save category with their request data.
          @param category: contains value of requested data.
          @param callback: callback of this form.
        */
        SubCategorySchema.statics.createSubCategory = function(data, callback) {
            var subCategory = new this(data);
            subCategory.save(callback);
        };
        
        database.SubCategory = database.model('subCategory', SubCategorySchema);
        SubCategorySchema.plugin(autoIncrement.plugin, {
            model: 'subCategory',
            field: '_id'
        });
    }
    return database.SubCategory;
};




/** export schema */
module.exports.getModel = getModel;