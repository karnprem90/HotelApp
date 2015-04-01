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
 * @class Addresses
 * @classdesc timestamp class contains the timestamp details
 */
var address = {

    /** 
      Unit. It can only contain string.
    */

    unit: {
        type: String
    },

    /** 
      Building. It can only contain string.
    */

    building: {
        type: String
    },

    /** 
      Street. It can only contain string.
    */

    street: {
        type: String
    },

    /** 
      City. It can only contain string.
    */

    city: {
        type: String
    },

    /** 
      Region. It can only contain string.
    */

    region: {
        type: String
    },

    /** 
      Country. It can only contain string.
    */

    country: {
        type: String
    },

    /** 
      Address Code Or Postal Code. It can only contain string.
    */

    addressCode: {
        type: String
    }
};


module.exports = {
    Address: address
};