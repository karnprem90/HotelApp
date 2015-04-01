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
 * Created by ldebarros on 02/03/15.
 */
var constants = {
    eMailRegex : /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
    phoneRegex : /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i,
    nameRegex : /^[a-zA-Z0-9\s]+$/,
    kDuplicateKeyError : 11000,
    kDuplicateKeyErrorForMongoDBv2_1_1 : 11001,
    successMessage: 'Success'
};
 
exports.constants = constants;

/* phoneRegex matches:

(+351) 282 43 50 50
90191919908
555-8909
001 6867684
001 6867684x1
1 (234) 567-8901
1-234-567-8901 x1234
1-234-567-8901 ext1234
1-234 567.89/01 ext.1234
1(234)5678901x1234
(123)8575973
(0055)(123)8575973

*/