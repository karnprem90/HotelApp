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
    if (typeof database.CategoryModel === 'undefined') {
        var CategorySchema = new database.Schema({
            /** 
                Category Id. It can only contain string, is required field and should be unique.
            */

            _id: {
                type: String,
                unique: true,
                required: true
            },


            categoryNames: [{

                name: {
                    type: String,
                    required: true
                },

                language: {
                    type: String,
                    required: true
                }
            }],

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
            Category Name. Check validation for array object.
        */
        CategorySchema.path('categoryNames').validate(function(data){
            for(var i = 0; i < data.length; i++){
                if(!constants.nameRegex.test(data[i].name)){
                    return 0;
                }
            }
            return 1;
        }, 'invalid alert category name');

        /** 
            Category Language. Check validation for array object.
        */
        CategorySchema.path('categoryNames').validate(function(data){
            for(var i = 0; i < data.length; i++){
                if(!constants.nameRegex.test(data[i].language)){
                    return 0;
                }
            }
            return 1;
        }, 'invalid alert category language');

        /**

          getAllCategory. return the category object .
          @param callback: callback of this form.
        */

        CategorySchema.statics.getAllCategory = function(callback) {
            this.find({}, callback);
        };

        /** 
          saveCategory. save category with their request data.
          @param category: contains value of requested data.
          @param callback: callback of this form.
        */
        CategorySchema.statics.createCategory = function(data, callback) {
            var category = new this(data);
            category.save(callback);
        };

        database.CategoryModel = database.model('category', CategorySchema);

        CategorySchema.plugin(autoIncrement.plugin, {
            model: 'category',
            field: '_id'
        });
    }

    return database.CategoryModel;
};




/** export schema */
module.exports.getModel = getModel;