'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * 
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

var languages = require('language-list')(),
    countries = require('country-list')();

 /**Helper function for update*/
exports.updateHelper = function(requestData, originalData) {
    for (var req in requestData) {
        if (requestData[req] === ' ') {
            originalData[req] = ' ';
        } else {
            originalData[req] = requestData[req];
        }
    }
};

exports.getCountryList = function() {
    return function(request, reply) {
        return reply(countries.getData());
    };
};

exports.getLanguageList = function() {
    return function(request, reply) {
        return reply(languages.getData());
    };
};