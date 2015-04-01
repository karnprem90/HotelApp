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
 * @module  Product
 * @description contain the details of Product
 */

getModel = function(database) {
    autoIncrement.initialize(database.connection);
    if (typeof database.Product === 'undefined') {
        var ProductSchema = new database.Schema({

            /** 
               Product Id. It can only contain string, is required field and should be unique.
             */
            _id: {
                type: String,
                unique: true,
                required: true
            },

            productType: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            section: {
                type: String,
                required: true
            },

            categories: [{

                category: {
                    type: String,
                    required: true,
                    ref: database.CategoryModel,
                    index: true
                },

                subCategory: {
                    type: String,
                    required: true,
                    ref: database.SubCategory,
                    index: true
                }

            }],

            /** 
              Name. It can only contain string, is required field.
            */
            name: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Description. It can only contain string, is required field.
            */
            description: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            /** 
              Images. It can only contain string.
            */
            images: [{
                type: String
            }],

            /** 
              Zone. It can only contain string.
            */
            zones: [{
                type: String,
                ref: database.Zone,
                required: true
            }],

            /** 
              Warranty Condition. It can only contain string, is required field.
            */
            warrantyCondition: {
                type: String,
                required: true,
                validate:[validator.matches(constants.nameRegex)]
            },

            dimension: {

                /** 
                  width. It can only contain number.
                */
                width: {
                    type: Number
                },

                /** 
                  depth. It can only contain number.
                */
                depth: {
                    type: Number
                },

                /** 
                  height. It can only contain number.
                */
                height: {
                    type: Number
                },

                /** 
                  unit. It can only contain string.
                */
                unit: {
                    type: String,
                    validate:[validator.matches(constants.nameRegex)]
                }
            },

            weight: {
                /** 
                  value. It can only contain number.
                */
                value: {
                    type: Number
                },

                /** 
                  unit. It can only contain string.
                */
                unit: {
                    type: String,
                    validate:[validator.matches(constants.nameRegex)]
                }
            },

            /** 
              Supplier Id. It can only contain string, is required field.
            */
            supplierId: {
                type: String,
                ref: database.Supplier,
                required: true
            },

            /** 
              Cost Price. It can only contain Number, is required field.
            */
            costPrice: {
                type: Number,
                required: true
            },

            /** 
              Vat Percent. It can only contain Number.
            */
            vatPercent: {
                type: Number
            },

            /** 
              Retail Price. It can only contain Number.
            */
            retailPrice: {
                type: Number
            },

            /** 
              Stock. It can only contain Number.
            */
            stock: {
                type: Number
            },

            /** 
              Is Active. It can only contain Boolean.
            */
            isActive: {
                type: Boolean,
                default: true
            },

            dateOfCreation: {
                type: Date
            }

        });
        /** 
          saveProduct. save product with their request data.
          @param data: contains value of requested data.
          @param callback: callback of this form.
        */
        ProductSchema.statics.createProduct = function(data, callback) {
            var product = new this(data);
            product.save(callback);
        };

        /** 
          update. save product with their request data.
          @param product: contains value of requested data.
          @param callback: callback of this form.
        */
        ProductSchema.statics.updateProduct = function(product, callback) {
            product.save(callback);
        };

        /** 
          getById. return the product object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        ProductSchema.statics.getById = function(userId, callback) {
            this.findOne({
                _id: userId
            }, callback);
        };

        /** 
          getProductBySupplierId. return the admin object with the match their userId from a userId.
          @param userId: userId of the user.
          @param callback: callback of this form.
        */
        ProductSchema.statics.getProductBySupplierId = function(supplierId, callback) {
            this.find({
                supplierId: supplierId
            }, callback);
        };
        /** 
          removeById. return the product object with the match their userId from a userId.
          @param product: product of the user.
          @param callback: callback of this form.
        */
        ProductSchema.statics.removeById = function(productId, callback) {
            this.find({
                _id: productId
            }).remove(callback);
        };

        /** 
          getAllProduct. return the product object.
          @param callback: callback of this form.
        */
        ProductSchema.statics.getAllProduct = function(callback) {
            this.find({}, callback);
        };
        database.Product = database.model('product', ProductSchema);
        ProductSchema.plugin(autoIncrement.plugin, {
            model: 'product',
            field: '_id'
        });
    }
    return database.Product;
};




/** export schema */
module.exports.getModel = getModel;